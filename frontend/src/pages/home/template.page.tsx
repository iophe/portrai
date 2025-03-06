import Header from "@components/header.default";
import { Component, JSX, Show, createSignal } from "solid-js";

// Types communs pour les données de CV
interface ResumeData {
	contact: {
		name: string;
		email: string;
		phone: string;
		location: string;
		linkedin?: string;
		website?: string;
	};
	summary?: string;
	experience: {
		title: string;
		company: string;
		dates: string;
		description: string[];
	}[];
	education: {
		degree: string;
		school: string;
		dates: string;
		honors?: string[];
	}[];
	skills: string[];
}

// Template Moderne Minimaliste
export const ModernMinimalistTemplate: Component<{ data: ResumeData }> = (
	props
) => {
	return (
		<div class="bg-white p-8 font-sans max-w-4xl mx-auto">
			<header class="text-center mb-8">
				<h1 class="text-4xl font-bold text-gray-800 tracking-wide">
					{props.data.contact.name}
				</h1>
				<div class="mt-2 text-sm text-gray-600 flex justify-center gap-4">
					<span>{props.data.contact.email}</span>
					<span>•</span>
					<span>{props.data.contact.phone}</span>
					<span>•</span>
					<span>{props.data.contact.location}</span>
				</div>
				<div class="mt-2 flex justify-center gap-4">
					{props.data.contact.linkedin && (
						<a
							href={props.data.contact.linkedin}
							target="_blank"
							class="text-blue-600 hover:underline"
						>
							LinkedIn
						</a>
					)}
					{props.data.contact.website && (
						<a
							href={props.data.contact.website}
							target="_blank"
							class="text-blue-600 hover:underline"
						>
							Website
						</a>
					)}
				</div>
			</header>

			{props.data.summary && (
				<section class="mb-6">
					<h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3">
						Professional Summary
					</h2>
					<p class="text-gray-700">{props.data.summary}</p>
				</section>
			)}

			<section class="mb-6">
				<h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3">
					Professional Experience
				</h2>
				{props.data.experience.map((exp) => (
					<div class="mb-4">
						<div class="flex justify-between">
							<h3 class="font-bold">
								{exp.title} | {exp.company}
							</h3>
							<span class="text-sm text-gray-600">
								{exp.dates}
							</span>
						</div>
						<ul class="list-disc pl-5 mt-2">
							{exp.description.map((desc) => (
								<li class="text-gray-700">{desc}</li>
							))}
						</ul>
					</div>
				))}
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3">
					Education
				</h2>
				{props.data.education.map((edu) => (
					<div class="mb-4">
						<div class="flex justify-between">
							<h3 class="font-bold">
								{edu.degree} | {edu.school}
							</h3>
							<span class="text-sm text-gray-600">
								{edu.dates}
							</span>
						</div>
						{edu.honors && (
							<div class="mt-2">
								<strong class="text-sm">Honors:</strong>
								<ul class="list-disc pl-5">
									{edu.honors.map((honor) => (
										<li class="text-gray-700">{honor}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				))}
			</section>

			<section class="mt-6">
				<h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3">
					Skills
				</h2>
				<div class="flex flex-wrap gap-2">
					{props.data.skills.map((skill) => (
						<span class="bg-gray-200 px-3 py-1 rounded-full text-sm">
							{skill}
						</span>
					))}
				</div>
			</section>
		</div>
	);
};

// Template Professionnel Classique
export const ClassicProfessionalTemplate: Component<{ data: ResumeData }> = (
	props
) => {
	return (
		<div class="bg-white p-8 font-serif max-w-4xl mx-auto shadow-lg">
			<header class="text-center mb-8 border-b-2 border-gray-300 pb-4">
				<h1 class="text-4xl font-bold text-gray-900 mb-2">
					{props.data.contact.name}
				</h1>
				<div class="text-gray-700">
					<p>
						{props.data.contact.email} | {props.data.contact.phone}
					</p>
					<p>{props.data.contact.location}</p>
				</div>
			</header>

			{props.data.summary && (
				<section class="mb-6">
					<h2 class="text-xl font-bold text-gray-800 mb-3">
						Professional Profile
					</h2>
					<p class="text-gray-700 italic">{props.data.summary}</p>
				</section>
			)}

			<section class="mb-6">
				<h2 class="text-xl font-bold text-gray-800 mb-3">
					Professional Experience
				</h2>
				{props.data.experience.map((exp) => (
					<div class="mb-4 pb-4 border-b border-gray-200">
						<div class="flex justify-between items-baseline">
							<h3 class="font-bold text-gray-900">{exp.title}</h3>
							<span class="text-sm text-gray-600">
								{exp.dates}
							</span>
						</div>
						<h4 class="italic text-gray-700 mb-2">{exp.company}</h4>
						<ul class="list-disc pl-5">
							{exp.description.map((desc) => (
								<li class="text-gray-700">{desc}</li>
							))}
						</ul>
					</div>
				))}
			</section>

			<section>
				<h2 class="text-xl font-bold text-gray-800 mb-3">Education</h2>
				{props.data.education.map((edu) => (
					<div class="mb-4">
						<div class="flex justify-between items-baseline">
							<h3 class="font-bold text-gray-900">
								{edu.degree}
							</h3>
							<span class="text-sm text-gray-600">
								{edu.dates}
							</span>
						</div>
						<h4 class="italic text-gray-700 mb-2">{edu.school}</h4>
						{edu.honors && (
							<div>
								<strong class="text-gray-800">Honors:</strong>
								<ul class="list-disc pl-5">
									{edu.honors.map((honor) => (
										<li class="text-gray-700">{honor}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				))}
			</section>

			<section class="mt-6">
				<h2 class="text-xl font-bold text-gray-800 mb-3">Skills</h2>
				<div class="flex flex-wrap gap-2">
					{props.data.skills.map((skill) => (
						<span class="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
							{skill}
						</span>
					))}
				</div>
			</section>
		</div>
	);
};

// Template Créatif
export const CreativeTemplate: Component<{ data: ResumeData }> = (props) => {
	return (
		<div class="bg-white p-8 font-sans max-w-4xl mx-auto relative">
			<div class="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
			<header class="mb-8 pl-4">
				<h1 class="text-4xl font-bold text-gray-900 mb-2 border-b-4 border-blue-500 pb-2">
					{props.data.contact.name}
				</h1>
				<div class="flex justify-between items-center">
					<div class="text-gray-700">
						<p>{props.data.contact.email}</p>
						<p>{props.data.contact.phone}</p>
						<p>{props.data.contact.location}</p>
					</div>
					<div class="flex gap-3">
						{props.data.contact.linkedin && (
							<a
								href={props.data.contact.linkedin}
								target="_blank"
								class="text-blue-600 hover:text-blue-800"
							>
								LinkedIn
							</a>
						)}
						{props.data.contact.website && (
							<a
								href={props.data.contact.website}
								target="_blank"
								class="text-blue-600 hover:text-blue-800"
							>
								Website
							</a>
						)}
					</div>
				</div>
			</header>

			{props.data.summary && (
				<section class="mb-6 pl-4">
					<h2 class="text-xl font-semibold text-blue-600 mb-3">
						Professional Summary
					</h2>
					<p class="text-gray-700 bg-blue-50 p-3 rounded">
						{props.data.summary}
					</p>
				</section>
			)}

			<section class="mb-6 pl-4">
				<h2 class="text-xl font-semibold text-blue-600 mb-3">
					Professional Experience
				</h2>
				{props.data.experience.map((exp) => (
					<div class="mb-4 p-3 hover:bg-blue-50 transition-colors rounded">
						<div class="flex justify-between items-baseline">
							<h3 class="font-bold text-gray-900">
								{exp.title} @ {exp.company}
							</h3>
							<span class="text-sm text-gray-600">
								{exp.dates}
							</span>
						</div>
						<ul class="list-disc pl-5 mt-2">
							{exp.description.map((desc) => (
								<li class="text-gray-700">{desc}</li>
							))}
						</ul>
					</div>
				))}
			</section>

			<section class="pl-4">
				<h2 class="text-xl font-semibold text-blue-600 mb-3">
					Education
				</h2>
				{props.data.education.map((edu) => (
					<div class="mb-4 p-3 hover:bg-blue-50 transition-colors rounded">
						<div class="flex justify-between items-baseline">
							<h3 class="font-bold text-gray-900">
								{edu.degree}
							</h3>
							<span class="text-sm text-gray-600">
								{edu.dates}
							</span>
						</div>
						<h4 class="italic text-gray-700">{edu.school}</h4>
						{edu.honors && (
							<div class="mt-2">
								<strong class="text-gray-800">Honors:</strong>
								<ul class="list-disc pl-5">
									{edu.honors.map((honor) => (
										<li class="text-gray-700">{honor}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				))}
			</section>

			<section class="mt-6 pl-4">
				<h2 class="text-xl font-semibold text-blue-600 mb-3">Skills</h2>
				<div class="flex flex-wrap gap-2">
					{props.data.skills.map((skill) => (
						<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
							{skill}
						</span>
					))}
				</div>
			</section>
		</div>
	);
};

// Données de sample pour démonstration
const sampleData: ResumeData = {
	contact: {
		name: "Jane Doe",
		email: "jane.doe@email.com",
		phone: "(555) 123-4567",
		location: "San Francisco, CA",
		linkedin: "https://linkedin.com/in/janedoe",
		website: "https://janedoe.com",
	},
	summary:
		"Innovative and results-driven software engineer with 5+ years of experience in developing scalable web applications and leading cross-functional teams.",
	experience: [
		{
			title: "Senior Software Engineer",
			company: "TechCorp Inc.",
			dates: "Jan 2020 - Present",
			description: [
				"Led development of microservices architecture increasing system performance by 40%",
				"Implemented CI/CD pipelines reducing deployment time by 60%",
			],
		},
		{
			title: "Software Engineer",
			company: "StartUp Solutions",
			dates: "Jun 2017 - Dec 2019",
			description: [
				"Developed responsive web applications using React and Node.js",
				"Collaborated with UX team to improve user interface design",
			],
		},
	],
	education: [
		{
			degree: "Master of Science in Computer Science",
			school: "Stanford University",
			dates: "Sep 2015 - May 2017",
			honors: ["Dean's List", "Academic Excellence Award"],
		},
		{
			degree: "Bachelor of Science in Computer Engineering",
			school: "UC Berkeley",
			dates: "Sep 2011 - May 2015",
		},
	],
	skills: [
		"JavaScript",
		"React",
		"Node.js",
		"TypeScript",
		"Docker",
		"Kubernetes",
	],
};

const Templates: Component = () => {
	const [selectedTemplate, setSelectedTemplate] = createSignal<
		"modern" | "classic" | "creative"
	>("modern");
	const [isModalOpen, setIsModalOpen] = createSignal(false);

	const templates = [
		{
			id: "modern",
			name: "Modern Minimalist",
			preview: () => <ModernMinimalistTemplate data={sampleData} />,
			description:
				"A clean, minimalist design focusing on clarity and readability.",
		},
		{
			id: "classic",
			name: "Classic Professional",
			preview: () => <ClassicProfessionalTemplate data={sampleData} />,
			description:
				"A traditional, elegant template perfect for corporate environments.",
		},
		{
			id: "creative",
			name: "Creative",
			preview: () => <CreativeTemplate data={sampleData} />,
			description:
				"A modern, visually engaging design with subtle creative elements.",
		},
	];

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />

			<div class="container mx-auto p-8">
				<h1 class="text-3xl font-bold mb-8 text-center">
					Select Your Resume Template
				</h1>

				<div class="flex justify-center space-x-6 mb-8">
					{templates.map((template) => (
						<button
							class={`
                            px-4 py-2 rounded-lg transition-all duration-300
                            ${
								selectedTemplate() === template.id
									? "bg-blue-500 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}
                        `}
							onClick={() =>
								setSelectedTemplate(template.id as any)
							}
						>
							{template.name}
						</button>
					))}
				</div>

				<div class="flex justify-center mb-8">
					<div class="w-[210mm] max-w-full border-2 border-gray-200 rounded-lg p-2 shadow-lg">
						{templates
							.find((t) => t.id === selectedTemplate())
							?.preview()}
					</div>
				</div>

				<div class="text-center">
					<div class="mb-4 text-gray-600">
						{
							templates.find((t) => t.id === selectedTemplate())
								?.description
						}
					</div>
					<button
						class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
						onClick={() => setIsModalOpen(true)}
					>
						Use This Template
					</button>
				</div>

				<Show when={isModalOpen()}>
					<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div class="bg-white p-8 rounded-lg max-w-md w-full">
							<h2 class="text-2xl font-bold mb-4">
								Confirm Template Selection
							</h2>
							<p class="mb-6">
								You've selected the{" "}
								{
									templates.find(
										(t) => t.id === selectedTemplate()
									)?.name
								}{" "}
								template. Would you like to proceed?
							</p>
							<div class="flex justify-end space-x-4">
								<button
									class="px-4 py-2 bg-gray-200 rounded-lg"
									onClick={() => setIsModalOpen(false)}
								>
									Cancel
								</button>
								<button
									class="px-4 py-2 bg-green-500 text-white rounded-lg"
									onClick={() => {
										// Logique de sélection du template
										console.log(
											`Selected template: ${selectedTemplate()}`
										);
										setIsModalOpen(false);
									}}
								>
									Confirm
								</button>
							</div>
						</div>
					</div>
				</Show>
			</div>
		</main>
	);
};

export default Templates;
