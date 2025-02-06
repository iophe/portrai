import { useFault } from "@components/fault";
import { createResource, createSignal, Show } from "solid-js";
import { generatePDF } from "./generator.utils";
import { TemplateData } from "./templates/template.utils";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { ExecutiveTemplate } from "./templates/default.template";

interface ResumePreviewProps {
	template_name?: string;
}

function ResumeAIPreview(props: ResumePreviewProps) {
	const fault = useFault();

	let cv_ref: HTMLDivElement | undefined = undefined;
	const [is_generating, toGenerating] = createSignal(false);

	// Fetch resume data
	const [resume_data, set_resume_data] = createSignal<TemplateData>();
	const [job_description, set_job_description] = createSignal<string>();

	return (
		<section class="w-full">
			<textarea
				value={job_description()}
				oninput={(e) => {
					set_job_description(e.target.value);
				}}
				placeholder="paste the job description"
			></textarea>
			<button
				class=""
				onClick={async () => {
					try {
						toGenerating(true);
						const res = await api.post("/ai/session/resume", {
							job_description: job_description(),
						});
						set_resume_data({
							resume_data: res.data.result as ResumeData,
							contact: {
								name: "Test",
								email: "test@test.com",
							},
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
			<div class="flex flex-col items-start gap-4">
				<button
					class=""
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
			<div ref={cv_ref} class="max-w-[210mm] min-h-[297mm] h-[297mm]">
				<Show when={resume_data()}>
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
				</Show>
			</div>
		</section>
	);
}

export default ResumeAIPreview;
