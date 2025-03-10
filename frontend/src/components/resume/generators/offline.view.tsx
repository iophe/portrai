import { useFault } from "@components/fault";
import { createResource, createSignal, For, Show } from "solid-js";
import { generatePDF } from "./generator.utils";
import { TemplateData } from "./templates/template.utils";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { ExecutiveTemplate } from "./templates/default.template";
import { db, JobSpecificResume } from "@utils/db/db";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import { FormInputText } from "../utils/form.input";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import { createCachedResource } from "@utils/cache";

function formatText(text: string) {
	if (!text) return null;

	const paragraphs = text.trim().split("\n");
	const processed = [];
	let was_empty = false;
	for (let i = 0; i < paragraphs.length; i++) {
		if (paragraphs[i].trim() === "") {
			if (!was_empty) {
				processed.push("");
				was_empty = true;
			}
		} else {
			processed.push(paragraphs[i]);
			was_empty = false;
		}
	}
	return (
		<For each={processed}>
			{(paragraph) => {
				if (paragraph.trim() === "") {
					return <br />;
				}
				return <p>{paragraph}</p>;
			}}
		</For>
	);
}

interface ResumePreviewProps {
	template_name?: string;
	job_specific_resume: JobSpecificResume;
}

function ResumePreview(props: ResumePreviewProps) {
	const fault = useFault();

	let cv_ref: HTMLDivElement | undefined = undefined;
	const [is_generating, toGenerating] = createSignal(false);
	const [showing_more, show_more] = createSignal(false);
	const [editing_title, edit_title] = createSignal(false);
	const [new_title, set_new_title] = createSignal(
		props.job_specific_resume.title
	);

	const [account, { refetch }] = createCachedResource(async () => {
		try {
			const res = await api.get("/account/user");
			const user = res.data.user as User;
			return user;
		} catch (error) {}
	},
	{ cache_key:"/account/user" });
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
				<Show
					when={editing_title()}
					fallback={
						<div class="flex flex-row items-center justify-between">
							<h1 class="grow text-center alice-regular self-center ">
								{props.job_specific_resume.title}
							</h1>
							<div class="flex flex-row gap-4">
								<button
									title="Edit"
									onclick={() => {
										edit_title(true);
									}}
								>
									<EditIcon class="fill-forest-900" />
								</button>
								<button
									title="delete"
									onclick={async () => {
										const ok = confirm(
											"Are you sure you want to delete this ?"
										);
										if (ok) {
											await DB_JOB_SPECIFIC_RESUMES.delete(
												db,
												props.job_specific_resume.id
											);
											window.location.reload();
										}
									}}
								>
									<DeleteIcon class="fill-forest-900" />
								</button>
							</div>
						</div>
					}
				>
					<div class="flex flex-row items-center justify-between gap-4">
						<form
							class="w-full"
							onSubmit={async (e) => {
								await DB_JOB_SPECIFIC_RESUMES.upsert(
									db,
									props.job_specific_resume.id,
									{ title: new_title() }
								);
							}}
						>
							<FormInputText
								value={new_title()}
								on_input={(value) => set_new_title(value)}
								placeholder="Rename this resume"
							/>
						</form>
						<button
							title="close"
							onclick={() => {
								edit_title(false);
							}}
						>
							<CloseIcon class="fill-forest-900" />
						</button>
					</div>
				</Show>
				<div class="flex flex-col items-start gap-4">
					<article class="p-4 border-l-4 border-l-lapis-50  bg-gradient-to-br from-lapis-10 to-white flex flex-col gap-2">
						<h2>Job description :</h2>
						<div
							class="line-clamp-6 "
							classList={{
								"line-clamp-6": !showing_more(),
								"h-75 overflow-y-scroll": showing_more(),
							}}
						>
							{formatText(
								props.job_specific_resume.job_description
							)}
						</div>
						<div class="self-end">
							<Show
								when={showing_more()}
								fallback={
									<button
										title="show more"
										onclick={() => show_more(true)}
									>
										show more ...
									</button>
								}
							>
								<button
									title="show less"
									onclick={() => show_more(false)}
								>
									show less ...
								</button>
							</Show>
						</div>
					</article>
				</div>
			</section>

			<section class="rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4">
				<h3 class="alice-regular self-center text-sm">{`${account()?.full_name?.replace(" ", "_")}_resume_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}.pdf`}</h3>
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
						disabled={is_generating()}
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
					class="max-w-[210mm] min-h-[297mm]  md:block hidden"
				>
					<ExecutiveTemplate
						data={{
							resume_data: props.job_specific_resume.resume_data,
							profile: profile(),
							user: account(),
						}}
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
			<Show when={props.job_specific_resume.resume_data.letter}>
				<section class="rounded w-full p-4 bg-lapis-10 h-full flex flex-col gap-4">
					<h2>Cover letter :</h2>
					<div>{props.job_specific_resume.resume_data.letter}</div>
				</section>
			</Show>
		</section>
	);
}

export default ResumePreview;
