import { createSignal, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useFault } from "@components/fault";
import BackIcon from "@assets/icons/back.svg?component-solid";
import api from "@utils/api";
import AIConversation from "./ai.view";
import { GenerateResumeFromProfile } from "./from_profile.view";
import { ResumeActions } from "./actions.view";
import { PDFView } from "./pdf.view";
import { CoverLetter } from "./letter.view";
import { ResumeLoader } from "./resume_loading.view";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import { db } from "@utils/db/db";

interface ResumeAIPreviewProps {}

function ResumeAIPreview(props: ResumeAIPreviewProps) {
	const navigate = useNavigate();
	const fault = useFault();

	const template =
		localStorage.getItem("template_name") || "standard-executive";

	const [pdf_blob, set_pdf_blob] = createSignal<Blob | undefined>();
	const [resume_title, set_resume_title] = createSignal<string | undefined>();
	const [resume_name, set_resume_name] = createSignal<string | undefined>(
		"Your Resume"
	);
	const [resume_id, set_resume_id] = createSignal<string | undefined>();
	const [is_loading, set_is_loading] = createSignal<boolean>(false);
	const [job_description, set_job_description] = createSignal<string>("");
	const [conversation_id, set_conversation_id] = createSignal<
		string | undefined
	>();

	// Load saved data from localStorage on component mount
	onMount(() => {
		const saved_job_description = localStorage.getItem("job_description");
		const saved_conversation_id = localStorage.getItem("conversation_id");

		if (saved_job_description) {
			set_job_description(saved_job_description);
		}

		if (saved_conversation_id) {
			set_conversation_id(saved_conversation_id);
			loadSavedResume(saved_conversation_id);
		}
	});
	onMount(() => {
		if (!localStorage.getItem("template_name")) {
			localStorage.setItem("template_name", "standard-executive");
		}
	});
	// Function to load a saved resume using the conversation ID
	const loadSavedResume = async (conv_id: string) => {
		try {
			set_is_loading(true);

			const response_title = await api.get(
				"/ai/conversation/metadata/" + conv_id
			);
			const title = response_title.data.title;
			set_resume_title(title);

			// Generate the PDF
			const response = await api.post(
				"/generate/live/from-cache/" + template,
				{
					conversation_id: conv_id,
				},
				{ responseType: "blob" }
			);

			set_pdf_blob(response.data);
			set_resume_id(conv_id);
		} catch (error) {
			localStorage.removeItem("conversation_id");
			localStorage.removeItem("job_description");
			set_job_description("");
			set_conversation_id(undefined);
		} finally {
			set_is_loading(false);
		}
	};

	const handleAIGenerated = async (
		job_description: string,
		data: GenerateResumeFromAIData
	) => {
		try {
			set_conversation_id(data.conversation_id);

			// Fetch metadata to get title
			try {
				const response_title = await api.get(
					"/ai/conversation/metadata/" + data.conversation_id
				);
				const title = response_title.data.title as string;
				const resume_data = response_title.data
					.resume_data as ResumeData;

				if (title && resume_data) {
					set_resume_title(title);

					// Store in DB
					resume_data.certificates.forEach(
						(v, i) => (v.certificate_id = i)
					);
					resume_data.experiences.forEach(
						(v, i) => (v.experience_id = i)
					);
					resume_data.educations.forEach(
						(v, i) => (v.education_id = i)
					);
					resume_data.projects.forEach((v, i) => (v.project_id = i));
					resume_data.skills.forEach((v, i) => (v.skill_id = i));

					DB_JOB_SPECIFIC_RESUMES.upsert(db, data.conversation_id, {
						resume_data: resume_data,
						job_description,
						template: template,
						title: title,
					});
				}
			} catch (err) {
				console.error("Failed to get resume title", err);
			}

			// Generate the PDF
			const response = await api.post(
				"/generate/live/from-cache/" + template,
				{
					conversation_id: data.conversation_id,
				},
				{ responseType: "blob" }
			);

			set_pdf_blob(response.data);
			set_resume_id(data.conversation_id);
		} catch (error) {
			fault.minor({ message: "Failed to get PDF file" });
		}
	};

	const handleProfileGenerated = async (
		data: GenerateResumeFromProfileData
	) => {
		try {
			const response = await api.get("/generate/" + data.resume_id, {
				responseType: "blob",
			});
			set_pdf_blob(response.data);
			set_resume_name(data.resume_name);
			set_resume_id(data.resume_id);
		} catch (error) {
			fault.minor({ message: "Failed to get PDF file" });
		}
	};

	const refreshResume = async () => {
		if (!conversation_id()) return;

		set_is_loading(true);
		try {
			const response = await api.post(
				"/generate/live/from-cache/" + template,
				{
					conversation_id: conversation_id(),
				},
				{ responseType: "blob" }
			);
			set_pdf_blob(response.data);

			try {
				const response_title = await api.get(
					"/ai/conversation/metadata/" + conversation_id()
				);
				const resume_data = response_title.data
					.resume_data as ResumeData;

				if (resume_data) {
					// Store in DB
					resume_data.certificates.forEach(
						(v, i) => (v.certificate_id = i)
					);
					resume_data.experiences.forEach(
						(v, i) => (v.experience_id = i)
					);
					resume_data.educations.forEach(
						(v, i) => (v.education_id = i)
					);
					resume_data.projects.forEach((v, i) => (v.project_id = i));
					resume_data.skills.forEach((v, i) => (v.skill_id = i));

					DB_JOB_SPECIFIC_RESUMES.upsert(db, conversation_id()!, {
						resume_data: resume_data,
						template: template,
					});
				}
			} catch (err) {
				console.error("Failed to get resume title", err);
			}
		} catch (error) {
			fault.minor({ message: "Failed to refresh resume" });
		} finally {
			set_is_loading(false);
		}
	};

	const startNewResume = () => {
		// Clear all saved data
		localStorage.removeItem("conversation_id");
		localStorage.removeItem("job_description");

		set_conversation_id(undefined);
		set_pdf_blob(undefined);
		set_resume_title(undefined);
		set_resume_id(undefined);
		set_job_description("");
	};

	return (
		<section class="overflow-y-auto overflow-x-clip w-full h-full flex flex-col gap-4 pb-4">
			<Show when={!pdf_blob()}>
				<GenerateResumeFromProfile
					template_name={template}
					start_loading={() => set_is_loading(true)}
					end_loading={() => set_is_loading(false)}
					on_generated={handleProfileGenerated}
				/>

				<aside class="flex justify-center items-center w-full">
					<div class="border-t border-lapis-100 w-1/3"></div>
					<span class="px-4 text-lapis-400">or</span>
					<div class="border-t border-lapis-100 w-1/3"></div>
				</aside>

				<AIConversation
					template_name={template}
					start_loading={() => set_is_loading(true)}
					end_loading={() => set_is_loading(false)}
					on_generated={handleAIGenerated}
					initial_job_description={job_description()}
				/>
			</Show>

			<Show when={pdf_blob()}>
				<nav class="flex justify-between items-center w-full px-4 py-2 bg-lapis-50 rounded">
					<button
						class="text-lapis-600 hover:text-lapis-800 flex items-center gap-1"
						onClick={startNewResume}
					>
						<BackIcon class="fill-lapis-600" />
						Start New Resume
					</button>
				</nav>

				<main class="flex flex-col gap-4">
					<article class="flex flex-col gap-4">
						<Show when={conversation_id()}>
							<ResumeActions
								conversation_id={conversation_id()!}
								on_updated={refreshResume}
							/>
						</Show>

						<PDFView
							document_title={resume_title()}
							document_id={resume_id()!}
							document_name={resume_name()!}
							pdf_data={pdf_blob()!}
						/>
					</article>

					<Show when={conversation_id()}>
						<CoverLetter
							conversation_id={conversation_id()!}
							on_updated={() => {}}
						/>
					</Show>
				</main>
			</Show>

			<Show when={is_loading()}>
				<ResumeLoader is_visible on_complete={() => {}} />
			</Show>
		</section>
	);
}

export default ResumeAIPreview;
