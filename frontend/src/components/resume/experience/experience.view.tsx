import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { AddNote, NoteList } from "../notes.util";

interface ExperienceViewProps {
	experience: Experience;
	edit: (experience_id: number) => void;
	delete: (experience_id: number) => void;
}

export function ExperienceView(props: ExperienceViewProps) {
	return (
		<article class="p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
			<header class="flex flex-col justify-between items-start mb-2">
				<h3 class="text-lg font-medium text-gray-900">
					{props.experience.job_title}
				</h3>
				<h4 class="text-gray-700">{props.experience.company_name}</h4>
			</header>
			<p class="text-gray-600 text-sm">{props.experience.location}</p>
			<span class="flex flex-row">
				<p class="text-gray-600 text-sm">
					{props.experience.start_date}
				</p>
				-
				<Show
					when={props.experience.optional_end_date}
					fallback={<p class="text-gray-600 text-sm">present</p>}
				>
					<p class="text-gray-600 text-sm">
						{props.experience.optional_end_date}
					</p>
				</Show>
			</span>
			<p class="text-gray-700">{props.experience.description}</p>
			<footer class="mt-2">
				<ul class="flex gap-2 flex-wrap">
					<For each={props.experience.tags}>
						{(tag) => (
							<li class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
								{tag}
							</li>
						)}
					</For>
				</ul>
			</footer>
			<div class="self-end flex flex-row gap-4">
				<button
					title="Edit this professional experience"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.edit(props.experience.experience_id);
					}}
				>
					Edit
				</button>
				<button
					title="Edit this professional experience"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.delete(props.experience.experience_id);
					}}
				>
					Delete
				</button>
			</div>
			<NoteList notes={props.experience.notes} />
			<AddNote
				id={props.experience.experience_id}
				section_type="experience"
			/>
		</article>
	);
}

interface ExperienceFormProps {
	experience?: Experience;
	is_new?: boolean;
	onSubmit: (experience_id: number) => void;
	onCancel: () => void;
}

export function ExperienceForm(props: ExperienceFormProps) {
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		company_name: props.experience?.company_name || "",
		job_title: props.experience?.job_title || "",
		location: props.experience?.location || "",
		start_date: props.experience?.start_date || "",
		optional_end_date: props.experience?.optional_end_date || "",
		is_current: props.experience?.is_current || false,
		description: props.experience?.description || "",
		priority: props.experience?.priority || 0,
		tags: props.experience?.tags || [],
		notes: props.experience?.notes || [],
	});
	const [new_tag, setNewTag] = createSignal("");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!props.is_new) {
			if (!props.experience) return;
			// update existing experience
			try {
				console.log({ ...form_data });

				await api.post("/resume/experience/update", {
					...form_data,
					experience_id: props.experience.experience_id,
				});
				console.log({
					form_data: form_data,
					experience_id: props.experience.experience_id,
				});

				props.onSubmit(props.experience.experience_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		} else {
			try {
				const res = await api.post(
					"/resume/experience/create",
					form_data
				);
				const experience_id = res.data.experience_id;
				props.onSubmit(experience_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		}
	}

	function addTag(e: KeyboardEvent) {
		if (e.key === "Enter" && new_tag()) {
			e.preventDefault();
			setFormData("tags", [...form_data.tags, new_tag()]);
			setNewTag("");
		}
	}

	return (
		<form onSubmit={handleSubmit} class="">
			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Job Title
				</label>
				<input
					type="text"
					value={form_data.job_title}
					onInput={(e) =>
						setFormData("job_title", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					required
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Company
				</label>
				<input
					type="text"
					value={form_data.company_name}
					onInput={(e) =>
						setFormData("company_name", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					required
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Location
				</label>
				<input
					type="text"
					value={form_data.location}
					onInput={(e) =>
						setFormData("location", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">
						Start Date
					</label>
					<input
						type="date"
						value={form_data.start_date}
						onInput={(e) =>
							setFormData("start_date", e.currentTarget.value)
						}
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
						required
					/>
				</div>

				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">
						End Date
					</label>
					<input
						type="date"
						value={form_data.optional_end_date}
						onInput={(e) =>
							setFormData(
								"optional_end_date",
								e.currentTarget.value
							)
						}
						disabled={form_data.is_current}
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					/>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					checked={form_data.is_current}
					onChange={(e) =>
						setFormData("is_current", e.currentTarget.checked)
					}
					class="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
				/>
				<label class="text-sm text-gray-700">Current Position</label>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Description
				</label>
				<textarea
					value={form_data.description}
					onInput={(e) =>
						setFormData("description", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					rows="4"
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Tags
				</label>
				<input
					type="text"
					value={new_tag()}
					onInput={(e) => setNewTag(e.currentTarget.value)}
					onKeyPress={addTag}
					placeholder="Press Enter to add tag"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
				/>
				<ul class="flex gap-2 flex-wrap">
					<For each={form_data.tags}>
						{(tag, index) => (
							<li class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded flex items-center gap-1">
								{tag}
								<button
									type="button"
									onClick={() =>
										setFormData("tags", (t) =>
											t.filter((_, i) => i !== index())
										)
									}
									class="text-gray-500 hover:text-gray-700"
								>
									×
								</button>
							</li>
						)}
					</For>
				</ul>
			</div>

			<div class="flex justify-end gap-4">
				<button
					type="button"
					onClick={props.onCancel}
					class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
				>
					Save Experience
				</button>
			</div>
		</form>
	);
}
