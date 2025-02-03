// CVGenerator.tsx
import { createSignal, For } from "solid-js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

interface PersonalInfo {
	name: string;
	title: string;
	email: string;
	phone: string;
	location: string;
	linkedIn: string;
}

interface Experience {
	company: string;
	position: string;
	period: string;
	achievements: string[];
}

interface Education {
	institution: string;
	degree: string;
	year: string;
}

interface CVData {
	personalInfo: PersonalInfo;
	summary: string;
	experience: Experience[];
	education: Education[];
	skills: string[];
}

const mockData: CVData = {
	personalInfo: {
		name: "John Doe",
		title: "Senior Software Engineer",
		email: "john.doe@email.com",
		phone: "+1 234 567 890",
		location: "San Francisco, CA",
		linkedIn: "linkedin.com/in/johndoe",
	},
	summary:
		"Experienced software engineer with 8+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies.",
	experience: [
		{
			company: "Tech Solutions Inc.",
			position: "Senior Software Engineer",
			period: "2020 - Present",
			achievements: [
				"Led development of microservices architecture serving 1M+ users",
				"Improved system performance by 40% through optimization",
				"Mentored junior developers and established best practices",
			],
		},
		{
			company: "Digital Innovations Co.",
			position: "Software Engineer",
			period: "2017 - 2020",
			achievements: [
				"Developed and maintained multiple client-facing applications",
				"Implemented CI/CD pipeline reducing deployment time by 60%",
				"Collaborated with cross-functional teams to deliver projects on time",
			],
		},
	],
	education: [
		{
			institution: "University of Technology",
			degree: "Master of Computer Science",
			year: "2017",
		},
		{
			institution: "State University",
			degree: "Bachelor of Computer Science",
			year: "2015",
		},
	],
	skills: [
		"JavaScript/TypeScript",
		"React/Solid.js",
		"Node.js",
		"Python",
		"AWS",
		"Docker",
		"MongoDB",
		"Git",
	],
};

const CVGenerator = () => {
	const [isGenerating, setIsGenerating] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	let cv_ref: HTMLDivElement | undefined = undefined;

	const generatePDF = async () => {
		setIsGenerating(true);
		setError(null);

		try {
			if (!cv_ref) return;

			// Create canvas with better quality settings and explicit RGB colors
			const canvas = await html2canvas(cv_ref, {
				scale: 2,
				logging: false,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
				//   letterRendering: true,
				removeContainer: true, // Helps with color space issues
			});

			const imgWidth = 210; // A4 width in mm
			const pixelRatio = canvas.width / canvas.height;
			const imgHeight = imgWidth / pixelRatio;

			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
				compress: true,
			});

			const imgData = canvas.toDataURL("image/jpeg", 1.0);
			pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
			pdf.save("cv.pdf");
		} catch (err) {
			console.error("Error generating PDF:", err);
			setError(
				err instanceof Error ? err.message : "Failed to generate PDF"
			);
		} finally {
			setIsGenerating(false);
		}
	};

	// Custom styles using standard RGB colors
	const styles = {
		button: {
			primary:
				"bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed",
			error: "text-[#ef4444] text-sm",
		},
		header: {
			name: "text-3xl font-bold text-[#1f2937]",
			title: "text-xl text-[#2563eb] mt-1",
			contact: "text-sm text-[#4b5563] flex flex-wrap gap-4",
		},
		section: {
			title: "text-lg font-semibold text-[#1f2937] mb-2",
			content: "text-[#374151] leading-relaxed",
			subsection: {
				title: "text-base font-semibold text-[#1f2937]",
				period: "text-sm text-[#4b5563]",
				company: "text-[#2563eb]",
			},
		},
		skills: {
			tag: "bg-[#f3f4f6] text-[#374151] px-3 py-1 rounded-full text-sm",
		},
	};

	return (
		<div class="p-4">
			<div class="mb-8 flex flex-col items-start gap-4">
				<button
					class={styles.button.primary}
					onClick={generatePDF}
					disabled={isGenerating()}
				>
					{isGenerating() ? "Generating PDF..." : "Download PDF"}
				</button>

				{error() && (
					<div class={styles.button.error}>Error: {error()}</div>
				)}
			</div>

			<div
				ref={cv_ref}
				id="cv-template"
				class="max-w-[210mm] mx-auto bg-white shadow-lg p-8"
			>
				{/* Header Section */}
				<header class="border-b border-[#e5e7eb] pb-4">
					<h1 class={styles.header.name}>
						{mockData.personalInfo.name}
					</h1>
					<h2 class={styles.header.title}>
						{mockData.personalInfo.title}
					</h2>
					<div class={styles.header.contact}>
						<span class="flex items-center">
							<svg
								class="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							{mockData.personalInfo.email}
						</span>
						<span class="flex items-center">
							<svg
								class="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/>
							</svg>
							{mockData.personalInfo.phone}
						</span>
					</div>
				</header>

				{/* Summary Section */}
				<section class="mt-6">
					<h3 class={styles.section.title}>Professional Summary</h3>
					<p class={styles.section.content}>{mockData.summary}</p>
				</section>

				{/* Experience Section */}
				<section class="mt-6">
					<h3 class={styles.section.title}>
						Professional Experience
					</h3>
					<For each={mockData.experience}>
						{(exp) => (
							<div class="mb-4">
								<div class="flex justify-between items-baseline">
									<h4 class={styles.section.subsection.title}>
										{exp.position}
									</h4>
									<span
										class={styles.section.subsection.period}
									>
										{exp.period}
									</span>
								</div>
								<p class={styles.section.subsection.company}>
									{exp.company}
								</p>
								<ul class="mt-2 list-disc list-inside text-[#374151]">
									<For each={exp.achievements}>
										{(achievement) => (
											<li class="mb-1">{achievement}</li>
										)}
									</For>
								</ul>
							</div>
						)}
					</For>
				</section>

				{/* Education Section */}
				<section class="mt-6">
					<h3 class={styles.section.title}>Education</h3>
					<For each={mockData.education}>
						{(edu) => (
							<div class="mb-3">
								<div class="flex justify-between items-baseline">
									<h4 class={styles.section.subsection.title}>
										{edu.degree}
									</h4>
									<span
										class={styles.section.subsection.period}
									>
										{edu.year}
									</span>
								</div>
								<p class={styles.section.subsection.company}>
									{edu.institution}
								</p>
							</div>
						)}
					</For>
				</section>

				{/* Skills Section */}
				<section class="mt-6">
					<h3 class={styles.section.title}>Skills</h3>
					<div class="flex flex-wrap gap-2">
						<For each={mockData.skills}>
							{(skill) => (
								<span class={styles.skills.tag}>{skill}</span>
							)}
						</For>
					</div>
				</section>
			</div>
		</div>
	);
};

export default CVGenerator;
