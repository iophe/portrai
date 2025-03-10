import { useFault } from "@components/fault";
import { createResource, createSignal, Show } from "solid-js";
import { generatePDF } from "./generator.utils";
import { TemplateData } from "./templates/template.utils";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { ExecutiveTemplate } from "./templates/default.template";
import DownloadIcon from "@assets/icons/download.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import { FormCheckbox } from "../utils/form.input";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import { db } from "@utils/db/db";
import { useNavigate } from "@solidjs/router";
import LoadingSpinner from "@components/loading.spinner";
import { createCachedResource } from "@utils/cache";

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
	const [resume_id, set_resume_id] = createSignal<string>();
	const [job_description, set_job_description] = createSignal<string>("");
	const [with_cover_letter, set_with_cover_letter] =
		createSignal<boolean>(false);

	const [account, { refetch }] = createCachedResource(
		async () => {
			try {
				const res = await api.get("/account/user");
				const user = res.data.user as User;
				return user;
			} catch (error) {}
		},
		{ cache_key:"/account/user" }
	);
	const [profile, { mutate: mutate_profile, refetch: refetch_profile }] =
	createCachedResource(async () => {
			try {
				const response = await api.get("/account/profile");
				const result = response.data.profile as Profile;
				return result;
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
				return;
			}
		},
		{ cache_key:"/account/profile" });
	return (
		<section class="overflow-y-auto w-full h-full flex flex-col gap-4">
			<section class="rounded w-full p-4 bg-lapis-10 h-full flex flex-col gap-4">
				<h2>
					Paste the job description here to generate tailor made
					resume
				</h2>
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
						class="bg-forest-200 px-4 py-2 rounded text-snow-100 font-bold"
						onClick={async () => {
							if (!job_description()) return;
							try {
								toGenerating(true);

								const res = await api.post(
									"/ai/session/resume",
									{
										job_description: job_description(),
										with_cover_letter: with_cover_letter(),
									}
								);

								const uuid = crypto.randomUUID();
								set_resume_data({
									resume_data: res.data.result as ResumeData,
									profile: profile(),
									user: account(),
								});
								set_resume_id(uuid);
								const resume_data = res.data
									.result as ResumeData;
								resume_data.certificates.forEach(
									(v, i) => (v.certificate_id = i)
								);
								resume_data.experiences.forEach(
									(v, i) => (v.experience_id = i)
								);
								resume_data.educations.forEach(
									(v, i) => (v.education_id = i)
								);
								resume_data.projects.forEach(
									(v, i) => (v.project_id = i)
								);
								resume_data.skills.forEach(
									(v, i) => (v.skill_id = i)
								);

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
						<Show when={is_generating()}>
							<LoadingSpinner />
						</Show>
					</button>

					<button
						class=""
						onClick={async () => {
							try {
								toGenerating(true);
								const res = await api.get("/resume/data");
								const data = res.data.resume_data as ResumeData;
								data.title = `${account()?.full_name?.replace(" ", "_")}_resume_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}`;
								set_resume_data({
									resume_data: data,
									profile: profile(),
									user: account(),
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
			</section>

			<Show when={resume_data()}>
				<section class="rounded w-full  p-4 bg-lapis-10 h-fit flex flex-col gap-4">
					<div class="self-center flex flex-row gap-4">
						<h3>{`${account()?.full_name?.replace(" ", "_")}_resume_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}`}</h3>
						<button
							title="Edit"
							onclick={() => {
								navigate(`/resume/${resume_id()}`);
							}}
						>
							<EditIcon class="fill-forest-900" />
						</button>
					</div>
					<div class="flex flex-row self-center gap-4">
						<button
							class="bg-lapis-100 rounded text-snow-100 py-2 px-4"
							onClick={async () => {
								if (!cv_ref) return;
								try {
									toGenerating(true);
									generatePDF(cv_ref, {
										name: `${account()?.full_name?.replace(" ", "_")}_resume_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}.pdf`,
									});
									fault.info({
										message:
											"successfully generated the PDF",
									});
								} catch (error) {
									fault.major({
										message: "Failed to generate the PDF",
									});
								} finally {
									toGenerating(false);
								}
							}}
							disabled={
								is_generating() && resume_data() !== undefined
							}
						>
							<Show
								when={!is_generating()}
								fallback={"Generating PDF..."}
							>
								Download PDF
							</Show>
						</button>
					</div>
					<div
						ref={cv_ref}
						class="max-w-[210mm] min-h-[297mm] md:block hidden"
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
				</section>
			</Show>

			<Show when={resume_data()?.resume_data.letter}>
				<section class="rounded w-full  p-4 bg-lapis-10 h-fit flex flex-col gap-4">
					<div>{resume_data()?.resume_data.letter}</div>
				</section>
			</Show>
		</section>
	);
}

export default ResumeAIPreview;
