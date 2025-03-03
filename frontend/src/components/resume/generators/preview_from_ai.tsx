import { useFault } from "@components/fault";
import { createResource, createSignal, Show } from "solid-js";
import { generatePDF } from "./generator.utils";
import { TemplateData } from "./templates/template.utils";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { ExecutiveTemplate } from "./templates/default.template";
import DownloadIcon from "@assets/icons/download.svg?component-solid";
import { FormCheckbox } from "../utils/form.input";

interface ResumePreviewProps {
	template_name?: string;
}

function ResumeAIPreview(props: ResumePreviewProps) {
	const fault = useFault();

	let cv_ref: HTMLDivElement | undefined = undefined;
	const [is_generating, toGenerating] = createSignal(false);

	// Fetch resume data
	const [resume_data, set_resume_data] = createSignal<TemplateData>();
	const [job_description, set_job_description] = createSignal<string>("");
	const [with_cover_letter, set_with_cover_letter] = createSignal<boolean>(false);

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
						set_with_cover_letter(value)
					}}
					value={with_cover_letter()}
				/>
				<button
					class="bg-night-200 px-4 py-2 rounded text-snow-100 font-bold"
					onClick={async () => {
						if (!job_description()) return;
						try {
							toGenerating(true);
							console.log(with_cover_letter());
							const res = await api.post("/ai/session/resume", {
								job_description: job_description(),
								with_cover_letter: with_cover_letter(),
							});
							console.log(res.data.result);
							
							set_resume_data({
								resume_data: res.data.result as ResumeData,
								contact: {
									name: "Test",
									email: "test@test.com",
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
					Generate resume
				</button>


				<button
					class=""
					onClick={async () => {
						try {
							toGenerating(true);
							const res = await api.get("/resume/data");

							set_resume_data({
								resume_data: res.data.resume_data as ResumeData,
								contact: {
									name: "Test",
									email: "test@test.com",
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
						<div>
							{resume_data()?.resume_data.letter}
						</div>
					</Show>
					<div></div>
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
