import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

interface GeneratePDFCfg {
	background_color?: string;
	width?: number;
	orientation?: "portrait" | "p" | "l" | "landscape";
	unit?: "mm" | "pt" | "px" | "in" | "cm" | "ex" | "em" | "pc";
	format?: string;
	name: string;
	margin?: number;
	overlap_mm?: number;
}
function get_cutoff_element_hierarchy(
	page_element: HTMLElement
): HTMLElement[] {
	// Get the page's boundaries
	const page_rect = page_element.getBoundingClientRect();

	// Check if an element is cut off from the page
	function is_element_cutoff_from_page(element: HTMLElement): boolean {
		const element_rect = element.getBoundingClientRect();
		return (
			element_rect.bottom > page_rect.bottom ||
			element_rect.right > page_rect.right ||
			element_rect.left < page_rect.left ||
			element_rect.top < page_rect.top
		);
	}

	// Find the first cut off parent element
	let first_cutoff_parent: HTMLElement | null = null;

	function find_cutoff_element(element: HTMLElement): HTMLElement | null {
		if (is_element_cutoff_from_page(element)) {
			return element;
		}

		const children = Array.from(element.children) as HTMLElement[];

		for (const child of children) {
			const cut_off_child = find_cutoff_element(child);
			if (cut_off_child) {
				return cut_off_child;
			}
		}

		return null;
	}

	// Start the search with direct children of the page
	const direct_children = Array.from(page_element.children) as HTMLElement[];

	for (const child of direct_children) {
		const cut_off_element = find_cutoff_element(child);
		if (cut_off_element) {
			first_cutoff_parent = cut_off_element;
			break;
		}
	}

	if (!first_cutoff_parent) {
		return []; // No cut off elements found
	}

	// Find the deepest cut off child within the parent
	let deepest_cutoff_child: HTMLElement | null = null;
	let element_path: HTMLElement[] = [];

	function find_deepest_cutoff_child(
		element: HTMLElement,
		current_path: HTMLElement[]
	): HTMLElement[] {
		const children = Array.from(element.children) as HTMLElement[];

		// If this element has no children or if element is a box, return current path
		if (
			children.length === 0 ||
			element.classList.contains("pdf-box") ||
			element.classList.contains("pdf-boxup")
		) {
			if (is_element_cutoff_from_page(element)) {
				return current_path;
			}
			return [];
		}

		// Try to find cut off children
		for (const child of children) {
			if (is_element_cutoff_from_page(child)) {
				// Try to go deeper
				const deeper_path = find_deepest_cutoff_child(child, [
					...current_path,
					child,
				]);
				if (deeper_path.length > 0) {
					return deeper_path;
				}
				// No deeper cut off elements, return this one
				return [...current_path, child];
			}
		}

		// Check deeper even if direct children aren't cut off
		for (const child of children) {
			const deeper_path = find_deepest_cutoff_child(child, [
				...current_path,
				child,
			]);
			if (deeper_path.length > 0) {
				return deeper_path;
			}
		}

		return [];
	}

	// Start path with the first cut off parent
	element_path = find_deepest_cutoff_child(first_cutoff_parent, [
		first_cutoff_parent,
	]);

	// If we found a path but it doesn't include the first_cutoff_parent, add it
	if (element_path.length > 0 && element_path[0] !== first_cutoff_parent) {
		element_path.unshift(first_cutoff_parent);
	}

	// Filter the path to ensure we only get from first_cutoff_child to first_cutoff_parent
	// and not elements above first_cutoff_parent
	return element_path;
}

