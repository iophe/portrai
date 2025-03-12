import Footer from "@components/footer.default";
import Header from "@components/header.autherized";
import { createSignal, For, Show, Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import EXECUTING_RESUME from '@assets/templates/executive.jpg';

interface TemplatesPage { }

function TemplatesPage(props: TemplatesPage) {
	const [selected_template_id, set_selected_template_id] =
		createSignal("modern");
	const [filter_category, set_filter_category] = createSignal("all");

	const [templates_store, set_templates_store] = createStore([
		// {
		// 	id: "modern",
		// 	name: "Modern Professional",
		// 	category: "professional",
		// 	description: "Clean, contemporary design with a professional edge.",
		// 	image_url: "/templates/modern.jpg",
		// },
		// {
		// 	id: "creative",
		// 	name: "Creative Portfolio",
		// 	category: "creative",
		// 	description:
		// 		"Showcase your creative work with this eye-catching design.",
		// 	image_url: "/templates/creative.jpg",
		// },
		// {
		// 	id: "minimalist",
		// 	name: "Minimalist",
		// 	category: "simple",
		// 	description: "Simple and elegant design with focus on content.",
		// 	image_url: "/templates/minimalist.jpg",
		// },
		{
			id: "executive",
			name: "Executive",
			category: "professional",
			description: "Sophisticated layout for senior professionals.",
			image_url: EXECUTING_RESUME,
		},
		// {
		// 	id: "technical",
		// 	name: "Technical Specialist",
		// 	category: "technical",
		// 	description: "Optimized for technical roles with skills emphasis.",
		// 	image_url: "/templates/technical.jpg",
		// },
		// {
		// 	id: "academic",
		// 	name: "Academic CV",
		// 	category: "education",
		// 	description:
		// 		"Structured format for academic and research positions.",
		// 	image_url: "/templates/academic.jpg",
		// },
		// {
		// 	id: "startup",
		// 	name: "Startup Innovator",
		// 	category: "creative",
		// 	description: "Dynamic layout for forward-thinking professionals.",
		// 	image_url: "/templates/startup.jpg",
		// },
		// {
		// 	id: "classic",
		// 	name: "Classic Traditional",
		// 	category: "simple",
		// 	description: "Timeless design suitable for traditional industries.",
		// 	image_url: "/templates/classic.jpg",
		// },
	]);

	const categories = [
		{ id: "all", name: "All Templates" },
		// { id: "professional", name: "Professional" },
		// { id: "creative", name: "Creative" },
		// { id: "simple", name: "Simple" },
		// { id: "technical", name: "Technical" },
		// { id: "education", name: "Education" },
	];

	const filtered_templates = () => {
		if (filter_category() === "all") {
			return templates_store;
		}
		return templates_store.filter(
			(template: { category: string }) =>
				template.category === filter_category()
		);
	};

	const handle_template_select = (template_id: string) => {
		set_selected_template_id(template_id);
	};

	const use_selected_template = () => {
		// Implementation to use the selected template
		// This could navigate to another page or trigger an application event
		console.log(`Using template with ID: ${selected_template_id()}`);
		// Example: navigate to editor with the selected template
		// window.location.href = `/editor?template=${selected_template_id()}`;
	};

	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 md:h-screen md:max-h-screen min-h-screen">
			<Header />

			<section class="w-full grow h-full flex flex-col gap-6 justify-start overflow-hidden items-start text-forest-900">
				<header class="w-full text-center mb-2">
					<h1 class="text-3xl font-bold mb-3">Resume Templates</h1>
					<p class="text-gray-600 max-w-3xl mx-auto">
						Choose from our professionally designed templates to
						create your perfect resume. Click on a template to
						select it for your next application.
					</p>
				</header>

				{/* Filter Categories */}
				<nav
					class="w-full border-b border-gray-200 flex flex-wrap gap-2 md:gap-0"
					aria-label="Template categories"
				>
					<For each={categories}>
						{(category) => (
							<button
								onClick={() => set_filter_category(category.id)}
								classList={{
									"px-5 py-3 font-medium text-sm md:text-base":
										true,
									"border-b-2 border-forest-600 text-forest-600":
										filter_category() === category.id,
									"text-gray-500 hover:text-forest-600":
										filter_category() !== category.id,
								}}
								aria-selected={
									filter_category() === category.id
								}
							>
								{category.name}
							</button>
						)}
					</For>
				</nav>

				{/* Templates Grid */}
				<ul class="w-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 list-none">
					<For each={filtered_templates()}>
						{(template) => (
							<li>
								<article
									class="h-full p-2 flex flex-col gap-4 rounded overflow-hidden border-2 transition-all cursor-pointer hover:shadow-md"
									classList={{
										"border-forest-600":
											selected_template_id() ===
											template.id,
										"border-lapis-50":
											selected_template_id() !==
											template.id,
									}}
									onClick={() =>
										handle_template_select(template.id)
									}
								>
									
									<div class="flex flex-col gap-2">
										<h3 class="font-medium text-lg">
											{template.name}
										</h3>
										<p class="text-sm text-gray-600">
											{template.description}
										</p>

										<Show
											when={
												selected_template_id() ===
												template.id
											}
										>
											<div class="mt-3 flex justify-center">
												<button
													onClick={(e) => {
														e.stopPropagation(); // Prevent triggering parent onClick
														use_selected_template();
													}}
													class="px-4 py-2 bg-forest-700 text-white rounded hover:bg-forest-800 transition-colors"
												>
													Use Template
												</button>
											</div>
										</Show>
									</div><figure class="flex-1">
										<img
											src={template.image_url}
											alt={`${template.name} template preview`}
											class="object-cover w-full h-full"
											onError={(e) => {
												// Fallback for missing images
												const target =
													e.target as HTMLImageElement;
												// target.src = "/templates/placeholder.jpg";
											}}
										/>
									</figure>
								</article>
							</li>
						)}
					</For>
				</ul>

				{/* Empty State */}
				<Show when={filtered_templates().length === 0}>
					<div class="w-full py-12 text-center">
						<p class="text-gray-500 text-lg">
							No templates found in this category.
						</p>
						<button
							onClick={() => set_filter_category("all")}
							class="mt-4 px-4 py-2 border border-forest-700 text-forest-700 rounded-lg hover:bg-forest-50 transition-colors"
						>
							View All Templates
						</button>
					</div>
				</Show>
			</section>
			<Footer />
		</main>
	);
}

export default TemplatesPage;
