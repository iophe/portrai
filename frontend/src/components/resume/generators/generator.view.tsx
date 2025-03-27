import { useFault } from "@components/fault";
import { createResource, createSignal, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
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
import {
	CACHED_IMAGE_KEY,
	CACHED_IMAGE_TTL,
	CachedImage,
} from "@components/avatar.section";
import { formatText } from "./offline.view";

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
		{ cache_key: "/account/user" }
	);
	const [profile, { mutate: mutate_profile, refetch: refetch_profile }] =
		createCachedResource(
			async () => {
				try {
					const response = await api.get("/account/profile");
					const result = response.data.profile as Profile;
					return result;
				} catch (error) {
					if ((error as AxiosError).status === 402) {
						navigate("/pricing");
					}
					return;
				}
			},
			{ cache_key: "/account/profile" }
		);

	const [avatar] = createResource(async () => {
		const cached = window.localStorage.getItem(CACHED_IMAGE_KEY);
		if (cached) {
			const cached_data = JSON.parse(cached) as CachedImage;
			const cache_date = new Date(cached_data.date);
			const now = new Date();
			const elapsed_time = now.getTime() - cache_date.getTime();

			if (elapsed_time < cached_data.ttl) {
				// if the data is valid
				return cached_data.img;
			} else {
				window.localStorage.removeItem(CACHED_IMAGE_KEY);
			}
		}
		try {
			const res = await api.get("/account/profile/avatar", {
				responseType: "blob",
			});
			const url = URL.createObjectURL(res.data);
			const base64_url = (await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.readAsDataURL(res.data);
			})) as string;
			window.localStorage.setItem(
				CACHED_IMAGE_KEY,
				JSON.stringify({
					img: base64_url,
					date: new Date(),
					ttl: CACHED_IMAGE_TTL,
				} as CachedImage)
			);
			return base64_url;
		} catch (error) {}
	});
	return (
		<section class="overflow-y-auto overflow-x-clip w-full h-full flex flex-col gap-4 pb-4">
			<Presence>
				<Motion.section
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, easing: "ease-out" }}
					class="shadow rounded w-full p-4 bg-lapis-10 min-h-fit h-fit flex flex-col gap-4"
				>
					<Motion
						initial={{ y: "-100%" }}
						animate={{ y: "0%" }}
						transition={{
							duration: 0.4,
							easing: "ease-out",
							delay: 0.2,
						}}
						style={{
							position: "absolute",
							left: "50%",
							top: "0",
							width: "60%",
							height: "3px",
							"background-color": "var(--lapis-200)",
							transform: "translateX(-50%)",
						}}
					></Motion>
					<h2 class="text-center">
						Paste the job description here to generate tailor made
						resume
					</h2>
					<Motion
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<textarea
							value={job_description()}
							oninput={(e) => {
								set_job_description(e.target.value);
							}}
							class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md smooth-transition"
							rows={4}
							placeholder="paste the job description"
						/>
					</Motion>
					<Motion
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<div class="flex flex-col gap-2 self-center items-center">
							<Motion
								hover={{ scale: 1.05 }}
								press={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
							>
								<FormCheckbox
									label="with cover letter"
									on_input={(value) => {
										set_with_cover_letter(value);
									}}
									value={with_cover_letter()}
								/>
							</Motion>
							<Motion
								hover={{ scale: 1.03 }}
								press={{ scale: 0.97 }}
								transition={{ duration: 0.1 }}
							>
								<button
									class="bg-forest-200 px-4 py-2 rounded text-snow-100 font-bold flex flex-row gap-2 w-fit"
									onClick={async () => {
										if (!job_description()) return;
										try {
											toGenerating(true);

											const res = await api.post(
												"/ai/session/resume",
												{
													job_description:
														job_description(),
													with_cover_letter:
														with_cover_letter(),
												}
											);

											refetch_profile();

											const uuid = crypto.randomUUID();
											set_resume_data({
												resume_data: res.data
													.result as ResumeData,
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

											DB_JOB_SPECIFIC_RESUMES.upsert(
												db,
												uuid,
												{
													resume_data: resume_data,
													job_description:
														job_description(),
													title: resume_data.title,
												}
											);
										} catch (error) {
											if (
												(error as AxiosError).status ===
												402
											) {
												navigate("/pricing");
											}
											if (
												(error as AxiosError).status !==
													401 &&
												(error as AxiosError).status !==
													402
											)
												fault.major({
													message:
														"Failed to generate the resume",
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
							</Motion>

							<Motion
								hover={{ scale: 1.05 }}
								press={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
							>
								<button
									class=""
									onClick={async () => {
										try {
											toGenerating(true);
											const res =
												await api.get("/resume/data");
											const data = res.data
												.resume_data as ResumeData;

											refetch_profile();

											data.title = `${account()?.full_name?.replace(" ", "_")}_resume_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}`;
											set_resume_data({
												resume_data: data,
												profile: profile(),
												user: account(),
											});
										} catch (error) {
											if (
												(error as AxiosError).status ===
												402
											) {
												navigate("/pricing");
											}
											if (
												(error as AxiosError).status !==
													401 &&
												(error as AxiosError).status !==
													402
											)
												fault.major({
													message:
														"Failed to generate the resume",
												});
										} finally {
											toGenerating(false);
										}
									}}
									disabled={is_generating()}
								>
									or build resume from profile
								</button>
							</Motion>
						</div>
					</Motion>
				</Motion.section>
			</Presence>

			<Presence>
				<Show when={resume_data()}>
					<Motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4, easing: "ease-out" }}
						class="shadow rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4"
					>
						<div class="self-center flex flex-row gap-4">
							<h3>{`${account()?.full_name?.replace(" ", "_")}_resume_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}`}</h3>
							<Motion
								hover={{ scale: 1.1 }}
								press={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
							>
								<button
									title="Edit"
									onclick={() => {
										navigate(`/resume/${resume_id()}`);
									}}
								>
									<EditIcon class="fill-forest-900" />
								</button>
							</Motion>
						</div>
						<div class="flex flex-row self-center gap-4">
							<Motion
								hover={{ scale: 1.05 }}
								press={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
							>
								<button
									class="bg-lapis-100 rounded text-snow-100 py-2 px-4 flex items-center gap-2"
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
												message:
													"Failed to generate the PDF",
											});
										} finally {
											toGenerating(false);
										}
									}}
									disabled={
										is_generating() &&
										resume_data() !== undefined
									}
								>
									<Show
										when={!is_generating()}
										fallback={"Generating PDF..."}
									>
										<Motion
											animate={
												is_generating()
													? { rotate: 360 }
													: {}
											}
											transition={{
												duration: 1,
												repeat: Infinity,
											}}
											style={{
												display: "inline-block",
											}}
										>
											<DownloadIcon class="fill-white w-5 h-5" />
										</Motion>
										<span>Download PDF</span>
									</Show>
								</button>
							</Motion>
						</div>
						<Motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.4, delay: 0.2 }}
							ref={cv_ref}
							class="max-w-[210mm] h-fit md:block hidden"
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
						</Motion.div>
					</Motion.section>
				</Show>
			</Presence>

			<Presence>
				<Show when={resume_data()?.resume_data.letter}>
					<Motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{
							duration: 0.4,
							easing: "ease-out",
							delay: 0.2,
						}}
						class="shadow rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4"
					>
						<h2>Cover letter :</h2>
						<Motion
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div class="bg-white border-lapis-100 shadow px-4 py-8">
								{formatText(resume_data()?.resume_data.letter!)}
							</div>
						</Motion>
					</Motion.section>
				</Show>
			</Presence>
		</section>
	);
}

export default ResumeAIPreview;
