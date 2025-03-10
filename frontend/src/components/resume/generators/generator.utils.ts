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

export async function generatePDF(ref: HTMLElement, cfg: GeneratePDFCfg) {
	const clone = ref.cloneNode(true) as HTMLElement;

	clone.style.width = "210mm";
	clone.style.height = "auto";
	clone.style.position = "absolute";
	clone.style.top = "-9999px";
	clone.style.left = "-9999px";
	clone.style.visibility = "visible";
	clone.style.display = "block";
	clone.style.transform = "none";

	document.body.appendChild(clone);

	try {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const canvas = await html2canvas(clone, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: cfg.background_color ?? "#ffffff",
			removeContainer: true,
			logging:false,
		});

		const pdf = new jsPDF({
			orientation: cfg.orientation ?? "portrait",
			unit: cfg.unit ?? "mm",
			format: cfg.format ?? "a4",
			compress: true,
		});

		const margin = cfg.margin ?? 0;
		const pdf_width = pdf.internal.pageSize.getWidth();
		const pdf_height = pdf.internal.pageSize.getHeight();
		const content_width = pdf_width - 2 * margin;
		const content_height = pdf_height - 2 * margin;
		const scale_ratio = canvas.width / content_width;
		const total_content_height_mm = canvas.height / scale_ratio;
		const overlap_mm = cfg.overlap_mm ?? 10;

		if (Math.floor(total_content_height_mm) <= Math.floor(content_height)) {
			const img_data = canvas.toDataURL("image/jpeg", 1.0);
			pdf.addImage(
				img_data,
				"JPEG",
				margin,
				margin,
				content_width,
				total_content_height_mm
			);
		} else {
			const usable_page_height_mm = content_height - overlap_mm;
			const total_pages = Math.ceil(
				total_content_height_mm / usable_page_height_mm
			);

			for (let page = 0; page < total_pages; page++) {
				const slice_start_mm = page * usable_page_height_mm;
				let slice_height_mm = content_height;

				if (page === total_pages - 1) {
					slice_height_mm = Math.min(
						content_height,
						total_content_height_mm - slice_start_mm
					);
				}

				const slice_start_px = Math.floor(slice_start_mm * scale_ratio);
				const slice_height_px = Math.ceil(
					slice_height_mm * scale_ratio
				);

				const temp_canvas = document.createElement("canvas");
				const temp_ctx = temp_canvas.getContext("2d");

				temp_canvas.width = canvas.width;
				temp_canvas.height = slice_height_px;

				temp_ctx?.drawImage(
					canvas,
					0,
					slice_start_px,
					canvas.width,
					slice_height_px,
					0,
					0,
					canvas.width,
					slice_height_px
				);

				if (page > 0) {
					pdf.addPage();
				}

				const slice_data = temp_canvas.toDataURL("image/jpeg", 1.0);
				pdf.addImage(
					slice_data,
					"JPEG",
					margin,
					margin,
					content_width,
					slice_height_mm
				);
			}
		}

		pdf.save(cfg.name);
		return pdf;
	} catch (error) {
		throw error;
	} finally {
		if (document.body.contains(clone)) {
			document.body.removeChild(clone);
		}
	}
}
