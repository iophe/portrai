import { createSignal, Show, Switch, Match, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Motion, Presence } from "solid-motionone";
import { useFault } from "@components/fault";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import PlusIcon from "@assets/icons/plus.svg?component-solid";
import MinusIcon from "@assets/icons/minus.svg?component-solid";
import api from "@utils/api";
import LoadingSpinner from "@components/loading.spinner";
import { ProcessMajorError } from "@utils/payment";

interface AIConversationProps {
	template_name: string;
	on_generated: (
		job_description: string,
		data: GenerateResumeFromAIData
	) => void;
	start_loading: () => void;
	end_loading: () => void;
	initial_job_description?: string;
}

export default function AIConversation(props: AIConversationProps) {
	const navigate = useNavigate();
	const fault = useFault();

	const [is_generating, set_is_generating] = createSignal(false);

	const [job_description, set_job_description] = createSignal<string>(
		props.initial_job_description || ""
	);
	const [instruction, set_instruction] = createSignal<string>("");
	const [show_instructions, set_show_instructions] = createSignal(false);

	onCleanup(() => {
		set_instruction("");
		set_job_description("");
	});

	async function handleGenerateResume() {
		if (!job_description()) return;
		try {
			set_is_generating(true);
			props.start_loading();

			const res = await api.post("/ai/conversation/start", {
				job_description: job_description(),
				template_name: props.template_name,
			});
			const result = res.data as GenerateResumeFromAIData;

			await api.post(
				"/ai/conversation/resume/" + result.conversation_id,
				{
					instruction: instruction(),
				}
			);

			// Save conversation ID to localStorage
			localStorage.setItem("conversation_id", result.conversation_id);
			localStorage.setItem("job_description", job_description());

			props.on_generated(job_description(), result);
		} catch (error: any) {
			ProcessMajorError(
				error,
				navigate,
				fault,
				"Failed to generate the resume"
			);
		} finally {
			set_is_generating(false);
			props.end_loading();
		}
	}

	return (
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
				<header class="flex flex-col gap-2 items-center justify-center">
					<h2 class="text-center">Create a job-tailored resume</h2>
					<label class="flex flex-row gap-2 opacity-40 cursor-help">
						<HelpIcon class="fill-lapis-400 min-w-fit" />
						<p class="text-lapis-300">
							Paste the job description here
						</p>
					</label>
				</header>
				<Motion
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					<textarea
						value={job_description()}
						oninput={(e) => {
							set_job_description(e.currentTarget.value);
						}}
						class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md smooth-transition"
						rows={4}
						placeholder="Paste the job description here..."
					/>
				</Motion>

				<button
					class="text-lapis-600 flex items-center gap-1"
					onClick={() => set_show_instructions(!show_instructions())}
				>
					<Show
						when={show_instructions()}
						fallback={<PlusIcon class="fill-lapis-400" />}
					>
						<MinusIcon class="fill-lapis-400" />
					</Show>
					<Switch>
						<Match when={show_instructions()}>
							Hide additional instructions
						</Match>
						<Match when={!show_instructions()}>
							Add additional instructions
						</Match>
					</Switch>
				</button>

				<Show when={show_instructions()}>
					<Motion
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.1 }}
					>
						<div class="flex flex-col gap-2 items-center">
							<label
								for="instructions"
								class="text-sm font-medium"
							>
								Additional Instructions:
							</label>
							<div class="flex flex-row gap-2 items-center cursor-help opacity-40">
								<HelpIcon class="fill-lapis-400 min-w-fit" />
								<p class="text-lapis-300">
									Add specific instructions for your resume,
									such as highlighting certain skills or
									experiences.
								</p>
							</div>
						</div>
						<textarea
							id="instructions"
							value={instruction()}
							oninput={(e) => {
								set_instruction(e.currentTarget.value);
							}}
							class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md smooth-transition mt-2"
							rows={2}
							placeholder="E.g., Focus on my leadership skills, highlight my experience with React, etc."
						/>
					</Motion>
				</Show>

				<Motion
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<div class="flex flex-col sm:flex-row gap-2 items-center justify-center">
						<Motion
							hover={{ scale: 1.03 }}
							press={{ scale: 0.97 }}
							transition={{ duration: 0.1 }}
						>
							<button
								class="bg-forest-200 px-4 py-2 rounded text-snow-100 font-semibold flex flex-row gap-2 w-fit"
								onClick={handleGenerateResume}
								disabled={is_generating()}
							>
								Generate Resume
								<Show when={is_generating()}>
									<LoadingSpinner white />
								</Show>
							</button>
						</Motion>
					</div>
				</Motion>
			</Motion.section>
		</Presence>
	);
}
