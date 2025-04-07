import { createSignal, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { useFault } from "@components/fault";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import LetterIcon from "@assets/icons/letter.svg?component-solid";
import RefreshIcon from "@assets/icons/refresh.svg?component-solid";
import api from "@utils/api";
import LoadingSpinner from "@components/loading.spinner";
import { formatText } from "./offline.view";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import { db } from "@utils/db/db";

interface CoverLetterProps {
	conversation_id: string;
	on_updated?: () => void;
}

export function CoverLetter(props: CoverLetterProps) {
	const fault = useFault();
	const [letter_content, set_letter_content] = createSignal<string>("");
	const [comment, set_comment] = createSignal("");
	const [is_updating, set_is_updating] = createSignal(false);
	const [has_letter, set_has_letter] = createSignal(false);
	const [instruction, set_instruction] = createSignal("");
	const [is_creating, set_is_creating] = createSignal(false);

	const handleUpdateCoverLetter = async () => {
		if (!comment()) return;

		try {
			set_is_updating(true);
			const response = await api.post(
				`/ai/conversation/comment/letter/${props.conversation_id}`,
				{
					comment: comment(),
				}
			);

			if (response.data && response.data.letter) {
				set_letter_content(response.data.letter);
				set_has_letter(true);

				DB_JOB_SPECIFIC_RESUMES.upsert(db, props.conversation_id, {
					letter: response.data.letter,
				});
			}

			set_comment("");
			if (props.on_updated) {
				props.on_updated();
			}
		} catch (error) {
			fault.minor({ message: "Failed to update cover letter" });
		} finally {
			set_is_updating(false);
		}
	};

	const handleCreateCoverLetter = async () => {
		try {
			set_is_creating(true);
			const response = await api.post(
				`/ai/conversation/letter/${props.conversation_id}`,
				{
					instruction: instruction(),
				}
			);

			if (response.data && response.data.letter) {
				set_letter_content(response.data.letter);
				set_has_letter(true);

				DB_JOB_SPECIFIC_RESUMES.upsert(db, props.conversation_id, {
					letter: response.data.letter,
				});
			}

			set_instruction("");
			if (props.on_updated) {
				props.on_updated();
			}
		} catch (error) {
			fault.minor({ message: "Failed to create cover letter" });
		} finally {
			set_is_creating(false);
		}
	};

	return (
		<Presence>
			<Motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2, easing: "ease-out" }}
				class="shadow rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4"
			>
				<Show when={has_letter()}>
					<Motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.1 }}
						class="bg-white border-lapis-100 shadow px-4 py-8"
					>
						{formatText(letter_content())}
					</Motion.div>

					<form
						class="mt-4"
						onSubmit={(e) => {
							e.preventDefault();
							handleUpdateCoverLetter();
						}}
					>
						<fieldset>
							<legend class="flex flex-col gap-2 items-center mb-2">
								<span>Revise Cover Letter:</span>
								<span class="flex flex-row gap-2 opacity-40 cursor-help">
									<HelpIcon class="fill-lapis-400 min-w-fit" />
									<span class="text-lapis-300">
										Provide feedback to update your cover
										letter. Be specific about what you'd
										like to change.
									</span>
								</span>
							</legend>
							<textarea
								value={comment()}
								oninput={(e) =>
									set_comment(e.currentTarget.value)
								}
								class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md smooth-transition"
								rows={3}
								placeholder="Add your feedback here (e.g., Make it more concise, highlight my project management skills, etc.)"
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
										Update Cover Letter
										<Show when={is_updating()}>
											<LoadingSpinner white />
										</Show>
									</button>
								</Motion>
							</footer>
						</fieldset>
					</form>
				</Show>

				<Show when={!has_letter()}>
					<form
						class="flex flex-col gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							handleCreateCoverLetter();
						}}
					>
						<fieldset>
							<legend class="flex flex-col gap-2 items-center">
								<span>Create a Cover Letter:</span>
								<span class="flex flex-row gap-2 opacity-40 cursor-help">
									<HelpIcon class="fill-lapis-400 min-w-fit" />
									<span class="text-lapis-300">
										We'll create a cover letter based on
										your resume and the job description you
										provided.
									</span>
								</span>
							</legend>

							<textarea
								value={instruction()}
								oninput={(e) =>
									set_instruction(e.currentTarget.value)
								}
								class="w-full bg-gradient-to-br from-lapis-10 to-white rounded border border-lapis-50 p-4 outline-none hover:shadow-md smooth-transition mt-2"
								rows={3}
								placeholder="Add specific instructions for your cover letter (optional)"
							/>

							<footer class="flex justify-center mt-2">
								<Motion
									hover={{ scale: 1.05 }}
									press={{ scale: 0.95 }}
									transition={{ duration: 0.1 }}
								>
									<button
										type="submit"
										class="bg-forest-200 px-4 py-2 rounded text-snow-100 font-bold flex flex-row gap-2"
										disabled={is_creating()}
									>
										<LetterIcon class="fill-snow-100" />
										Generate Cover Letter
										<Show when={is_creating()}>
											<LoadingSpinner white />
										</Show>
									</button>
								</Motion>
							</footer>
						</fieldset>
					</form>
				</Show>
			</Motion.section>
		</Presence>
	);
}
