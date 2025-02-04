export interface ContactInfo {
	name: string;
	email: string;
	phone?: string;
	location?: string;
	linkedin?: string;
	website?: string;
}

export interface TemplateData {
	contact: ContactInfo;
	professional_summary?: string;
	experiences: Experience[];
	educations: Education[];
	skills: Skill[];
	certificates: Certificate[];
	projects: Project[];
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
