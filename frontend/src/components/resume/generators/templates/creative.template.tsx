import { For, Show } from "solid-js";
import { TemplateData, TemplateSettings } from "./template.utils";

interface TemplateProps {
	data: TemplateData;
	settings?: TemplateSettings;
}

export function CreativeTemplate(props: TemplateProps) {
	const settings = {
		font_size: {
			name: "3rem",
			section_title: "1.8rem",
			subsection_title: "1.4rem",
			body: "1rem",
			...props.settings?.font_size,
		},
		spacing: {
			section: "2.5rem",
			subsection: "1.5rem",
			item: "1.2rem",
			...props.settings?.spacing,
		},
		show_sections: {
			summary: true,
			experience: true,
			education: true,
			skills: true,
			certificates: true,
			projects: true,
			...props.settings?.show_sections,
		},
	};

	return (
		<article class="h-full w-full text-gray-800 bg-white font-sans">
			{/* Left Sidebar */}
			<div class="grid grid-cols-1 md:grid-cols-3 h-full">
				<aside class="bg-emerald-100 text-emerald-900 p-8">
					{/* Profile Photo Placeholder */}
					<div class="flex justify-center mb-6">
						<div class="w-40 h-40 rounded-full bg-emerald-200 border-4 border-white flex items-center justify-center text-emerald-500 text-3xl">
							{props.data.user?.full_name?.charAt(0) || "U"}
						</div>
					</div>

					{/* Name and Title */}
					<header class="text-center mb-8">
						<h1 
							class="font-bold mb-2"
							style={{ "font-size": settings.font_size.name }}
						>
							{props.data.user?.full_name}
						</h1>
						<h2 class="text-xl text-emerald-800">
							{props.data.resume_data.title || "Creative Professional"}
						</h2>
					</header>

					{/* Contact Info */}
					<section class="mb-8">
						<h2 
							class="uppercase tracking-wider font-bold mb-4 border-b-2 border-emerald-300 pb-1"
							style={{ "font-size": "1.2rem" }}
						>
							Contact
						</h2>
						<ul class="space-y-2 text-emerald-800">
							<Show when={props.data.user?.email}>
								<li class="flex items-start gap-2">
									<span class="font-bold">Email:</span>
									<span>{props.data.user?.email}</span>
								</li>
							</Show>
							<Show when={props.data.user?.phone}>
								<li class="flex items-start gap-2">
									<span class="font-bold">Phone:</span>
									<span>{props.data.user?.phone}</span>
								</li>
							</Show>
							<Show when={props.data.user?.location}>
								<li class="flex items-start gap-2">
									<span class="font-bold">Location:</span>
									<span>{props.data.user?.location}</span>
								</li>
							</Show>
							<Show when={props.data.profile?.linkedin}>
								<li class="flex items-start gap-2">
									<span class="font-bold">LinkedIn:</span>
									<a 
										href={props.data.profile?.linkedin} 
										class="text-emerald-700 hover:text-emerald-500 underline"
										target="_blank" 
										rel="noopener noreferrer"
									>
										Profile
									</a>
								</li>
							</Show>
							<Show when={props.data.profile?.website}>
								<li class="flex items-start gap-2">
									<span class="font-bold">Website:</span>
									<a 
										href={props.data.profile?.website} 
										class="text-emerald-700 hover:text-emerald-500 underline"
										target="_blank" 
										rel="noopener noreferrer"
									>
										Portfolio
									</a>
								</li>
							</Show>
						</ul>
					</section>

					{/* Skills Section */}
					<Show
						when={
							settings.show_sections.skills &&
							props.data.resume_data.skills.filter((v) => v.is_visible).length > 0
						}
					>
						<section class="mb-8">
							<h2 
								class="uppercase tracking-wider font-bold mb-4 border-b-2 border-emerald-300 pb-1"
								style={{ "font-size": "1.2rem" }}
							>
								Skills
							</h2>
							<ul class="space-y-3">
								<For each={props.data.resume_data.skills.filter((v) => v.is_visible)}>
									{(skill) => (
										<li>
											<h3 class="font-semibold text-emerald-800">{skill.skill_name}</h3>
											<Show when={skill.optional_skill_level}>
												<div class="w-full bg-emerald-200 h-2 mt-1 rounded-full overflow-hidden">
													<div 
														class="bg-emerald-600 h-full rounded-full" 
														style={{ 
															width: `${skill.optional_skill_level === 'Beginner' ? '25%' : 
																skill.optional_skill_level === 'Intermediate' ? '50%' : 
																skill.optional_skill_level === 'Advanced' ? '75%' : 
																skill.optional_skill_level === 'Expert' ? '100%' : '50%'}`
														}}
													></div>
												</div>
											</Show>
										</li>
									)}
								</For>
							</ul>
						</section>
					</Show>

					{/* Certifications Section */}
					<Show
						when={
							settings.show_sections.certificates &&
							props.data.resume_data.certificates.filter((v) => v.is_visible).length > 0
						}
					>
						<section class="mb-8">
							<h2 
								class="uppercase tracking-wider font-bold mb-4 border-b-2 border-emerald-300 pb-1"
								style={{ "font-size": "1.2rem" }}
							>
								Certifications
							</h2>
							<ul class="space-y-4">
								<For each={props.data.resume_data.certificates.filter((v) => v.is_visible)}>
									{(certificate) => (
										<li>
											<h3 class="font-semibold text-emerald-800">{certificate.certificate_name}</h3>
											<Show when={certificate.optional_issuer}>
												<p class="text-sm">{certificate.optional_issuer}</p>
											</Show>
											<Show when={certificate.optional_granted_date}>
												<p class="text-xs text-emerald-700">{certificate.optional_granted_date}</p>
											</Show>
										</li>
									)}
								</For>
							</ul>
						</section>
					</Show>
				</aside>

				{/* Main Content */}
				<main class="col-span-2 p-8">
					{/* Profile Section */}
					<Show when={props.data.profile?.description}>
						<section class="mb-10">
							<h2 
								class="font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2 mb-4"
								style={{ "font-size": settings.font_size.section_title }}
							>
								Profile
							</h2>
							<p 
								class="text-gray-700 leading-relaxed"
								style={{ "font-size": settings.font_size.body }}
							>
								{props.data.profile?.description}
							</p>
						</section>
					</Show>

					{/* Experience Section */}
					<Show
						when={
							settings.show_sections.experience &&
							props.data.resume_data.experiences.filter((v) => v.is_visible).length > 0
						}
					>
						<section class="mb-10">
							<h2 
								class="font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2 mb-4"
								style={{ "font-size": settings.font_size.section_title }}
							>
								Professional Experience
							</h2>
							<For each={props.data.resume_data.experiences.filter((v) => v.is_visible)}>
								{(experience) => (
									<div class="mb-6">
										<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
											<h3
												class="font-bold text-emerald-700"
												style={{ "font-size": settings.font_size.subsection_title }}
											>
												{experience.job_title}
											</h3>
											<p class="text-sm text-emerald-600">
												{experience.start_date} – {experience.is_current ? "Present" : experience.optional_end_date}
											</p>
										</div>
										<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
											<h4 class="font-medium">{experience.company_name}</h4>
											<p class="text-sm italic">{experience.location}</p>
										</div>
										<p 
											class="text-gray-700"
											style={{ "font-size": settings.font_size.body }}
										>
											{experience.description}
										</p>
										<Show when={experience.tags.length > 0}>
											<div class="mt-2 flex flex-wrap gap-2">
												<For each={experience.tags}>
													{(tag) => (
														<span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
															{tag}
														</span>
													)}
												</For>
											</div>
										</Show>
									</div>
								)}
							</For>
						</section>
					</Show>

					{/* Projects Section */}
					<Show
						when={
							settings.show_sections.projects &&
							props.data.resume_data.projects.filter((v) => v.is_visible).length > 0
						}
					>
						<section class="mb-10">
							<h2 
								class="font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2 mb-4"
								style={{ "font-size": settings.font_size.section_title }}
							>
								Creative Projects
							</h2>
							<div class="grid grid-cols-1 gap-6">
								<For each={props.data.resume_data.projects.filter((v) => v.is_visible)}>
									{(project) => (
										<div class="border-l-4 border-emerald-300 pl-4 py-1">
											<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
												<h3
													class="font-bold text-emerald-700"
													style={{ "font-size": settings.font_size.subsection_title }}
												>
													{project.project_title}
												</h3>
												<Show when={project.start_date || project.optional_end_date}>
													<p class="text-sm text-emerald-600">
														{project.start_date} – {project.is_current ? "Present" : project.optional_end_date}
													</p>
												</Show>
											</div>
											<Show when={project.optional_project_subtitle}>
												<h4 class="font-medium mb-2 italic">{project.optional_project_subtitle}</h4>
											</Show>
											<p 
												class="text-gray-700"
												style={{ "font-size": settings.font_size.body }}
											>
												{project.description}
											</p>
											<Show when={project.tags.length > 0}>
												<div class="mt-2 flex flex-wrap gap-2">
													<For each={project.tags}>
														{(tag) => (
															<span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
																{tag}
															</span>
														)}
													</For>
												</div>
											</Show>
										</div>
									)}
								</For>
							</div>
						</section>
					</Show>

					{/* Education Section */}
					<Show
						when={
							settings.show_sections.education &&
							props.data.resume_data.educations.filter((v) => v.is_visible).length > 0
						}
					>
						<section class="mb-10">
							<h2 
								class="font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2 mb-4"
								style={{ "font-size": settings.font_size.section_title }}
							>
								Education
							</h2>
							<For each={props.data.resume_data.educations.filter((v) => v.is_visible)}>
								{(education) => (
									<div class="mb-6">
										<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
											<h3
												class="font-bold text-emerald-700"
												style={{ "font-size": settings.font_size.subsection_title }}
											>
												{education.degree}
											</h3>
											<p class="text-sm text-emerald-600">
												{education.start_date} – {education.is_current ? "Present" : education.optional_end_date}
											</p>
										</div>
										<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
											<h4 class="font-medium">{education.school}</h4>
											<p class="text-sm italic">{education.location}</p>
										</div>
										<Show when={education.description}>
											<p
												class="text-gray-700"
												style={{ "font-size": settings.font_size.body }}
											>
												{education.description}
											</p>
										</Show>
									</div>
								)}
							</For>
						</section>
					</Show>
				</main>
			</div>
		</article>
	);
}