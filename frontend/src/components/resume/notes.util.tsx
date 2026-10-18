import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import NoteIcon from "@assets/icons/notes.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/api";
import { En, Fr, Lang } from "@components/language";

interface NoteFormProps {
	section_type: string;
	id: number;
	cancel: () => void;
	submit: () => void;
}

export function NoteForm(props: NoteFormProps) {
	const fault = useFault();
	const navigate = useNavigate();
	const [note_type, set_note_type] = createSignal("instruction");
	const [note_content, set_note_content] = createSignal("");

	return (
		<Motion.form
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, easing: "ease-out" }}
			onSubmit={async (e) => {
				e.preventDefault();

				try {
					await api.post("/resume/notes/create", {
						type: note_type(),
						content: note_content(),
						item_id: props.id,
						item_type: props.section_type,
					});
				} catch (error) {
					ProcessMajorError(error, navigate, fault);
				} finally {
					props.submit();
				}
			}}
			class="flex flex-col gap-3"
		>
			<Motion.div
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.1, delay: 0.1 }}
				class="flex flex-col gap-2"
			>
				<label class="text-sm text-gray-700">
					<Lang>
						<En>What kind of comment?</En>
						<Fr>Quel type de commentaire ?</Fr>
					</Lang>
				</label>
				<select
					value={note_type()}
					onChange={(e) => set_note_type(e.target.value)}
					class="border border-gray-300 rounded px-3 py-2"
				>
					<option value="instruction">
						<Lang>
							<En>Instruction for the AI assistant</En>
							<Fr>Instruction pour l'assistant IA</Fr>
						</Lang>
					</option>
					<option value="additional">
						<Lang>
							<En>
								Additional information about this{" "}
								{props.section_type}
							</En>
							<Fr>
								Informations supplémentaires sur{" "}
								{props.section_type}
							</Fr>
						</Lang>
					</option>
				</select>
			</Motion.div>

			<Motion.div
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.1, delay: 0.2 }}
				class="flex flex-col gap-2"
			>
				<label class="text-sm text-gray-700">
					<Lang>
						<En>Comment</En>
						<Fr>Commentaire</Fr>
					</Lang>
				</label>
				<textarea
					value={note_content()}
					onInput={(e) => set_note_content(e.target.value)}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
					rows={4}
					maxLength={1024}
					placeholder="Write your comment here..."
					required
				/>
			</Motion.div>

			<Motion.div
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.1, delay: 0.3 }}
				class="flex gap-2 justify-end"
			>
				<Motion.button
					hover={{ scale: 1.02 }}
					press={{ scale: 0.98 }}
					transition={{ duration: 0.1 }}
					type="button"
					onClick={() => props.cancel()}
					class="px-4 py-2 text-sm text-lapis-600 hover:bg-lapis-50 rounded"
				>
					<Lang>
						<En>Cancel</En>
						<Fr>Annuler</Fr>
					</Lang>
				</Motion.button>
				<Motion.button
					hover={{ scale: 1.02 }}
					press={{ scale: 0.98 }}
					transition={{ duration: 0.1 }}
					type="submit"
					class="px-4 py-2 text-sm text-white bg-lapis-600 hover:bg-lapis-700 rounded"
				>
					<Lang>
						<En>Submit</En>
						<Fr>Envoyer</Fr>
					</Lang>
				</Motion.button>
			</Motion.div>
		</Motion.form>
	);
}

interface NoteViewProps {
	type: string;
	content: string;
	section_type: string;
	note_id: number;
	on_id: number;
	refetch: () => void;
}

