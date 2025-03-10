import { For, Show } from "solid-js";
import { TemplateData, TemplateSettings } from "./template.utils";

interface TemplateProps {
	data: TemplateData;
	settings?: TemplateSettings;
}

export function SimpleBlueTemplate(props: TemplateProps) {
	// Ensure we have user and profile data even if they're not provided
	const user = props.data.user || {
		full_name: "",
		email: "",
		phone: "",
		location: ""
	};
	
	const profile = props.data.profile || {
		linkedin: "",
		website: "",
		description: ""
	};
	
	const settings = {
		font_size: {
			name: "2rem",
			section_title: "1.25rem",
			subsection_title: "1.1rem",
			body: "0.9rem",
			...props.settings?.font_size,
		},
		spacing: {
			section: "1.75rem",
			subsection: "1.25rem",
			item: "0.75rem",
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
			{/* Header with blue accent */}
			<header class="bg-blue-700 text-white p-6 pb-8">
				<h1 class="font-bold text-center" style={{ "font-size": settings.font_size.name }}>
					{user.full_name}
				</h1>
				<div class="mt-3 text-center text-blue-100">
					<address class="not-italic flex flex-wrap justify-center items-center gap-3">
						<Show when={user.email}>
							<span>{user.email}</span>
						</Show>
						<Show when={user.phone}>
							<span>•</span>
							<span>{user.phone}</span>
						</Show>
						<Show when={user.location}>
							<span>•</span>
							<span>{user.location}</span>
						</Show>
					</address>
					
					<div class="flex justify-center gap-4 mt-2">
						<Show when={profile.linkedin}>
							<a
								href={profile.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-white transition-colors underline"
							>
								LinkedIn
							</a>
						</Show>
						<Show when={profile.website}>
							<Show when={profile.linkedin}>
								<span>•</span>
							</Show>
							<a
								href={profile.website}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-white transition-colors underline"
							>
								Website
							</a>
						</Show>
					</div>
				</div>
			</header>

			<div class="p-6">
				{/* Profile Summary Section */}
				<Show when={settings.show_sections.summary && profile.description}>
					<section class="mb-6">
						<h2
							class="text-blue-700 font-bold mb-3 pb-1 border-b border-blue-200"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Professional Summary
						</h2>
						<p
							class="text-gray-700"
							style={{ "font-size": settings.font_size.body }}
						>
							{profile.description}
						</p>
					</section>
				</Show>

				{/* Experience Section */}
				<Show
					when={
						settings.show_sections.experience &&
						props.data.resume_data.experiences.filter(
							(v) => v.is_visible
						).length > 0
					}
				>
					<section class="mb-6">
						<h2
							class="text-blue-700 font-bold mb-3 pb-1 border-b border-blue-200"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Professional Experience
						</h2>
						<For
							each={props.data.resume_data.experiences.filter(
								(v) => v.is_visible
							)}
						>
							{(experience) => (
								<div class="mb-4">
									<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
										<h3
											class="font-bold text-gray-800"
											style={{
												"font-size":
													settings.font_size.subsection_title,
											}}
										>
											{experience.job_title}
										</h3>
										<span class="text-sm text-gray-600">
											{experience.start_date}
											{" - "}
											{experience.is_current
												? "Present"
												: experience.optional_end_date}
										</span>
									</div>
									<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mt-1">
										<h4 class="text-blue-600">
											{experience.company_name}
										</h4>
										<span class="text-sm text-gray-600">
											{experience.location}
										</span>
									</div>
									<p
										class="mt-2 text-gray-700"
										style={{
											"font-size": settings.font_size.body,
										}}
									>
										{experience.description}
									</p>
								</div>
							)}
						</For>
					</section>
				</Show>

				{/* Education Section */}
				<Show
					when={
						settings.show_sections.education &&
						props.data.resume_data.educations.filter(
							(v) => v.is_visible
						).length > 0
					}
				>
					<section class="mb-6">
						<h2
							class="text-blue-700 font-bold mb-3 pb-1 border-b border-blue-200"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Education
						</h2>
						<For
							each={props.data.resume_data.educations.filter(
								(v) => v.is_visible
							)}
						>
							{(education) => (
								<div class="mb-4">
									<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
										<h3
											class="font-bold text-gray-800"
											style={{
												"font-size":
													settings.font_size.subsection_title,
											}}
										>
											{education.degree}
										</h3>
										<span class="text-sm text-gray-600">
											{education.start_date}
											{" - "}
											{education.is_current
												? "Present"
												: education.optional_end_date}
										</span>
									</div>
									<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mt-1">
										<h4 class="text-blue-600">{education.school}</h4>
										<span class="text-sm text-gray-600">
											{education.location}
										</span>
									</div>
									<Show when={education.description}>
										<p
											class="mt-2 text-gray-700"
											style={{
												"font-size": settings.font_size.body,
											}}
										>
											{education.description}
										</p>
									</Show>
								</div>
							)}
						</For>
					</section>
				</Show>

				{/* Skills Section */}
				<Show
					when={
						settings.show_sections.skills &&
						props.data.resume_data.skills.filter((v) => v.is_visible)
							.length > 0
					}
				>
					<section class="mb-6">
						<h2
							class="text-blue-700 font-bold mb-3 pb-1 border-b border-blue-200"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Skills
						</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
							<For
								each={props.data.resume_data.skills.filter(
									(v) => v.is_visible
								)}
							>
								{(skill) => (
									<div class="bg-blue-50 p-3 rounded border border-blue-100">
										<h3
											class="font-bold text-gray-800"
											style={{
												"font-size":
													settings.font_size.subsection_title,
											}}
										>
											{skill.skill_name}
											<Show when={skill.optional_skill_level}>
												<span class="font-normal text-sm text-gray-600 ml-2">
													({skill.optional_skill_level})
												</span>
											</Show>
										</h3>
										<Show when={skill.description}>
											<p
												class="mt-1 text-gray-700"
												style={{
													"font-size": settings.font_size.body,
												}}
											>
												{skill.description}
											</p>
										</Show>
									</div>
								)}
							</For>
						</div>
					</section>
				</Show>

				{/* Projects Section */}
				<Show
					when={
						settings.show_sections.projects &&
						props.data.resume_data.projects.filter((v) => v.is_visible)
							.length > 0
					}
				>
					<section class="mb-6">
						<h2
							class="text-blue-700 font-bold mb-3 pb-1 border-b border-blue-200"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Projects
						</h2>
						<For
							each={props.data.resume_data.projects.filter(
								(v) => v.is_visible
							)}
						>
							{(project) => (
								<div class="mb-4">
									<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
										<h3
											class="font-bold text-gray-800"
											style={{
												"font-size":
													settings.font_size.subsection_title,
											}}
										>
											{project.project_title}
										</h3>
										<Show
											when={
												project.start_date ||
												project.optional_end_date
											}
										>
											<span class="text-sm text-gray-600">
												{project.start_date}
												{project.start_date && " - "}
												{project.is_current
													? "Present"
													: project.optional_end_date}
											</span>
										</Show>
									</div>
									<Show when={project.optional_project_subtitle}>
										<h4 class="text-blue-600 mt-1">
											{project.optional_project_subtitle}
										</h4>
									</Show>
									<p
										class="mt-2 text-gray-700"
										style={{
											"font-size": settings.font_size.body,
										}}
									>
										{project.description}
									</p>
								</div>
							)}
						</For>
					</section>
				</Show>

				{/* Certificates Section */}
				<Show
					when={
						settings.show_sections.certificates &&
						props.data.resume_data.certificates.filter(
							(v) => v.is_visible
						).length > 0
					}
				>
					<section class="mb-6">
						<h2
							class="text-blue-700 font-bold mb-3 pb-1 border-b border-blue-200"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Certifications
						</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<For
								each={props.data.resume_data.certificates.filter(
									(v) => v.is_visible
								)}
							>
								{(certificate) => (
									<div class="bg-blue-50 p-3 rounded border border-blue-100">
										<div class="flex flex-col">
											<h3
												class="font-bold text-gray-800"
												style={{
													"font-size":
														settings.font_size.subsection_title,
												}}
											>
												{certificate.certificate_name}
											</h3>
											<Show when={certificate.optional_issuer}>
												<h4 class="text-blue-600 mt-1">
													{certificate.optional_issuer}
												</h4>
											</Show>
											<Show when={certificate.optional_granted_date}>
												<span class="text-sm text-gray-600 mt-1">
													Issued: {certificate.optional_granted_date}
												</span>
											</Show>
											<Show when={certificate.description}>
												<p
													class="mt-2 text-gray-700"
													style={{
														"font-size":
															settings.font_size.body,
													}}
												>
													{certificate.description}
												</p>
											</Show>
										</div>
									</div>
								)}
							</For>
						</div>
					</section>
				</Show>
			</div>
		</article>
	);
}