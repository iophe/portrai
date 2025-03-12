import { For } from "solid-js";

export interface TemplateData {
	profile?: Profile;
	user?: User;
	resume_data: ResumeData;
}

// Optional settings for template customization
export interface TemplateSettings {
	font_size?: {
		name: string;
		section_title: string;
		subsection_title: string;
		body: string;
	};
	spacing?: {
		section: string;
		subsection: string;
		item: string;
	};
	show_sections?: {
		summary: boolean;
		experience: boolean;
		education: boolean;
		skills: boolean;
		certificates: boolean;
		projects: boolean;
	};
}


interface PDFTextProps {
	src: string;
	font_size: string;
	box?: boolean;
	glue?: boolean;
	penalty?: boolean;
}

export function PDFText(props: PDFTextProps) {
	const paragraphs = props.src.split("\n").filter((sub) => sub.trim() !== "");

	return (
		<For each={paragraphs}>
			{(text, i) => {
				return (
					<div class="pdf-box" classList={{ "pdf-boxup": i() === 0 }}>
						<p
							class="mt-2 text-justify"
							style={{
								"font-size": props.font_size,
							}}
						>
							{text}
						</p>
					</div>
				);
			}}
		</For>
	);
}