function extract_cutoff_elements(
	cutoff_child: HTMLElement,
	parent_hierarchy: HTMLElement[],
	page_element: HTMLElement
): {
	removed_elements: HTMLElement[];
	pdf_outline_hierarchy: HTMLElement[];
} {
	const removed_elements: HTMLElement[] = [];
	let highest_removed_element: HTMLElement | null = null;

	// Collect PDF outline hierarchy BEFORE removing elements
	const pdf_outline_hierarchy: HTMLElement[] = [];

	// Helper function to collect elements in DOM order before removal
	function collect_element_and_subsequent_siblings(
		element: HTMLElement
	): HTMLElement[] {
		const elements_to_remove: HTMLElement[] = [];
		const parent = element.parentElement;
		if (!parent) return elements_to_remove;

		const siblings = Array.from(parent.children) as HTMLElement[];
		const element_index = siblings.indexOf(element);

		// Collect the element and all subsequent siblings in DOM order
		for (let i = element_index; i < siblings.length; i++) {
			elements_to_remove.push(siblings[i]);
		}

		// Track the highest element (which would be this one if not set yet)
		if (!highest_removed_element) {
			highest_removed_element = element;
		}

		// Collect subsequent siblings of ancestors in DOM order
		collect_subsequent_siblings_up_tree(parent, elements_to_remove);

		return elements_to_remove;
	}

	// Helper function to cascade collection up the tree
	function collect_subsequent_siblings_up_tree(
		element: HTMLElement,
		collection: HTMLElement[]
	): void {
		const parent = element.parentElement;
		if (!parent) return;

		const siblings = Array.from(parent.children) as HTMLElement[];
		const element_index = siblings.indexOf(element);

		// Collect all subsequent siblings in DOM order
		for (let i = element_index + 1; i < siblings.length; i++) {
			collection.push(siblings[i]);
		}

		// Continue up the tree
		if (parent.parentElement) {
			collect_subsequent_siblings_up_tree(parent, collection);
		}
	}

	// Helper function to actually remove elements after collection
	function remove_elements(elements: HTMLElement[]): void {
		// Remove elements from DOM (in reverse order to maintain indices)
		for (let i = elements.length - 1; i >= 0; i--) {
			if (elements[i].parentElement) {
				elements[i].parentElement?.removeChild(elements[i]);
			}
		}
	}

	// Check if cutoff_child has pdf-boxup class
	if (cutoff_child.classList.contains("pdf-boxup")) {
		// Find the last parent with pdf-container class
		const pdf_container = parent_hierarchy.findLast((parent) =>
			parent.classList.contains("pdf-container")
		);
		// If found, check if it has pdf_containerup class
		if (pdf_container && pdf_container.parentElement) {
			let target_element: HTMLElement;

			// If pdf_container has pdf_containerup class, target its parent
			if (
				pdf_container.classList.contains("pdf-containerup") &&
				pdf_container.parentElement.parentElement
			) {
				target_element = pdf_container.parentElement;
				highest_removed_element = target_element;
			} else {
				target_element = pdf_container;
				highest_removed_element = pdf_container;
			}

			// First collect all elements to remove in DOM order
			const elements_to_remove =
				collect_element_and_subsequent_siblings(target_element);

			// Add them to the result list in DOM order
			removed_elements.push(...elements_to_remove);

			if (highest_removed_element) {
				// Store the original hierarchy from page to highest element
				let current: HTMLElement | null = highest_removed_element;
				const full_hierarchy: HTMLElement[] = [];

				while (current && current !== page_element) {
					full_hierarchy.unshift(current);
					current = current.parentElement;
				}

				// Filter to only pdf-outline elements
				pdf_outline_hierarchy.push(
					...full_hierarchy.filter((el) =>
						el.classList.contains("pdf-outline")
					)
				);
			}

			// Then remove them from the DOM
			remove_elements(elements_to_remove);
		}
	} else {
		// Get the page's boundaries
		const page_rect = page_element.getBoundingClientRect();

		// Function to check if element is cut off from page
		function is_element_cutoff_from_page(element: HTMLElement): boolean {
			const element_rect = element.getBoundingClientRect();
			return (
				element_rect.bottom > page_rect.bottom ||
				element_rect.right > page_rect.right ||
				element_rect.left < page_rect.left ||
				element_rect.top < page_rect.top
			);
		}

		// Get parent of cutoff_child
		const parent = cutoff_child.parentElement;
		if (!parent) return { removed_elements: [], pdf_outline_hierarchy: [] };

		// Get all siblings of cutoff_child
		const siblings = Array.from(parent.children) as HTMLElement[];

		// Find cutoff elements and cascade up
		for (const sibling of siblings) {
			if (is_element_cutoff_from_page(sibling) && sibling.parentElement) {
				// Set this as the highest removed element
				highest_removed_element = sibling;

				// First collect all elements to remove in DOM order
				const elements_to_remove =
					collect_element_and_subsequent_siblings(sibling);

				// Add them to the result list in DOM order
				removed_elements.push(...elements_to_remove);

				// If we have a highest element, collect its pdf-outline ancestors
				if (highest_removed_element) {
					// Store the original hierarchy from page to highest element
					let current: HTMLElement | null = highest_removed_element;
					const full_hierarchy: HTMLElement[] = [];

					while (current && current !== page_element) {
						full_hierarchy.unshift(current);
						current = current.parentElement;
					}

					// Filter to only pdf-outline elements
					pdf_outline_hierarchy.push(
						...full_hierarchy.filter((el) =>
							el.classList.contains("pdf-outline")
						)
					);
				}
				// Then remove them from the DOM
				remove_elements(elements_to_remove);

				// We can break after the first one since all subsequent elements
				// will be removed by the cascading function
				break;
			}
		}
	}

	// Remove duplicates from pdf_outline_hierarchy by using a Set
	const unique_pdf_outlines = Array.from(new Set(pdf_outline_hierarchy));

	return {
		removed_elements,
		pdf_outline_hierarchy: unique_pdf_outlines,
	};
}
function build_new_page(
	pdf_outline_hierarchy: HTMLElement[],
	removed_elements: HTMLElement[],
	page: HTMLElement
): HTMLElement {
	// Clone the page without its children
	const second_page = page.cloneNode(false) as HTMLElement;

	// No outline hierarchy - append removed elements directly
	if (pdf_outline_hierarchy.length === 0) {
		removed_elements.forEach((element) => {
			second_page.appendChild(element);
		});
		return second_page;
	}

	// Build the outline hierarchy structure by cloning each element
	let current_parent = second_page;
	let last_element = second_page;

	for (let i = 0; i < pdf_outline_hierarchy.length; i++) {
		// Clone the outline element without its children
		const original_element = pdf_outline_hierarchy[i];
		const cloned_element = original_element.cloneNode(false) as HTMLElement;

		// Copy all attributes and properties
		// (optional, cloneNode should handle attributes, but being thorough)
		for (const attr of original_element.attributes) {
			cloned_element.setAttribute(attr.name, attr.value);
		}

		// Append the cloned element to build the hierarchy
		current_parent.appendChild(cloned_element);

		// Update tracking variables for the next iteration
		current_parent = cloned_element;
		last_element = cloned_element;
	}

	// Append all removed elements to the last node in the outline hierarchy
	removed_elements.forEach((element) => {
		last_element.appendChild(element);
	});

	return second_page;
}

