import { For, Show } from "solid-js";
import { TemplateData, TemplateSettings } from "./template.utils";

interface TemplateProps {
	data: TemplateData;
	settings?: TemplateSettings;
}

export function ExecutiveTemplate(props: TemplateProps) {
	const settings = {
		font_size: {
			name: "2.5rem",
			section_title: "1.5rem",
			subsection_title: "1.25rem",
			body: "1rem",
			...props.settings?.font_size,
		},
		spacing: {
			section: "2rem",
			subsection: "1.5rem",
			item: "1rem",
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
		<div class="p-8 font-serif h-full w-full text-black bg-white">
			{/* Header Section */}
			<header class="text-center mb-4">
				<h1 class="font-bold uppercase tracking-wide">
					{props.data.user?.full_name}
				</h1>
				<div class="mt-2 text-sm text-gray-700">
					<div class="flex justify-center items-center gap-4 mb-1">
						<span>{props.data.user?.email}</span>
						<Show when={props.data.user?.phone}>
							<span>•</span>
							<span>{props.data.user?.phone}</span>
						</Show>
						<Show when={props.data.user?.location}>
							<span>•</span>
							<span>{props.data.user?.location}</span>
						</Show>
					</div>
					<div class="flex justify-center gap-4">
						{props.data.profile?.linkedin && (
							<a
								href={props.data.profile?.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-blue-600 transition-colors"
							>
								LinkedIn
							</a>
						)}
						{props.data.profile?.website && (
							<a
								href={props.data.profile?.website}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-blue-600 transition-colors"
							>
								Website
							</a>
						)}
					</div>
				</div>
			</header>

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
						class="font-bold border-b border-black pb-1 mb-3 uppercase"
						style={{
							"font-size": settings.font_size.section_title,
						}}
					>
						Profile
					</h2>
					<p
						class="text-justify"
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
					props.data.resume_data.experiences.filter(
						(v) => v.is_visible
					).length > 0
				}
			>
				<section class="mb-6">
					<h2
						class="font-bold border-b border-black pb-1 mb-3 uppercase"
						style={{
							"font-size": settings.font_size.section_title,
						}}
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
								<div class="flex justify-between items-baseline">
									<h3
										class="font-bold"
										style={{
											"font-size":
												settings.font_size
													.subsection_title,
										}}
									>
										{experience.job_title}
									</h3>
									<span class="text-sm">
										{experience.start_date} -{" "}
										{experience.is_current
											? "Present"
											: experience.optional_end_date}
									</span>
								</div>
								<div class="flex justify-between items-baseline">
									<h4 class="italic">
										{experience.company_name}
									</h4>
									<span class="text-sm">
										{experience.location}
									</span>
								</div>
								<p
									class="mt-2 text-justify"
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
						class="font-bold border-b border-black pb-1 mb-3 uppercase"
						style={{
							"font-size": settings.font_size.section_title,
						}}
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
								<div class="flex justify-between items-baseline">
									<h3
										class="font-bold"
										style={{
											"font-size":
												settings.font_size
													.subsection_title,
										}}
									>
										{education.degree}
									</h3>
									<span class="text-sm">
										{education.start_date} -{" "}
										{education.is_current
											? "Present"
											: education.optional_end_date}
									</span>
								</div>
								<div class="flex justify-between items-baseline">
									<h4 class="italic">{education.school}</h4>
									<span class="text-sm">
										{education.location}
									</span>
								</div>
								<Show when={education.description}>
									<p
										class="mt-2 text-justify"
										style={{
											"font-size":
												settings.font_size.body,
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
						class="font-bold border-b border-black pb-1 mb-3 uppercase"
						style={{
							"font-size": settings.font_size.section_title,
						}}
					>
						Skills & Expertise
					</h2>
					<div class="grid grid-cols-1 gap-4">
						<For
							each={props.data.resume_data.skills.filter(
								(v) => v.is_visible
							)}
						>
							{(skill) => (
								<div>
									<h3
										class="font-bold mb-2"
										style={{
											"font-size":
												settings.font_size
													.subsection_title,
										}}
									>
										{skill.skill_name}
									</h3>
									<p
										style={{
											"font-size":
												settings.font_size.body,
										}}
									>
										{skill.description}
									</p>
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
						class="font-bold border-b border-black pb-1 mb-3 uppercase"
						style={{
							"font-size": settings.font_size.section_title,
						}}
					>
						Notable Projects
					</h2>
					<For
						each={props.data.resume_data.projects.filter(
							(v) => v.is_visible
						)}
					>
						{(project) => (
							<div class="mb-4">
								<div class="flex justify-between items-baseline">
									<h3
										class="font-bold"
										style={{
											"font-size":
												settings.font_size
													.subsection_title,
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
										<span class="text-sm">
											{project.start_date} -{" "}
											{project.is_current
												? "Present"
												: project.optional_end_date}
										</span>
									</Show>
								</div>
								<Show when={project.optional_project_subtitle}>
									<h4 class="italic">
										{project.optional_project_subtitle}
									</h4>
								</Show>
								<p
									class="mt-2 text-justify"
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
						class="font-bold border-b border-black pb-1 mb-3 uppercase"
						style={{
							"font-size": settings.font_size.section_title,
						}}
					>
						Certifications
					</h2>
					<For
						each={props.data.resume_data.certificates.filter(
							(v) => v.is_visible
						)}
					>
						{(certificate) => (
							<div class="mb-4">
								<div class="flex justify-between items-baseline">
									<h3
										class="font-bold"
										style={{
											"font-size":
												settings.font_size
													.subsection_title,
										}}
									>
										{certificate.certificate_name}
									</h3>
									<Show
										when={certificate.optional_granted_date}
									>
										<span class="text-sm">
											{certificate.optional_granted_date}
										</span>
									</Show>
								</div>
								<Show when={certificate.optional_issuer}>
									<h4 class="italic">
										{certificate.optional_issuer}
									</h4>
								</Show>
								<Show when={certificate.description}>
									<p
										class="mt-2 text-justify"
										style={{
											"font-size":
												settings.font_size.body,
										}}
									>
										{certificate.description}
									</p>
								</Show>
							</div>
						)}
					</For>
				</section>
			</Show>
		</div>
	);
}
