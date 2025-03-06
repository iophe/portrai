import { useFault } from "@components/fault";
import { createResource, createSignal, Show } from "solid-js";
import { generatePDF } from "./generator.utils";
import { TemplateData } from "./templates/template.utils";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { ExecutiveTemplate } from "./templates/default.template";
import DownloadIcon from "@assets/icons/download.svg?component-solid";
import { getProfile } from "@utils/profile";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import { FormCheckbox } from "../utils/form.input";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import { db } from "@utils/db/db";
import { useNavigate } from "@solidjs/router";

interface ResumePreviewProps {
	template_name?: string;
}

function ResumeAIPreview(props: ResumePreviewProps) {
	const navigate = useNavigate();
	const fault = useFault();

	let cv_ref: HTMLDivElement | undefined = undefined;
	const [is_generating, toGenerating] = createSignal(false);

	// Fetch resume data
	const [resume_data, set_resume_data] = createSignal<TemplateData>();
	const [resume_title, set_resume_title] = createSignal<string>();
	const [job_description, set_job_description] = createSignal<string>("");
	const [with_cover_letter, set_with_cover_letter] =
		createSignal<boolean>(false);

	return (
		<section class="w-full h-full flex flex-col gap-4">
			<textarea
				value={job_description()}
				oninput={(e) => {
					set_job_description(e.target.value);
				}}
				class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md transition-all"
				rows={4}
				placeholder="paste the job description"
			/>
			<div class="flex flex-col gap-2 self-center">
				<FormCheckbox
					label="with cover letter"
					on_input={(value) => {
						set_with_cover_letter(value);
					}}
					value={with_cover_letter()}
				/>
				<button
					class="bg-night-200 px-4 py-2 rounded text-snow-100 font-bold"
					onClick={async () => {
						if (!job_description()) return;
						try {
							toGenerating(true);

							const res = await api.post("/ai/session/resume", {
								job_description: job_description(),
								with_cover_letter: with_cover_letter(),
							});

							const uuid = crypto.randomUUID();
							set_resume_data({
								resume_data: res.data.result as ResumeData,
								contact: {
									name: "Test",
									email: "test@test.com",
								},
							});
							set_resume_title(uuid);
							const resume_data = res.data.result as ResumeData;
							// resume_data.certificates.forEach(
							// 	(v, i) => (v.certificate_id = i)
							// );
							// resume_data.experiences.forEach(
							// 	(v, i) => (v.experience_id = i)
							// );
							// resume_data.educations.forEach(
							// 	(v, i) => (v.education_id = i)
							// );
							// resume_data.projects.forEach(
							// 	(v, i) => (v.project_id = i)
							// );
							// resume_data.skills.forEach(
							// 	(v, i) => (v.skill_id = i)
							// );

							DB_JOB_SPECIFIC_RESUMES.upsert(db, uuid, {
								resume_data: resume_data,
								job_description: job_description(),
								title: resume_data.title,
							});
						} catch (error) {
							fault.major({
								message: "Failed to generate the resume",
							});
						} finally {
							toGenerating(false);
						}
					}}
					disabled={is_generating()}
				>
					Generate resume
				</button>

				<button
					class=""
					onClick={async () => {
						try {
							toGenerating(true);
							            // Récupérer les données de profil
										const profile = await getProfile();
							const res = await api.get("/resume/data");

							set_resume_data({
								resume_data: res.data.resume_data as ResumeData,
								contact: {
									name: profile.name,
									email: profile.email,
									phone: profile.phone || undefined,
									location: profile.location || undefined,
									linkedin: profile.linkedin || undefined,
									website: profile.website || undefined,
								},
							});
						} catch (error) {
							console.log(error);

							fault.major({
								message: "Failed to generate the resume",
							});
						} finally {
							toGenerating(false);
						}
					}}
					disabled={is_generating()}
				>
					or build resume from profile
				</button>
			</div>
			<section class="w-full grow overflow-auto flex flex-col gap-4">
				<Show when={resume_data()}>
					<button
						title="Edit"
						onclick={() => {
							navigate(`/resume/${resume_title()}`);
						}}
					>
						<EditIcon class="fill-night-900" />
					</button>
					<div
						ref={cv_ref}
						class="max-w-[210mm] min-h-[297mm] h-[297mm]"
					>
						<ExecutiveTemplate
							data={resume_data()!}
							settings={{
								font_size: {
									name: "2rem",
									section_title: "1.25rem",
									subsection_title: "1.1rem",
									body: "0.9rem",
								},
								spacing: {
									section: "1.5rem",
									subsection: "1rem",
									item: "0.75rem",
								},
								show_sections: {
									summary: true,
									experience: true,
									education: true,
									skills: true,
									certificates: true,
									projects: true,
								},
							}}
						/>
					</div>

					<Show when={resume_data()?.resume_data.letter}>
						<div>{resume_data()?.resume_data.letter}</div>
					</Show>
				</Show>
			</section>

			<div class="flex flex-row self-end gap-4">
				<button
					class="bg-lapis-100 rounded text-snow-100 py-2 px-4"
					onClick={async () => {
						if (!cv_ref) return;
						try {
							toGenerating(true);
							generatePDF(cv_ref, {
								name: "my_cv.pdf",
							});
							fault.info({
								message: "successfully generated the PDF",
							});
						} catch (error) {
							fault.major({
								message: "Failed to generate the PDF",
							});
						} finally {
							toGenerating(false);
						}
					}}
					disabled={is_generating() && resume_data() !== undefined}
				>
					<Show
						when={!is_generating()}
						fallback={"Generating PDF..."}
					>
						Download PDF
					</Show>
				</button>
			</div>
		</section>
	);
}

export default ResumeAIPreview;