async function split_page(
	original_page_ref: HTMLElement
): Promise<HTMLElement[]> {
	const created_pages: HTMLElement[] = [];

	// Helper function to clone a page with proper styling
	function clone_page(ref: HTMLElement): HTMLElement {
		const clone = ref.cloneNode(true) as HTMLElement;
		const clone_id = crypto.randomUUID();
		clone.id = clone_id;
		clone.style.width = "210mm";
		clone.style.height = "297mm";
		clone.style.position = "absolute";
		clone.style.top = "-9999px";
		clone.style.left = "-9999px";
		clone.style.visibility = "visible";
		clone.style.display = "block";
		clone.style.transform = "none";

		return clone;
	}

	// Recursive function to process pages
	async function process_page(
		ref: HTMLElement,
		page_index: number = 0
	): Promise<void> {
		// Clone the page
		const clone = clone_page(ref);

		// Adjust top position based on page index
		clone.style.top = `-${9999 + page_index * 297 + 50}mm`;
		document.body.appendChild(clone);

		// Wait for the page to render
		await new Promise((resolve) => setTimeout(resolve, 200));

		const current_page = document.getElementById(clone.id);
		if (!current_page) {
			console.error("Failed to find cloned page in DOM");
			return;
		}

		// Add to created pages
		created_pages.push(current_page);

		// Try to find cut-off elements
		const hierarchy = get_cutoff_element_hierarchy(current_page);
		console.log(hierarchy);

		// If no hierarchy found, this page doesn't need splitting
		if (hierarchy.length === 0) {
			return;
		}

		const cutoff_child = hierarchy.pop();
		if (!cutoff_child) {
			return;
		}
		console.log(cutoff_child);

		// Extract cut-off elements
		const cutoffs = extract_cutoff_elements(
			cutoff_child,
			hierarchy,
			current_page
		);
		console.log(cutoffs);

		// If no elements were removed, this page doesn't need splitting
		if (cutoffs.removed_elements.length === 0) {
			return;
		}

		// Build a new page with the cut-off elements
		const next_page = build_new_page(
			cutoffs.pdf_outline_hierarchy,
			cutoffs.removed_elements,
			current_page
		);

		// Process this new page (recursively)
		await process_page(next_page, page_index + 1);
	}

	// Start the recursive process with the original page
	await process_page(original_page_ref);

	return created_pages;
}

