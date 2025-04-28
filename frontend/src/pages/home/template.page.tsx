import Footer from "@components/footer.default";
import Header from "@components/header.autherized";
import { createSignal, For, Show, Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import STANDARD_EXECUTING_RESUME from "@assets/templates/standard_executive.jpg";
import COLUMNS_EXECUTING_RESUME from "@assets/templates/columns_executive.jpg";
import SENIOR_EXECUTING_RESUME from "@assets/templates/senior_executive.jpg";
import RESEARCHER_RESUME from "@assets/templates/researcher.jpg";
import { Motion, Presence } from "solid-motionone";
import { useFault } from "@components/fault";

interface TemplatesPage {}

function TemplatesPage(props: TemplatesPage) {
	const fault = useFault();
	const [selected_template_id, set_selected_template_id] = createSignal(
		localStorage.getItem("template_name") || "standard-executive"
	);
	const [current_template_id, set_current_template_id] = createSignal(
		localStorage.getItem("template_name") || "standard-executive"
	);
	const [selected_template_name, set_selected_template_name] =
		createSignal("Executive");
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
		/*{
			id: "light-executive",
			name: "Minimalist",
			category: "simple",
			description: "Simple and elegant design with focus on content.",
			image_url: LIGHT_EXECUTING_RESUME,
		},*/
		{
			id: "columns-executive",
			name: "Modern",
			category: "simple",
			description: "Clean, minimalist and modern design.",
			image_url: COLUMNS_EXECUTING_RESUME,
		},
		{
			id: "standard-executive",
			name: "Executive",
			category: "professional",
			description: "Sophisticated layout for professionals.",
			image_url: STANDARD_EXECUTING_RESUME,
		},
		{
			id: "senior-executive",
			name: "Senior",
			category: "professional",
			description:
				"Professional design for C-suite and senior leadership.",
			image_url: SENIOR_EXECUTING_RESUME,
		},
		{
			id: "researcher",
			name: "Researcher",
			category: "education",
			description:
				"Academic-focused layout for researchers and students.",
			image_url: RESEARCHER_RESUME,
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
		{ id: "professional", name: "Professional" },
		//{ id: "creative", name: "Creative" },
		{ id: "simple", name: "Simple" },
		// { id: "technical", name: "Technical" },
		{ id: "education", name: "Education" },
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
		set_selected_template_name(
			templates_store.filter((t) => t.id === template_id)[0].name
		);
	};

	const use_selected_template = () => {
		localStorage.setItem("template_name", selected_template_id());
		set_current_template_id(selected_template_id());
		fault.info({
			message: `Selected the ${selected_template_name()} template. Good Choice!`,
		});
	};

	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 lg:h-screen lg:max-h-screen min-h-screen">
			<Header />

			<section class="w-full grow h-full flex flex-col gap-6 justify-start overflow-hidden items-start text-forest-900">
				<header class="w-full text-center mb-2">
					<Motion
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h1 class="text-3xl font-bold mb-3">
							Resume Templates
						</h1>
						<p class="text-gray-600 max-w-3xl mx-auto">
							Choose from our professionally designed templates to
							create your perfect resume. Click on a template to
							select it for your next application.
						</p>
					</Motion>
				</header>

				{/* Filter Categories */}
				<Motion.nav
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					class="w-full border-b border-gray-200 flex flex-wrap gap-2 lg:gap-0"
					aria-label="Template categories"
				>
					<For each={categories}>
						{(category) => (
							<button
								onClick={() => set_filter_category(category.id)}
								classList={{
									"px-5 py-3 font-medium text-sm lg:text-base":
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
				</Motion.nav>

				{/* Templates Grid */}
				<ul class="w-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 list-none">
					<For each={filtered_templates()}>
						{(template, index) => (
							<Motion.li
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{
									duration: 0.4,
									delay: 0.1 * (index() + 1),
								}}
							>
								<article
									class="h-full p-2 flex flex-col gap-4 rounded overflow-hidden border-2 transition-all cursor-pointer hover:shadow-md"
									classList={{
										"border-lapis-600":
											current_template_id() ===
											template.id,
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

										<Presence>
											<Show
												when={
													selected_template_id() ===
														template.id &&
													current_template_id() !==
														template.id
												}
											>
												<Motion
													initial={{
														opacity: 0,
														y: 10,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													exit={{
														opacity: 0,
														y: -10,
													}}
													transition={{
														duration: 0.3,
													}}
												>
													<div class="mt-3 flex justify-center">
														<button
															onClick={(e) => {
																e.stopPropagation();
																use_selected_template();
															}}
															class="px-4 py-2 bg-forest-700 text-white rounded hover:bg-forest-800 transition-colors"
														>
															Use Template
														</button>
													</div>
												</Motion>
											</Show>
										</Presence>
									</div>
									<Motion
										initial={{ scale: 0.95 }}
										animate={{ scale: 1 }}
										transition={{ duration: 0.3 }}
									>
										<figure class="flex-1">
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
									</Motion>
								</article>
							</Motion.li>
						)}
					</For>
				</ul>

				{/* Empty State with Animation */}
				<Presence>
					<Show when={filtered_templates().length === 0}>
						<Motion
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4 }}
						>
							<div class="w-full py-12 text-center">
								<p class="text-gray-500 text-lg">
									No templates found in this category.
								</p>
								<Motion.button
									hover={{ scale: 1.05 }}
									press={{ scale: 0.95 }}
									onClick={() => set_filter_category("all")}
									class="mt-4 px-4 py-2 border border-forest-700 text-forest-700 rounded-lg hover:bg-forest-50"
								>
									View All Templates
								</Motion.button>
							</div>
						</Motion>
					</Show>
				</Presence>
			</section>
			<Footer />
		</main>
	);
}

export default TemplatesPage;
