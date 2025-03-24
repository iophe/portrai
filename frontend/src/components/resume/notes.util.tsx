import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import NoteIcon from "@assets/icons/notes.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import { useNavigate } from "@solidjs/router";

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
		<Motion
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, easing: "ease-out" }}
			class=""
		>
			<form
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
						if ((error as AxiosError).status === 402) {
							navigate("/pricing");
						}
						if (
							(error as AxiosError).status !== 401 &&
							(error as AxiosError).status !== 402
						)
							fault.minor({
								message:
									(
										(error as AxiosError).response
											?.data as any
									).error ?? (error as AxiosError).message,
							});
					} finally {
						props.submit();
					}
				}}
				class="flex flex-col gap-3"
			>
				<Motion
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.1, delay: 0.1 }}
				>
					<div class="flex flex-col gap-2">
						<label class="text-sm text-gray-700">
							What kind of comment ?
						</label>
						<select
							value={note_type()}
							onChange={(e) => set_note_type(e.target.value)}
							class="border border-gray-300 rounded px-3 py-2"
						>
							<option value="instruction">
								Instruction for the AI assistant
							</option>
							<option value="additional">
								Additional information about this{" "}
								{props.section_type}
							</option>
						</select>
					</div>
				</Motion>

				<Motion
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.1, delay: 0.2 }}
				>
					<div class="flex flex-col gap-2">
						<label class="text-sm text-gray-700">Comment</label>
						<textarea
							value={note_content()}
							onInput={(e) => set_note_content(e.target.value)}
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
							rows={4}
							maxLength={1024}
							placeholder="Write your comment here..."
							required
						/>
					</div>
				</Motion>

				<Motion
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.1, delay: 0.3 }}
				>
					<div class="flex gap-2 justify-end">
						<Motion
							hover={{ scale: 1.05 }}
							press={{ scale: 0.95 }}
							transition={{ duration: 0.15 }}
						>
							<button
								type="button"
								onClick={() => props.cancel()}
								class="px-4 py-2 text-sm text-lapis-600 hover:bg-lapis-50 rounded smooth-transition"
							>
								Cancel
							</button>
						</Motion>
						<Motion
							hover={{ scale: 1.05 }}
							press={{ scale: 0.95 }}
							transition={{ duration: 0.15 }}
						>
							<button
								type="submit"
								class="px-4 py-2 text-sm text-white bg-lapis-600 hover:bg-lapis-700 rounded smooth-transition"
							>
								Submit Note
							</button>
						</Motion>
					</div>
				</Motion>
			</form>
		</Motion>
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
		<Motion
			initial={{ opacity: 0, scale: 0.97 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.2, easing: "ease-out" }}
		>
			<div class="flex flex-col border border-lapis-50 rounded gap-4 p-4 relative overflow-hidden">
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
								Additional information about this{" "}
								{props.section_type}
							</Match>
							<Match when={props.type === "instruction"}>
								Instruction for the AI assistant
							</Match>
						</Switch>
					</p>
					<Motion
						hover={{ scale: 1.1 }}
						press={{ scale: 0.9 }}
						transition={{ duration: 0.15 }}
					>
						<button
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
									if ((error as AxiosError).status === 402) {
										navigate("/pricing");
									}
									if (
										(error as AxiosError).status !== 401 &&
										(error as AxiosError).status !== 402
									)
										fault.minor({
											message:
												(
													(error as AxiosError)
														.response?.data as any
												).error ??
												(error as AxiosError).message,
										});
								}
							}}
						>
							<CloseIcon class="fill-forest-900" />
						</button>
					</Motion>
				</span>
				<p class="text-gray-700">{props.content}</p>
			</div>
		</Motion>
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
			<Motion
				initial={{ opacity: 0, y: -5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<header class="pt-4 flex flex-row justify-between">
					<h3 class="flex flex-wrap items-center gap-2">
						<span>Comments : </span>
						<span class="flex flex-row gap-2 items-center">
							<Motion
								animate={{ rotate: [0, -15, 15, -8, 8, 0] }}
								transition={{
									duration: 1,
									delay: 0.5,
									repeat: 0,
								}}
							>
								<HelpIcon class="fill-lapis-100 min-w-fit" />
							</Motion>
							<p class="text-lapis-500 text-sm">
								Comment this {props.section_type} to help your
								AI assistant understand it better
							</p>
						</span>
					</h3>
					<Motion
						hover={{ scale: 1.1 }}
						press={{ scale: 0.95 }}
						transition={{ duration: 0.15 }}
					>
						<button
							onClick={() => {
								show_note_form(true);
							}}
							title="add a new note"
							disabled={showing_note_form()}
							class="flex flex-row items-center gap-2"
						>
							<p class="text-2xl text-forest-900">+</p>
							<NoteIcon class="fill-forest-900" />
						</button>
					</Motion>
				</header>
			</Motion>

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
							<Motion
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.2,
									delay: index() * 0.1,
									easing: "ease-out",
								}}
							>
								<li>
									<NoteView
										content={note["content"] ?? ""}
										type={note["note_type"] ?? ""}
										note_id={note["note_id"]}
										on_id={props.id}
										section_type={props.section_type}
										refetch={props.refetch}
									/>
								</li>
							</Motion>
						);
					}}
				</For>
			</ul>
		</div>
	);
}
