import {
	createSignal,
	Show,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { useFault } from "@components/fault";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import RefreshIcon from "@assets/icons/refresh.svg?component-solid";
import api from "@utils/api";
import LoadingSpinner from "@components/loading.spinner";

interface ResumeActionsProps {
	conversation_id: string;
	on_updated: () => void;
}

export function ResumeActions(props: ResumeActionsProps) {
	const fault = useFault();
	const [comment, set_comment] = createSignal("");
	const [is_updating, set_is_updating] = createSignal(false);

	const handleUpdateResume = async () => {
		if (!comment()) return;

		try {
			set_is_updating(true);
			await api.post(
				`/ai/conversation/comment/resume/${props.conversation_id}`,
				{
					comment: comment(),
				}
			);
			props.on_updated();
			set_comment("");
		} catch (error) {
			fault.minor({ message: "Failed to update resume" });
		} finally {
			set_is_updating(false);
		}
	};

	return (
		<Presence>
			<Motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.4, easing: "ease-out" }}
				class="shadow rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4"
			>
				<header class="flex flex-col gap-2 items-center">
					<h3>Revise Resume</h3>
					<span class="flex flex-row gap-2 opacity-40 cursor-help">
						<HelpIcon class="fill-lapis-400 min-w-fit" />
						<p class="text-lapis-300">
							Provide feedback to update your resume. Be specific
							about what you'd like to change.
						</p>
					</span>
				</header>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleUpdateResume();
					}}
				>
					<fieldset>
						<textarea
							value={comment()}
							oninput={(e) => set_comment(e.currentTarget.value)}
							class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md smooth-transition"
							rows={3}
							placeholder="Add your feedback here (e.g., Add more details about my Python skills, emphasize team leadership, etc.)"
						/>

						<footer class="flex justify-end mt-2">
							<Motion
								hover={{ scale: 1.05 }}
								press={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
							>
								<button
									type="submit"
									class="bg-forest-200 px-4 py-2 rounded text-snow-100 font-bold flex flex-row gap-2"
									disabled={is_updating() || !comment()}
								>
									<RefreshIcon class="fill-snow-100" />
									Update Resume
									<Show when={is_updating()}>
										<LoadingSpinner white />
									</Show>
								</button>
							</Motion>
						</footer>
					</fieldset>
				</form>
			</Motion.section>
		</Presence>
	);
}
