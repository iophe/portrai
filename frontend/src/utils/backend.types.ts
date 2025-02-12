interface Experience {
	experience_id: number;
	company_name: string;
	job_title: string;
	location: string;
	start_date: string;
	end_date: string;
	is_current: boolean;
	description: string;
	priority: number;
	tags: string[];
	notes: Record<string, any>[];
}

interface ExperienceResponse {
	experience: Experience;
}

interface ExperiencesResponse {
	experiences: Experience[];
}