export function NoteView(props: NoteViewProps) {
	const fault = useFault();
	const navigate = useNavigate();

	return (
		<Motion.div
			initial={{ opacity: 0, scale: 0.97 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.2, easing: "ease-out" }}
			class="flex flex-col border border-lapis-50 rounded gap-4 p-4 relative overflow-hidden"
		>
			<Motion
				initial={{ x: "-100%" }}
				animate={{ x: "0%" }}
				transition={{
					duration: 0.3,
					easing: "ease-out",
					delay: 0.1,
				}}
				style={{
					position: "absolute",
					left: "0",
					top: "0",
					width: "3px",
					height: "100%",
					"background-color":
						props.type === "instruction"
							? "var(--lapis-200)"
							: "var(--forest-200)",
				}}
			></Motion>
			<span class="flex flex-row justify-between items-center">
				<p class="text-gray-600 text-sm">
					<Switch>
						<Match when={props.type === "additional"}>
							<Lang>
								<En>Additional information about this</En>
								<Fr>Informations supplémentaires</Fr>
							</Lang>{" "}
							{props.section_type}
						</Match>
						<Match when={props.type === "instruction"}>
							<Lang>
								<En>Instruction for the AI assistant</En>
								<Fr>Instruction pour l'assitant IA</Fr>
							</Lang>
						</Match>
					</Switch>
				</p>
				<Motion.button
					hover={{ scale: 1.1 }}
					press={{ scale: 0.9 }}
					transition={{ duration: 0.15 }}
					onclick={async (e) => {
						if (!e.isTrusted) return;

						try {
							await api.post("/resume/notes/delete", {
								note_id: props.note_id,
								item_type: props.section_type,
								item_id: props.on_id,
							});
							props.refetch();
						} catch (error) {
							ProcessMajorError(error, navigate, fault);
						}
					}}
				>
					<CloseIcon class="min-w-fit fill-forest-900" />
				</Motion.button>
			</span>
			<p class="text-gray-700">{props.content}</p>
		</Motion.div>
	);
}

interface NoteListProps {
	notes: Record<string, any>[];
	section_type: string;
	id: number;
	refetch: () => void;
}

export function NoteList(props: NoteListProps) {
	const [showing_note_form, show_note_form] = createSignal(false);
	return (
		<div class="flex flex-col gap-4">
			<Motion.header
				initial={{ opacity: 0, y: -5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				class="pt-4 flex flex-row justify-between"
			>
				<h3 class="flex flex-wrap items-center gap-2">
					<span>
						<Lang>
							<En>Comments :</En>
							<Fr>Commentaires :</Fr>
						</Lang>{" "}
					</span>
					<span class="flex flex-row gap-2 items-center">
						<Motion
							animate={{ rotate: [0, -15, 15, -8, 8, 0] }}
							transition={{
								duration: 1,
								delay: 0.5,
								repeat: 0,
							}}
						>
							<HelpIcon class="min-w-fit fill-lapis-100" />
						</Motion>
						<p class="text-lapis-500 text-sm">
							<Lang>
								<En>Comment this</En>
								<Fr>Commentez</Fr>
							</Lang>{" "}
							{props.section_type}{" "}
							<Lang>
								<En>
									{" "}
									to help your AI assistant understand it
									better
								</En>
								<Fr>
									pour aider votre assistant IA à mieux le
									comprendre
								</Fr>
							</Lang>
						</p>
					</span>
				</h3>
				<Motion.button
					hover={{ scale: 1.1 }}
					press={{ scale: 0.95 }}
					transition={{ duration: 0.1 }}
					onClick={() => {
						show_note_form(true);
					}}
					title="add a new note"
					disabled={showing_note_form()}
					class="flex flex-row items-center gap-2"
				>
					<p class="text-2xl text-forest-900">+</p>
					<NoteIcon class="min-w-fit fill-forest-900" />
				</Motion.button>
			</Motion.header>

			<Presence>
				<Show when={showing_note_form()}>
					<NoteForm
						id={props.id}
						section_type={props.section_type}
						cancel={() => show_note_form(false)}
						submit={() => {
							show_note_form(false);
							props.refetch();
						}}
					/>
				</Show>
			</Presence>

			<ul class="flex flex-col gap-4">
				<For each={props.notes}>
					{(note, index) => {
						return (
							<Motion.li
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.2,
									delay: index() * 0.1,
									easing: "ease-out",
								}}
							>
								<NoteView
									content={note["content"] ?? ""}
									type={note["note_type"] ?? ""}
									note_id={note["note_id"]}
									on_id={props.id}
									section_type={props.section_type}
									refetch={props.refetch}
								/>
							</Motion.li>
						);
					}}
				</For>
			</ul>
		</div>
	);
}