export async function generatePDF(ref: HTMLElement, cfg: GeneratePDFCfg) {
	const pages = await split_page(ref);

	const pdf = new jsPDF({
		orientation: cfg.orientation ?? "portrait",
		unit: cfg.unit ?? "mm",
		format: cfg.format ?? "a4",
		compress: true,
	});
	for (let index = 0; index < pages.length; index++) {
		const page = pages[index];

		try {
			const canvas = await html2canvas(page, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: cfg.background_color ?? "#ffffff",
				removeContainer: true,
				logging: false,
			});

			const margin = cfg.margin ?? 0;
			const pdf_width = pdf.internal.pageSize.getWidth();
			const pdf_height = pdf.internal.pageSize.getHeight();
			const content_width = pdf_width - 2 * margin;
			const content_height = pdf_height - 2 * margin;
			const img_data = canvas.toDataURL("image/jpeg", 1.0);
			pdf.addImage(
				img_data,
				"jpeg",
				margin,
				margin,
				content_width,
				content_height
			);
			if (index != pages.length - 1) {
				//lase page
				pdf.addPage();
			}
		} catch (error) {
			throw error;
		} finally {
			if (document.body.contains(page)) {
				document.body.removeChild(page);
			}
		}
	}
	pdf.save(cfg.name);
	return;
	// try {
	// 	const canvas = await html2canvas(clone, {
	// 		scale: 2,
	// 		useCORS: true,
	// 		allowTaint: true,
	// 		backgroundColor: cfg.background_color ?? "#ffffff",
	// 		removeContainer: true,
	// 		logging: false,
	// 	});

	// 	const pdf = new jsPDF({
	// 		orientation: cfg.orientation ?? "portrait",
	// 		unit: cfg.unit ?? "mm",
	// 		format: cfg.format ?? "a4",
	// 		compress: true,
	// 	});

	// 	const margin = cfg.margin ?? 0;
	// 	const pdf_width = pdf.internal.pageSize.getWidth();
	// 	const pdf_height = pdf.internal.pageSize.getHeight();
	// 	const content_width = pdf_width - 2 * margin;
	// 	const content_height = pdf_height - 2 * margin;
	// 	const scale_ratio = canvas.width / content_width;
	// 	const total_content_height_mm = canvas.height / scale_ratio;
	// 	const overlap_mm = cfg.overlap_mm ?? 10;

	// 	if (Math.floor(total_content_height_mm) <= Math.floor(content_height)) {
	// 		const img_data = canvas.toDataURL("image/jpeg", 1.0);
	// 		pdf.addImage(
	// 			img_data,
	// 			"JPEG",
	// 			margin,
	// 			margin,
	// 			content_width,
	// 			total_content_height_mm
	// 		);
	// 	} else {
	// 		const usable_page_height_mm = content_height - overlap_mm;
	// 		const total_pages = Math.ceil(
	// 			total_content_height_mm / usable_page_height_mm
	// 		);

	// 		for (let page = 0; page < total_pages; page++) {
	// 			const slice_start_mm = page * usable_page_height_mm;
	// 			let slice_height_mm = content_height;

	// 			if (page === total_pages - 1) {
	// 				slice_height_mm = Math.min(
	// 					content_height,
	// 					total_content_height_mm - slice_start_mm
	// 				);
	// 			}

	// 			const slice_start_px = Math.floor(slice_start_mm * scale_ratio);
	// 			const slice_height_px = Math.ceil(
	// 				slice_height_mm * scale_ratio
	// 			);

	// 			const temp_canvas = document.createElement("canvas");
	// 			const temp_ctx = temp_canvas.getContext("2d");

	// 			temp_canvas.width = canvas.width;
	// 			temp_canvas.height = slice_height_px;

	// 			temp_ctx?.drawImage(
	// 				canvas,
	// 				0,
	// 				slice_start_px,
	// 				canvas.width,
	// 				slice_height_px,
	// 				0,
	// 				0,
	// 				canvas.width,
	// 				slice_height_px
	// 			);

	// 			if (page > 0) {
	// 				pdf.addPage();
	// 			}

	// 			const slice_data = temp_canvas.toDataURL("image/jpeg", 1.0);
	// 			pdf.addImage(
	// 				slice_data,
	// 				"JPEG",
	// 				margin,
	// 				margin,
	// 				content_width,
	// 				slice_height_mm
	// 			);
	// 		}
	// 	}

	// 	pdf.save(cfg.name);
	// 	return pdf;
	// } catch (error) {
	// 	throw error;
	// } finally {
	// 	if (document.body.contains(clone)) {
	// 		document.body.removeChild(clone);
	// 	}
	// }
}
