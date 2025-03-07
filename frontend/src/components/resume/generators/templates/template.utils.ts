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
