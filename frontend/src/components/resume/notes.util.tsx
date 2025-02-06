import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Show } from "solid-js";

interface AddNoteProps {
	section_type: string;
	id: number;
}

export function AddNote(props: AddNoteProps) {
	const fault = useFault();
	const [showing_note_form, show_note_form] = createSignal(false);
	const [note_type, set_note_type] = createSignal("instruction");
	const [note_content, set_note_content] = createSignal("");

	return (
		<div class="mt-4">
			<Show
				when={showing_note_form()}
				fallback={
					<button
						onClick={() => show_note_form(true)}
						class="text-sm text-gray-600 hover:text-gray-700"
					>
						Add Notes
					</button>
				}
			>
				<form
					onSubmit={async (e) => {
						e.preventDefault();

						try {
							await api.post("/resume/notes/create", {
								type: note_type(),
								content: note_content(),
								on_id: props.id,
								section: props.section_type,
							});
						} catch (error) {
							fault.minor({
								message:
									(
										(error as AxiosError).response
											?.data as any
									).error ?? (error as AxiosError).message,
							});
						}
						// set_note_content("");
						// show_note_form(false);
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
						<label class="text-sm text-gray-700">
							Note Content
						</label>
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
							onClick={() => show_note_form(false)}
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
			</Show>
		</div>
	);
}

interface NoteViewProps {
	type: string;
	content: string;
}

export function NoteView(props: NoteViewProps) {
	return (
		<div class="flex flex-col gap-4 rounded-l border-gray-200 border p-4">
			<p class="text-gray-600 text-sm">{props.type}</p>
			<p class="text-gray-700">{props.content}</p>
		</div>
	);
}

interface NoteListProps {
	notes: Record<string, any>[];
}

export function NoteList(props: NoteListProps) {
	return (
		<For each={props.notes}>
			{(note) => {
				return (
					<NoteView
						content={note["content"] ?? ""}
						type={note["note_type"] ?? ""}
					/>
				);
			}}
		</For>
	);
}
