import Dexie, { Table } from "dexie";

export interface JobSpecificResume {
	id: string;
	title: string;
	filename: string;
	job_description: string;
	resume_data: ResumeData;
	letter: string;
	template: string;
	created_at: Date;
	last_modified_at: Date;
}

export interface ResumePdf {
	id: string; // Foreign key to job_specific_resumes
	pdf_blob: Blob;
	filename: string;
	created_at: Date;
	last_modified_at: Date;
}

export class AppDatabase extends Dexie {
	job_specific_resumes!: Table<JobSpecificResume, string>;
	resume_pdfs!: Table<ResumePdf, string>;

	constructor() {
		super("AppDatabase");
		this.version(1).stores({
			job_specific_resumes: "id, title, created_at",
			resume_pdfs: "id, filename, created_at",
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

		// Add hooks for resume_pdfs table
		this.resume_pdfs.hook("creating", function (primary_key, obj) {
			obj.created_at = new Date();
			obj.last_modified_at = new Date();
		});

		this.resume_pdfs.hook(
			"updating",
			function (modifications, primary_key, obj) {
				if (typeof modifications === "object") {
					(modifications as ResumePdf).last_modified_at = new Date();
				}
			}
		);
	}
}

export const db = new AppDatabase();
