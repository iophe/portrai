import { AppDatabase } from "./db";
import { JobSpecificResume } from "@utils/db/db";

export class JobSpecificResumeNotFoundError extends Error {
	constructor(name: string) {
		super(`resume with title ${name} not found`);
		this.name = "JobSpecificResumeNotFoundError";
	}
}

export const DB_JOB_SPECIFIC_RESUMES = {
	async all(db: AppDatabase): Promise<Array<JobSpecificResume>> {
		return await db.job_specific_resumes
			.orderBy("created_at")
			.reverse() // most recent first
			.toArray();
	},
	async upsert(
		db: AppDatabase,
		title: string,
		updates: {
			title?: string;
			job_description?: string;
			resume_data?: ResumeData;
		}
	): Promise<JobSpecificResume> {
		const existing = await db.job_specific_resumes
			.where("title")
			.equals(title)
			.first();

		if (existing) {
			await db.job_specific_resumes
				.where("title")
				.equals(title)
				.modify({
					...updates,
					last_modified_at: new Date(),
				});

			const updated = await db.job_specific_resumes
				.where("title")
				.equals(updates.title || title)
				.first();

			if (!updated)
				throw new JobSpecificResumeNotFoundError(
					updates.title || title
				);
			return updated;
		} else {
			// Create new module
			const id = await db.job_specific_resumes.add({
				title: updates.title || title,
				job_description: updates.job_description || "",
				resume_data: updates.resume_data!,
				created_at: new Date(),
				last_modified_at: new Date(),
			});

			const created = await db.job_specific_resumes.get(id);
			if (!created) throw new JobSpecificResumeNotFoundError(title);
			return created;
		}
	},

	async delete(db: AppDatabase, id: string): Promise<void> {
		const count = await db.job_specific_resumes
			.where("id")
			.equals(id)
			.delete();
		if (count === 0) return;
	},

	async clear(db: AppDatabase): Promise<void> {
		await db.job_specific_resumes.clear();
	},

	async get(
		db: AppDatabase,
		title: string
	): Promise<JobSpecificResume | undefined> {
		return db.job_specific_resumes.where("title").equals(title).first();
	},
};
