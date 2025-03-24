import Footer from "@components/footer.default";
import Header from "@components/header.default";
import { createSignal, Show, For } from "solid-js";

interface AboutUsPageProps {}

function AboutUs(props: AboutUsPageProps) {
	const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");
	const [active_tab, set_active_tab] = createSignal("mission");
	const skills = [
		"Product Strategy",
		"Agile Methodologies",
		"User Research",
		"Data Analytics",
		"Roadmap Planning",
		"UX Design",
	];

	const experiences = [
		{
			title: "Senior Product Manager",
			company: "TechInnovate Solutions, San Francisco",
			period: "Jan 2020 - Present",
			achievements: [
				"Led cross-functional team in developing AI-powered analytics platform",
				"Increased user engagement by 45% through strategic product improvements",
				"Implemented agile methodologies reducing development cycle by 30%",
			],
		},
	];

	const education = [
		{
			degree: "MBA in Technology Management",
			institution: "Stanford Graduate School of Business",
			period: "Sep 2015 - May 2017",
		},
	];

	const values = [
		{
			name: "Personalization",
			description:
				"We believe every job application should be uniquely tailored to highlight the perfect match between candidate and opportunity.",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
					<circle cx="9" cy="7" r="4"></circle>
					<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
					<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
				</svg>
			),
		},
		{
			name: "Accessibility",
			description:
				"We're committed to making professional-quality career document creation accessible to everyone, regardless of writing skill or background.",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 2v20"></path>
					<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
				</svg>
			),
		},
		{
			name: "Ethical AI",
			description:
				"We develop our technology with a strong ethical framework, ensuring privacy, transparency, and equitable outcomes for all job seekers.",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
			),
		},
		{
			name: "Career Empowerment",
			description:
				"We build tools that empower individuals to present their best professional selves and achieve their career goals.",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="9 11 12 14 22 4"></polyline>
					<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
				</svg>
			),
		},
	];

	type TabId = "mission" | "story" | "values";

	const tabs = [
		{ id: "mission" as TabId, name: "Our Mission" },
		{ id: "story" as TabId, name: "Our Story" },
		{ id: "values" as TabId, name: "Our Values" },
	];

	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-8 py-8">
				<header class="text-center mb-6">
					<h1 class="text-4xl font-bold text-forest-900 mb-3">
						About{" "}
						<span class="font-medium tracking-widest">
							PORTR
							<span class="alice-regular text-forest-900">
								AI
							</span>
						</span>
					</h1>
					<p class="text-lg text-gray-600 max-w-3xl mx-auto">
						Empowering job seekers with AI-driven resume and cover
						letter generation tailored specifically to job
						opportunities.
					</p>
				</header>

				{/* Tabs Navigation */}
				<nav class="border-b border-gray-200 flex flex-wrap gap-2 md:gap-0">
					<For each={tabs}>
						{(tab) => (
							<button
								onClick={() => set_active_tab(tab.id)}
								classList={{
									"px-6 py-3 font-medium text-sm md:text-base":
										true,
									"border-b-2 border-forest-600 text-forest-600":
										active_tab() === tab.id,
									"text-gray-500 hover:text-forest-600 smooth-transition":
										active_tab() !== tab.id,
								}}
								aria-selected={active_tab() === tab.id}
							>
								{tab.name}
							</button>
						)}
					</For>
				</nav>

				{/* Tab Content */}
				<article class="py-6" aria-live="polite">
					{/* Mission Tab */}
					<Show when={active_tab() === "mission"}>
						<section class="grid md:grid-cols-2 gap-12">
							<div class="flex flex-col gap-4">
								<h2 class="text-2xl font-bold text-forest-800">
									Our Mission
								</h2>
								<p class="text-gray-700">
									At Portrai, we're on a mission to
									revolutionize the job application process by
									creating AI tools that perfectly match
									candidates with opportunities. We believe
									everyone deserves compelling career
									documents that highlight their unique
									qualifications for each specific role they
									apply to.
								</p>
								<p class="text-gray-700">
									Our platform bridges the gap between generic
									resumes and what employers are actually
									looking for, making it simple for anyone to
									generate tailored resumes and cover letters
									that significantly improve their chances of
									landing interviews.
								</p>
								<p class="text-gray-700">
									We're committed to leveling the playing
									field in the job market by giving all
									candidates access to sophisticated document
									optimization technology that understands
									what recruiters and hiring managers are
									seeking.
								</p>
							</div>

							<figure class="flex-1">
								<div class="relative aspect-square max-w-lg">
									<div class="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-6">
										<div class="h-full overflow-auto">
											<header class="text-center mb-6">
												<h1 class="text-3xl font-bold text-gray-900">
													Alexandra Rodriguez
												</h1>
												<p class="text-sm text-gray-600">
													Senior Product Manager |
													alexandra.rodriguez@email.com
													| (415) 555-0123
												</p>
												<p class="text-xs text-gray-500">
													San Francisco, CA |
													LinkedIn:
													/in/alexandrarodriguez
												</p>
											</header>

											<section class="mb-5">
												<h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
													Professional Experience
												</h2>
												<For each={experiences}>
													{(exp) => (
														<div class="mb-4">
															<div class="flex justify-between items-baseline">
																<h3 class="font-bold text-gray-800">
																	{exp.title}
																</h3>
																<span class="text-xs text-gray-600">
																	{exp.period}
																</span>
															</div>
															<p class="text-sm italic text-gray-700">
																{exp.company}
															</p>
															<ul class="list-disc pl-5 text-xs text-gray-700 space-y-1 mt-2">
																<For
																	each={
																		exp.achievements
																	}
																>
																	{(
																		achievement
																	) => (
																		<li>
																			{
																				achievement
																			}
																		</li>
																	)}
																</For>
															</ul>
														</div>
													)}
												</For>
											</section>

											<section class="mb-5">
												<h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
													Education
												</h2>
												<For each={education}>
													{(edu) => (
														<div>
															<div class="flex justify-between items-baseline">
																<h3 class="font-bold text-gray-800">
																	{edu.degree}
																</h3>
																<span class="text-xs text-gray-600">
																	{edu.period}
																</span>
															</div>
															<p class="text-sm italic text-gray-700">
																{
																	edu.institution
																}
															</p>
														</div>
													)}
												</For>
											</section>

											<section>
												<h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
													Skills
												</h2>
												<div class="flex flex-wrap gap-2">
													<For each={skills}>
														{(skill) => (
															<span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
																{skill}
															</span>
														)}
													</For>
												</div>
											</section>
										</div>
									</div>
									<div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-forest-900 rounded-2xl" />
								</div>
							</figure>
						</section>
					</Show>

					{/* Story Tab */}
					<Show when={active_tab() === "story"}>
						<section class="grid md:grid-cols-2 gap-12">
							<div class="flex flex-col gap-4">
								<h2 class="text-2xl font-bold text-forest-800">
									Our Story
								</h2>
								<p class="text-gray-700">
									Portrai began in early 2023 when our
									founders, a group of AI researchers and
									career service professionals, recognized how
									challenging it was for job seekers to
									customize their applications for each
									position they applied to.
								</p>
								<p class="text-gray-700">
									What started as a project to help friends
									and family with their job searches quickly
									evolved as we saw how our early AI
									prototypes could transform generic resumes
									into targeted applications that resonated
									with specific job descriptions.
								</p>
								<p class="text-gray-700">
									After months of development and testing with
									early users who reported significant
									improvements in interview rates, we launched
									Portrai with a vision to make personalized,
									high-quality job application documents
									accessible to everyone.
								</p>
								<p class="text-gray-700">
									Today, our platform helps thousands of job
									seekers worldwide land interviews by
									creating resumes and cover letters that
									speak directly to what employers are looking
									for in each unique role.
								</p>
							</div>
						</section>
					</Show>

					{/* Values Tab */}
					<Show when={active_tab() === "values"}>
						<section class="flex flex-col gap-8">
							<h2 class="text-2xl font-bold text-forest-800">
								Our Values
							</h2>

							<div class="grid md:grid-cols-2 gap-x-12 gap-y-8">
								<For each={values}>
									{(value) => (
										<article class="flex flex-col gap-3">
											<figure class="text-forest-600 mb-1">
												{value.icon}
											</figure>
											<h3 class="text-xl font-semibold text-forest-800">
												{value.name}
											</h3>
											<p class="text-gray-700">
												{value.description}
											</p>
										</article>
									)}
								</For>
							</div>
						</section>
					</Show>
				</article>

				{/* Call to Action */}
				<Show when={!is_authenticated}>					
					<aside class="bg-forest-50 border border-forest-100 rounded-xl p-8 text-center mt-6">
						<h2 class="text-2xl font-bold text-forest-800 mb-3">
							Land Your Dream Job
						</h2>
						<p class="text-gray-700 max-w-2xl mx-auto mb-6">
							Whether you're actively job hunting, exploring new
							opportunities, or just want to keep your resume updated,
							our AI-powered platform helps you create tailored
							application documents that get results.
						</p>
						<div class="flex flex-wrap justify-center gap-4">
							<a
								href="/signup"
								class="px-6 py-3 bg-forest-700 text-white rounded-lg hover:bg-forest-800 smooth-transition"
							>
								Create Your Resume
							</a>
							<a
								href="/pricing"
								class="px-6 py-3 border border-forest-700 text-forest-700 rounded-lg hover:bg-forest-50 smooth-transition"
							>
								View Plans
							</a>
						</div>
					</aside>
				</Show>
			</section>
			<Footer />
		</main>
	);
}

export default AboutUs;
