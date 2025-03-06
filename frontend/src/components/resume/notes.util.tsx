import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Show } from "solid-js";
import NoteIcon from "@assets/icons/notes.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";

interface NoteFormProps {
	section_type: string;
	id: number;
	cancel: () => void;
	submit: () => void;
}

export function NoteForm(props: NoteFormProps) {
	const fault = useFault();
	const [note_type, set_note_type] = createSignal("instruction");
	const [note_content, set_note_content] = createSignal("");

	return (
		<div class="">
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
						fault.minor({
							message:
								((error as AxiosError).response?.data as any)
									.error ?? (error as AxiosError).message,
						});
					} finally {
						props.submit();
					}
				}}
				class="flex flex-col gap-3"
			>
				<div class="flex flex-col gap-2">
					<label class="text-sm text-gray-700">Note Type</label>
					<select
						value={note_type()}
						onChange={(e) => set_note_type(e.target.value)}
						class="border border-gray-300 rounded px-3 py-2"
					>
						<option value="instruction">Instruction</option>
						<option value="additional">Additional</option>
					</select>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm text-gray-700">Note Content</label>
					<textarea
						value={note_content()}
						onInput={(e) => set_note_content(e.target.value)}
						class="border border-gray-300 rounded px-3 py-2 min-h-[100px]"
						placeholder="Enter your note here..."
						required
					/>
				</div>

				<div class="flex gap-2 justify-end">
					<button
						type="button"
						onClick={() => props.cancel()}
						class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm text-white bg-gray-600 hover:bg-gray-700 rounded"
					>
						Submit Note
					</button>
				</div>
			</form>
		</div>
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

	return (
		<div class="flex flex-col border border-lapis-50 rounded gap-4 p-4">
			<span class="flex flex-row justify-between items-center">
				<p class="text-gray-600 text-sm">{props.type}</p>
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
							fault.minor({
								message:
									(
										(error as AxiosError).response
											?.data as any
									).error ?? (error as AxiosError).message,
							});
						}
					}}
				>
					<CloseIcon class="fill-night-900" />
				</button>
			</span>
			<p class="text-gray-700">{props.content}</p>
		</div>
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
			<header class="pt-4 flex flex-row justify-between">
				<h3>Notes :</h3>
				<button
					onClick={() => {
						show_note_form(true);
					}}
					title="add a new note"
					disabled={showing_note_form()}
					class="flex flex-row items-center gap-2"
				>
					<p class="text-2xl text-night-900">+</p>
					<NoteIcon class="fill-night-900" />
				</button>
			</header>

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
			<ul class="flex flex-col gap-4">
				<For each={props.notes}>
					{(note) => {
						return (
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
						);
					}}
				</For>
			</ul>
		</div>
	);
}
