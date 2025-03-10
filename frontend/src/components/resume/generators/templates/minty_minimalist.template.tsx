import { For, Show } from "solid-js";
import { TemplateData, TemplateSettings } from "./template.utils";

interface TemplateProps {
	data: TemplateData;
	settings?: TemplateSettings;
}

export function MintyMinimalistTemplate(props: TemplateProps) {
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
			name: "1.75rem",
			section_title: "1.1rem",
			subsection_title: "1rem",
			body: "0.9rem",
			...props.settings?.font_size,
		},
		spacing: {
			section: "1.5rem",
			subsection: "1rem",
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
		<article class="h-full w-full bg-green-50 font-sans text-gray-700">
			{/* Header */}
			<header class="px-6 py-4">
				<h1 
					class="font-medium text-green-700" 
					style={{ "font-size": settings.font_size.name }}
				>
					{user.full_name}
				</h1>
				<p class="text-green-600 italic mt-1">
					{props.data.resume_data.title || ""}
				</p>
				
				{/* Contact Information */}
				<div class="mt-3 space-y-1 text-sm">
					<Show when={user.location}>
						<div class="flex items-center gap-2">
							<span class="text-green-700">◎</span>
							<span>{user.location}</span>
						</div>
					</Show>
					<Show when={user.email}>
						<div class="flex items-center gap-2">
							<span class="text-green-700">✉</span>
							<a href={`mailto:${user.email}`} class="hover:text-green-700">
								{user.email}
							</a>
						</div>
					</Show>
					<Show when={user.phone}>
						<div class="flex items-center gap-2">
							<span class="text-green-700">☎</span>
							<a href={`tel:${user.phone}`} class="hover:text-green-700">
								{user.phone}
							</a>
						</div>
					</Show>
					<Show when={profile.linkedin}>
						<div class="flex items-center gap-2">
							<span class="text-green-700">in</span>
							<a href={profile.linkedin} target="_blank" rel="noopener noreferrer" class="hover:text-green-700">
								{profile.linkedin?.split('/').pop() || ""}
							</a>
						</div>
					</Show>
				</div>
			</header>
			
			{/* Content Wrapper */}
			<div class="px-6 py-2 space-y-4">
				{/* Profile Section */}
				<Show when={settings.show_sections.summary && profile.description}>
					<section class="bg-white p-4 rounded shadow-sm">
						<h2 
							class="text-green-700 font-medium mb-2 pb-1 border-b border-green-100"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Profile
						</h2>
						<p 
							class="text-gray-700"
							style={{ "font-size": settings.font_size.body }}
						>
							{profile.description}
						</p>
					</section>
				</Show>
				
				{/* Professional Experience Section */}
				<Show when={settings.show_sections.experience && props.data.resume_data.experiences.filter(v => v.is_visible).length > 0}>
					<section class="bg-white p-4 rounded shadow-sm">
						<h2 
							class="text-green-700 font-medium mb-2 pb-1 border-b border-green-100"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Professional Experience
						</h2>
						<div class="space-y-3">
							<For each={props.data.resume_data.experiences.filter(v => v.is_visible)}>
								{(experience) => (
									<div>
										<div class="flex flex-wrap justify-between items-baseline gap-2">
											<h3 
												class="font-medium text-gray-800"
												style={{ "font-size": settings.font_size.subsection_title }}
											>
												{experience.job_title}
											</h3>
											<div class="text-sm text-gray-500">
												{experience.start_date} - {experience.is_current ? "Present" : experience.optional_end_date} | {experience.location}
											</div>
										</div>
										<p class="text-green-600">{experience.company_name}</p>
										<p
											class="mt-2 text-gray-700"
											style={{ "font-size": settings.font_size.body }}
										>
											{experience.description}
										</p>
									</div>
								)}
							</For>
						</div>
					</section>
				</Show>
				
				{/* Education Section */}
				<Show when={settings.show_sections.education && props.data.resume_data.educations.filter(v => v.is_visible).length > 0}>
					<section class="bg-white p-4 rounded shadow-sm">
						<h2 
							class="text-green-700 font-medium mb-2 pb-1 border-b border-green-100"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Education
						</h2>
						<div class="space-y-3">
							<For each={props.data.resume_data.educations.filter(v => v.is_visible)}>
								{(education) => (
									<div>
										<div class="flex flex-wrap justify-between items-baseline gap-2">
											<h3 
												class="font-medium text-gray-800"
												style={{ "font-size": settings.font_size.subsection_title }}
											>
												{education.degree}
											</h3>
											<div class="text-sm text-gray-500">
												{education.start_date} - {education.is_current ? "Present" : education.optional_end_date}
											</div>
										</div>
										<p class="text-green-600">{education.school}</p>
										<Show when={education.location}>
											<p class="text-gray-600 text-sm">{education.location}</p>
										</Show>
										<Show when={education.description}>
											<p 
												class="mt-1 text-gray-700"
												style={{ "font-size": settings.font_size.body }}
											>
												{education.description}
											</p>
										</Show>
									</div>
								)}
							</For>
						</div>
					</section>
				</Show>
				
				{/* Skills Section */}
				<Show when={settings.show_sections.skills && props.data.resume_data.skills.filter(v => v.is_visible).length > 0}>
					<section class="bg-white p-4 rounded shadow-sm">
						<h2 
							class="text-green-700 font-medium mb-2 pb-1 border-b border-green-100"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Skills
						</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<For each={props.data.resume_data.skills.filter(v => v.is_visible)}>
								{(skill) => (
									<div>
										<h3 class="font-medium text-gray-800">
											{skill.skill_name}
										</h3>
										<Show when={skill.description}>
											<p 
												class="text-gray-600 text-sm"
												style={{ "font-size": settings.font_size.body }}
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
				<Show when={settings.show_sections.projects && props.data.resume_data.projects.filter(v => v.is_visible).length > 0}>
					<section class="bg-white p-4 rounded shadow-sm">
						<h2 
							class="text-green-700 font-medium mb-2 pb-1 border-b border-green-100"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Projects
						</h2>
						<div class="space-y-3">
							<For each={props.data.resume_data.projects.filter(v => v.is_visible)}>
								{(project) => (
									<div>
										<div class="flex justify-between items-baseline">
											<h3 
												class="font-medium text-gray-800"
												style={{ "font-size": settings.font_size.subsection_title }}
											>
												{project.project_title}
											</h3>
											<Show when={project.start_date || project.optional_end_date}>
												<span class="text-sm text-gray-500">
													{project.start_date}
													{project.start_date && project.optional_end_date && " - "}
													{project.is_current ? "Present" : project.optional_end_date}
												</span>
											</Show>
										</div>
										<Show when={project.optional_project_subtitle}>
											<p class="text-green-600">
												{project.optional_project_subtitle}
											</p>
										</Show>
										<p 
											class="mt-1 text-gray-700"
											style={{ "font-size": settings.font_size.body }}
										>
											{project.description}
										</p>
									</div>
								)}
							</For>
						</div>
					</section>
				</Show>
				
				{/* Certificates Section */}
				<Show when={settings.show_sections.certificates && props.data.resume_data.certificates.filter(v => v.is_visible).length > 0}>
					<section class="bg-white p-4 rounded shadow-sm">
						<h2 
							class="text-green-700 font-medium mb-2 pb-1 border-b border-green-100"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Certifications
						</h2>
						<div class="space-y-3">
							<For each={props.data.resume_data.certificates.filter(v => v.is_visible)}>
								{(certificate) => (
									<div>
										<h3 class="font-medium text-gray-800">
											{certificate.certificate_name}
										</h3>
										<div class="flex flex-wrap gap-2 text-sm">
											<Show when={certificate.optional_issuer}>
												<span class="text-green-600">{certificate.optional_issuer}</span>
											</Show>
											<Show when={certificate.optional_granted_date}>
												<span class="text-gray-500">{certificate.optional_granted_date}</span>
											</Show>
										</div>
										<Show when={certificate.description}>
											<p 
												class="mt-1 text-gray-700 text-sm"
												style={{ "font-size": settings.font_size.body }}
											>
												{certificate.description}
											</p>
										</Show>
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