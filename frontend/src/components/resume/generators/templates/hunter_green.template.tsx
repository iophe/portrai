import { For, Show } from "solid-js";
import { TemplateData, TemplateSettings } from "./template.utils";

interface TemplateProps {
	data: TemplateData;
	settings?: TemplateSettings;
}

export function HunterGreenTemplate(props: TemplateProps) {
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
			name: "1.8rem",
			section_title: "1.2rem",
			subsection_title: "1.1rem",
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
		<article class="h-full w-full text-gray-800 bg-white font-sans flex flex-col md:flex-row">
			{/* Left Sidebar */}
			<aside class="bg-green-800 text-white p-6 md:w-1/3 flex flex-col">
				<header class="mb-8">
					<h1 
						class="font-bold mb-2" 
						style={{ "font-size": settings.font_size.name }}
					>
						{user.full_name}
					</h1>
				</header>
				
				{/* Contact Information */}
				<section class="mb-6">
					<h2 
						class="uppercase tracking-wider font-semibold mb-3 border-b border-green-700 pb-1"
						style={{ "font-size": settings.font_size.section_title }}
					>
						Contact
					</h2>
					<ul class="space-y-2 text-green-100">
						<Show when={user.email}>
							<li class="flex items-start gap-2">
								<span class="mt-1">✉</span>
								<a href={`mailto:${user.email}`} class="hover:text-white">
									{user.email}
								</a>
							</li>
						</Show>
						<Show when={user.phone}>
							<li class="flex items-start gap-2">
								<span class="mt-1">☎</span>
								<a href={`tel:${user.phone}`} class="hover:text-white">
									{user.phone}
								</a>
							</li>
						</Show>
						<Show when={user.location}>
							<li class="flex items-start gap-2">
								<span class="mt-1">⌂</span>
								<span>{user.location}</span>
							</li>
						</Show>
						<Show when={profile.linkedin}>
							<li class="flex items-start gap-2">
								<span class="mt-1">in</span>
								<a href={profile.linkedin} target="_blank" rel="noopener noreferrer" class="hover:text-white">
								www.linkedin.com
								</a>
							</li>
						</Show>
						<Show when={profile.website}>
							<li class="flex items-start gap-2">
								<span class="mt-1">🌐</span>
								<a href={profile.website} target="_blank" rel="noopener noreferrer" class="hover:text-white">
									{profile.website?.replace(/^https?:\/\/(www\.)?/, '')}
								</a>
							</li>
						</Show>
					</ul>
				</section>
				
				{/* Profile Section */}
				<Show when={profile.description}>
					<section class="mb-6">
						<h2 
							class="uppercase tracking-wider font-semibold mb-3 border-b border-green-700 pb-1"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Profile
						</h2>
						<p class="text-green-100" style={{ "font-size": settings.font_size.body }}>
							{profile.description}
						</p>
					</section>
				</Show>
				
				{/* Skills Section in Sidebar */}
				<Show when={settings.show_sections.skills && props.data.resume_data.skills.filter(v => v.is_visible).length > 0}>
					<section class="mb-6">
						<h2 
							class="uppercase tracking-wider font-semibold mb-3 border-b border-green-700 pb-1"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Skills
						</h2>
						<ul class="space-y-2">
							<For each={props.data.resume_data.skills.filter(v => v.is_visible)}>
								{(skill) => (
									<li>
										<h3 class="font-medium text-white">
											{skill.skill_name}
											<Show when={skill.optional_skill_level}>
												<span class="ml-2 text-green-200 text-sm">
													{skill.optional_skill_level}
												</span>
											</Show>
										</h3>
										<Show when={skill.description}>
											<p class="text-green-100 text-sm mt-1">
												{skill.description}
											</p>
										</Show>
									</li>
								)}
							</For>
						</ul>
					</section>
				</Show>
				
				{/* Languages or Certificates can also go in sidebar */}
				<Show when={settings.show_sections.certificates && props.data.resume_data.certificates.filter(v => v.is_visible).length > 0}>
					<section class="mb-6">
						<h2 
							class="uppercase tracking-wider font-semibold mb-3 border-b border-green-700 pb-1"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Certifications
						</h2>
						<ul class="space-y-2">
							<For each={props.data.resume_data.certificates.filter(v => v.is_visible)}>
								{(certificate) => (
									<li>
										<h3 class="font-medium text-white">
											{certificate.certificate_name}
										</h3>
										<Show when={certificate.optional_issuer}>
											<p class="text-green-200 text-sm">
												{certificate.optional_issuer}
											</p>
										</Show>
										<Show when={certificate.optional_granted_date}>
											<p class="text-green-200 text-sm">
												{certificate.optional_granted_date}
											</p>
										</Show>
									</li>
								)}
							</For>
						</ul>
					</section>
				</Show>
			</aside>
			
			{/* Main Content */}
			<main class="p-6 md:w-2/3">
				{/* Experience Section */}
				<Show when={settings.show_sections.experience && props.data.resume_data.experiences.filter(v => v.is_visible).length > 0}>
					<section class="mb-6">
						<h2 
							class="font-semibold text-green-800 border-b border-green-700 pb-1 mb-4"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Professional Experience
						</h2>
						<For each={props.data.resume_data.experiences.filter(v => v.is_visible)}>
							{(experience) => (
								<div class="mb-5">
									<div class="flex flex-col md:flex-row md:justify-between md:items-baseline">
										<h3 
											class="font-bold text-gray-800"
											style={{ "font-size": settings.font_size.subsection_title }}
										>
											{experience.job_title}
										</h3>
										<div class="text-sm text-gray-600">
											{experience.start_date} - {experience.is_current ? "present" : experience.optional_end_date}
										</div>
									</div>
									
									<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mt-1">
										<h4 class="text-green-700 font-medium">{experience.company_name}</h4>
										<div class="text-sm text-gray-600">{experience.location}</div>
									</div>
									
									<p 
										class="mt-2 text-gray-700"
										style={{ "font-size": settings.font_size.body }}
									>
										{experience.description}
									</p>
								</div>
							)}
						</For>
					</section>
				</Show>
				
				{/* Education Section */}
				<Show when={settings.show_sections.education && props.data.resume_data.educations.filter(v => v.is_visible).length > 0}>
					<section class="mb-6">
						<h2 
							class="font-semibold text-green-800 border-b border-green-700 pb-1 mb-4"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Education
						</h2>
						<For each={props.data.resume_data.educations.filter(v => v.is_visible)}>
							{(education) => (
								<div class="mb-4">
									<div class="flex flex-col md:flex-row md:justify-between md:items-baseline">
										<h3 
											class="font-bold text-gray-800"
											style={{ "font-size": settings.font_size.subsection_title }}
										>
											{education.degree}
										</h3>
										<div class="text-sm text-gray-600">
											{education.start_date} - {education.is_current ? "present" : education.optional_end_date}
										</div>
									</div>
									
									<div class="flex flex-col md:flex-row md:justify-between md:items-baseline mt-1">
										<h4 class="text-green-700 font-medium">{education.school}</h4>
										<div class="text-sm text-gray-600">{education.location}</div>
									</div>
									
									<Show when={education.description}>
										<p 
											class="mt-2 text-gray-700"
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
				
				{/* Projects Section */}
				<Show when={settings.show_sections.projects && props.data.resume_data.projects.filter(v => v.is_visible).length > 0}>
					<section class="mb-6">
						<h2 
							class="font-semibold text-green-800 border-b border-green-700 pb-1 mb-4"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Projects
						</h2>
						<For each={props.data.resume_data.projects.filter(v => v.is_visible)}>
							{(project) => (
								<div class="mb-4">
									<div class="flex flex-col md:flex-row md:justify-between md:items-baseline">
										<h3 
											class="font-bold text-gray-800"
											style={{ "font-size": settings.font_size.subsection_title }}
										>
											{project.project_title}
										</h3>
										<Show when={project.start_date || project.optional_end_date}>
											<div class="text-sm text-gray-600">
												{project.start_date} 
												{project.start_date && project.optional_end_date && " - "} 
												{project.is_current ? "present" : project.optional_end_date}
											</div>
										</Show>
									</div>
									
									<Show when={project.optional_project_subtitle}>
										<h4 class="text-green-700 font-medium mt-1">
											{project.optional_project_subtitle}
										</h4>
									</Show>
									
									<p 
										class="mt-2 text-gray-700"
										style={{ "font-size": settings.font_size.body }}
									>
										{project.description}
									</p>
								</div>
							)}
						</For>
					</section>
				</Show>
				
				{/* Awards Section */}
				<Show when={props.data.resume_data.certificates.filter(v => v.is_visible).length > 0 && !settings.show_sections.certificates}>
					<section class="mb-6">
						<h2 
							class="font-semibold text-green-800 border-b border-green-700 pb-1 mb-4"
							style={{ "font-size": settings.font_size.section_title }}
						>
							Awards
						</h2>
						<For each={props.data.resume_data.certificates.filter(v => v.is_visible)}>
							{(award) => (
								<div class="mb-3">
									<h3 
										class="font-bold text-gray-800"
										style={{ "font-size": settings.font_size.subsection_title }}
									>
										{award.certificate_name}
									</h3>
									<div class="flex items-center gap-2">
										<Show when={award.optional_issuer}>
											<span class="text-green-700 font-medium">
												{award.optional_issuer}
											</span>
										</Show>
										<Show when={award.optional_granted_date}>
											<span class="text-sm text-gray-600">
												{award.optional_granted_date}
											</span>
										</Show>
									</div>
									<Show when={award.description}>
										<p 
											class="mt-1 text-gray-700"
											style={{ "font-size": settings.font_size.body }}
										>
											{award.description}
										</p>
									</Show>
								</div>
							)}
						</For>
					</section>
				</Show>
			</main>
		</article>
	);
}