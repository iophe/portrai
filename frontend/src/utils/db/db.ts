import Dexie, { Table } from "dexie";

export interface JobSpecificResume {
	id?: number;
	title: string;
	job_description: string;
	resume_data: ResumeData;
	created_at: Date;
	last_modified_at: Date;
}

export class AppDatabase extends Dexie {
	job_specific_resumes!: Table<JobSpecificResume, string>;

	constructor() {
		super("AppDatabase");
		this.version(1).stores({
			job_specific_resumes: "++id, title",
		});

		// Add hooks for automatic date handling
		this.job_specific_resumes.hook("creating", function (primary_key, obj) {
			obj.created_at = new Date();
			obj.last_modified_at = new Date();
		});

		this.job_specific_resumes.hook(
			"updating",
			function (modifications, primary_key, obj) {
				if (typeof modifications === "object") {
					(modifications as JobSpecificResume).last_modified_at =
						new Date();
				}
			}
		);
	}
}

export const db = new AppDatabase();
