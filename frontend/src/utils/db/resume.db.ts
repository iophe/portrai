import { AppDatabase, ResumePdf } from "./db";
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
	async all_titles(
		db: AppDatabase
	): Promise<Array<{ title: string; id: string; created_at: Date }>> {
		return await db.job_specific_resumes
			.orderBy("created_at")
			.reverse()
			.toArray((resumes) =>
				resumes.map((resume) => ({
					title: resume.title,
					id: resume.id,
					created_at: resume.created_at,
				}))
			);
	},
	async upsert(
		db: AppDatabase,
		id: string,
		updates: {
			title?: string;
			job_description?: string;
			template?: string;
			filename?: string;
			letter?: string;
			resume_data?: ResumeData;
		}
	): Promise<JobSpecificResume> {
		const existing = await db.job_specific_resumes
			.where("id")
			.equals(id)
			.first();

		if (existing) {
			await db.job_specific_resumes
				.where("id")
				.equals(id)
				.modify({
					...updates,
					last_modified_at: new Date(),
				});

			const updated = await db.job_specific_resumes
				.where("id")
				.equals(id)
				.first();

			if (!updated) throw new JobSpecificResumeNotFoundError(id);
			return updated;
		} else {
			// Create new module
			await db.job_specific_resumes.add(
				{
					title: updates.title || "generated",
					letter: updates.letter || "",
					job_description: updates.job_description || "",
					filename: updates.filename || "resume.pdf",
					template: updates.template || "standard-executive",
					resume_data: updates.resume_data!,
					created_at: new Date(),
					last_modified_at: new Date(),
					id: id,
				},
				id
			);

			const created = await db.job_specific_resumes.get(id);
			if (!created) throw new JobSpecificResumeNotFoundError(id);
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
		id: string
	): Promise<JobSpecificResume | undefined> {
		return db.job_specific_resumes.where("id").equals(id).first();
	},
};

export class ResumePdfNotFoundError extends Error {
	constructor(id: number) {
		super(`Resume PDF with id ${id} not found`);
		this.name = "ResumePdfNotFoundError";
	}
}

export const DB_RESUME_PDFS = {
	async get(
		db: AppDatabase,
		resumeId: string
	): Promise<ResumePdf | undefined> {
		return await db.resume_pdfs.where("id").equals(resumeId).first();
	},

	async upsert(
		db: AppDatabase,
		id: string,
		updates: {
			pdf_blob: Blob;
			filename: string;
		}
	): Promise<void> {
		const existing = await db.resume_pdfs.where("id").equals(id).first();

		if (existing) {
			await db.resume_pdfs
				.where("id")
				.equals(id)
				.modify({
					...updates,
					last_modified_at: new Date(),
				});
			return;
		} else {
			if (!(updates.pdf_blob instanceof Blob)) {
				throw new Error("Invalid PDF blob format");
			}

			// Create new PDF entry with auto-incremented ID
			await db.resume_pdfs.add({
				id: id,
				pdf_blob: updates.pdf_blob,
				filename: updates.filename,
				created_at: new Date(),
				last_modified_at: new Date(),
			});
		}

		return;
	},

	async delete(db: AppDatabase, id: number): Promise<void> {
		const count = await db.resume_pdfs.where("id").equals(id).delete();
		if (count === 0) return;
	},

	async deleteByResumeId(db: AppDatabase, resumeId: string): Promise<void> {
		await db.resume_pdfs.where("id").equals(resumeId).delete();
	},

	async clear(db: AppDatabase): Promise<void> {
		await db.resume_pdfs.clear();
	},
};
