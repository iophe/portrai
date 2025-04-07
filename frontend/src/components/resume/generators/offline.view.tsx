import { useFault } from "@components/fault";
import { Accessor, createEffect, createResource, createSignal, For, onMount, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { db, JobSpecificResume } from "@utils/db/db";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import DownloadIcon from "@assets/icons/download.svg?component-solid";
import { FormInputText } from "../utils/form.input";
import { DB_JOB_SPECIFIC_RESUMES, DB_RESUME_PDFS } from "@utils/db/resume.db";
import { createCachedResource } from "@utils/cache";
import {
	CACHED_IMAGE_KEY,
	CACHED_IMAGE_TTL,
	CachedImage,
} from "@components/avatar.section";
import { useNavigate } from "@solidjs/router";
import { PDFView } from "./pdf.view";

export function formatText(text: string) {
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
	job_specific_resume: JobSpecificResume;
	refresh_signal ?: Accessor<number>
}

function ResumePreview(props: ResumePreviewProps) {
	const fault = useFault();
	const navigate = useNavigate();

	const [showing_more, show_more] = createSignal(false);
	const [editing_title, edit_title] = createSignal(false);
	const [new_title, set_new_title] = createSignal(
		props.job_specific_resume.title
	);
	const [pdf_blob, set_pdf_blob] = createSignal<Blob | undefined>();
	onMount(async () => {
		try {			
			const cached_pdf = await DB_RESUME_PDFS.get(db, props.job_specific_resume.id);

  			if (cached_pdf) {
				set_pdf_blob(cached_pdf.pdf_blob);
				return;
			}
			// Generate the PDF
			const response = await api.post(
				"/generate/live/from-data/" + props.job_specific_resume.template,
				{
					resume_data: props.job_specific_resume.resume_data,
				},
				{ responseType: "blob" }
			);
			
			await DB_RESUME_PDFS.upsert(db, props.job_specific_resume.id, {
				pdf_blob: response.data,
				filename: props.job_specific_resume.filename,
			});
			set_pdf_blob(response.data);
		} catch (error) {
			
		}
	})

	const [old_refresh_signal, update_old_refresh_signal] = createSignal(0);
	
	createEffect(async () => {
		if (!props.refresh_signal) return;
		if (props.refresh_signal() !== old_refresh_signal()) {
			update_old_refresh_signal(props.refresh_signal())
			const response = await api.post(
				"/generate/live/from-data/" + props.job_specific_resume.template,
				{
					resume_data: props.job_specific_resume.resume_data,
				},
				{ responseType: "blob" }
			);
			await DB_RESUME_PDFS.upsert(db, props.job_specific_resume.id, {
				pdf_blob: response.data,
				filename: props.job_specific_resume.filename,
			});
			set_pdf_blob(response.data);
		}
	})

	return (
		<section class="overflow-y-auto w-full h-full flex flex-col gap-4">
			<Motion
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, easing: "ease-out" }}
			>
				<section class="shadow rounded w-full p-4 bg-lapis-10 h-full flex flex-col gap-4">
					<Motion
						initial={{ width: "0%" }}
						animate={{ width: "100%" }}
						transition={{
							duration: 0.6,
							easing: "ease-out",
							delay: 0.2,
						}}
						style={{
							position: "absolute",
							left: "0",
							top: "0",
							height: "3px",
							"background-color": "var(--lapis-100)",
						}}
					></Motion>
					<Presence>
						<Show
							when={!editing_title()}
							fallback={
								<Motion
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									transition={{ duration: 0.2 }}
								>
									<div class="flex flex-row items-center justify-between gap-4">
										<form
											class="w-full"
											onSubmit={async (e) => {
												e.preventDefault();
												await DB_JOB_SPECIFIC_RESUMES.upsert(
													db,
													props.job_specific_resume
														.id,
													{ title: new_title() }
												);
												edit_title(false);
											}}
										>
											<FormInputText
												value={new_title()}
												on_input={(value) =>
													set_new_title(value)
												}
												placeholder="Rename this resume"
											/>
										</form>
										<Motion
											hover={{ scale: 1.1 }}
											press={{ scale: 0.95 }}
											transition={{ duration: 0.15 }}
										>
											<button
												title="close"
												onclick={() => {
													edit_title(false);
												}}
											>
												<CloseIcon class="min-w-fit fill-forest-900" />
											</button>
										</Motion>
									</div>
								</Motion>
							}
						>
							<div class="flex flex-row items-center justify-between">
								<Motion
									initial={{ opacity: 0, x: -5 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									<h1 class="grow text-center alice-regular self-center">
										{props.job_specific_resume.title}
									</h1>
								</Motion>
								<div class="flex flex-row gap-4">
									<Motion
										hover={{ scale: 1.1 }}
										press={{ scale: 0.95 }}
										transition={{ duration: 0.15 }}
									>
										<button
											title="Edit"
											onclick={() => {
												edit_title(true);
											}}
										>
											<EditIcon class="min-w-fit fill-forest-900" />
										</button>
									</Motion>
									<Motion
										hover={{ scale: 1.1, rotate: 5 }}
										press={{ scale: 0.95 }}
										transition={{ duration: 0.15 }}
									>
										<button
											title="delete"
											onclick={async () => {
												const ok = confirm(
													"Are you sure you want to delete this?"
												);
												if (ok) {
													await DB_JOB_SPECIFIC_RESUMES.delete(
														db,
														props
															.job_specific_resume
															.id
													);
													window.location.reload();
												}
											}}
										>
											<DeleteIcon class="min-w-fit fill-forest-900" />
										</button>
									</Motion>
								</div>
							</div>
						</Show>
					</Presence>
					<Motion
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<div class="flex flex-col items-start gap-4">
							<article class="p-4 border-l-4 border-l-lapis-50 bg-gradient-to-br from-lapis-10 to-white flex flex-col gap-2 w-full">
								<h2 class="text-lapis-700 font-medium">
									Job description:
								</h2>
								<div
									class="line-clamp-6 transition-all duration-300"
									classList={{
										"line-clamp-6": !showing_more(),
										"max-h-[300px] overflow-y-auto":
											showing_more(),
									}}
								>
									{formatText(
										props.job_specific_resume
											.job_description
									)}
								</div>
								<div class="self-end">
									<Presence>
										<Show
											when={showing_more()}
											fallback={
												<Motion
													hover={{ scale: 1.05 }}
													press={{ scale: 0.95 }}
													transition={{
														duration: 0.15,
													}}
												>
													<button
														title="show more"
														onclick={() =>
															show_more(true)
														}
														class="text-lapis-600 hover:text-lapis-800 font-medium text-sm smooth-transition"
													>
														show more ...
													</button>
												</Motion>
											}
										>
											<Motion
												hover={{ scale: 1.05 }}
												press={{ scale: 0.95 }}
												transition={{ duration: 0.15 }}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
											>
												<button
													title="show less"
													onclick={() =>
														show_more(false)
													}
													class="text-lapis-600 hover:text-lapis-800 font-medium text-sm smooth-transition"
												>
													show less ...
												</button>
											</Motion>
										</Show>
									</Presence>
								</div>
							</article>
						</div>
					</Motion>
				</section>
			</Motion>
			

			<Show when={pdf_blob()}>
				<PDFView
					document_id={props.job_specific_resume.id}
					document_name=""
					pdf_data={pdf_blob()!}
					document_title={props.job_specific_resume.title}
					/>
			</Show>

			<Presence>
				<Show when={props.job_specific_resume.letter}>
					<Motion.section
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{
							duration: 0.3,
							delay: 0.4,
							easing: "ease-out",
						}}
						class="shadow rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4"
					>
						<Motion
							initial={{ width: "0%" }}
							animate={{ width: "100%" }}
							transition={{
								duration: 0.6,
								easing: "ease-out",
								delay: 0.5,
							}}
							style={{
								position: "absolute",
								left: "0",
								top: "0",
								height: "3px",
								"background-color": "var(--lapis-50)",
							}}
						></Motion>
						<h2 class="text-lapis-700 font-medium">
							Cover letter:
						</h2>
						<Motion
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<div class="bg-white border-lapis-100 shadow px-4 py-8">
								{formatText(
									props.job_specific_resume.letter
								)}
							</div>
						</Motion>
					</Motion.section>
				</Show>
			</Presence>
		</section>
	);
}

export default ResumePreview;
