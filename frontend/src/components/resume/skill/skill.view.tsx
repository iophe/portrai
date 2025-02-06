import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { AddNote, NoteList } from "../notes.util";

interface SkillViewProps {
	skill: Skill;
	edit: (skill_id: number) => void;
	delete: (skill_id: number) => void;
}

export function SkillView(props: SkillViewProps) {
	return (
		<article class="p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
			<header class="flex flex-col justify-between items-start mb-2">
				<h3 class="text-lg font-medium text-gray-900">
					{props.skill.skill_name}
				</h3>
				<div class="flex flex-row gap-4">
					<Show when={props.skill.optional_skill_type}>
						<span class="text-gray-600">
							Type: {props.skill.optional_skill_type}
						</span>
					</Show>
					<Show when={props.skill.optional_skill_level}>
						<span class="text-gray-600">
							Level: {props.skill.optional_skill_level}
						</span>
					</Show>
				</div>
			</header>
			<p class="text-gray-700">{props.skill.description}</p>
			<footer class="mt-2">
				<ul class="flex gap-2 flex-wrap">
					<For each={props.skill.tags}>
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
					title="Edit this skill"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.edit(props.skill.skill_id);
					}}
				>
					Edit
				</button>
				<button
					title="Delete this skill"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.delete(props.skill.skill_id);
					}}
				>
					Delete
				</button>
			</div>
			<NoteList notes={props.skill.notes} />
			<AddNote id={props.skill.skill_id} section_type="skill" />
		</article>
	);
}

interface SkillFormProps {
	skill?: Skill;
	is_new?: boolean;
	onSubmit: (skill_id: number) => void;
	onCancel: () => void;
}

export function SkillForm(props: SkillFormProps) {
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		skill_name: props.skill?.skill_name || "",
		optional_skill_type: props.skill?.optional_skill_type || "",
		optional_skill_level: props.skill?.optional_skill_level || "",
		description: props.skill?.description || "",
		priority: props.skill?.priority || 0,
		tags: props.skill?.tags || [],
		notes: props.skill?.notes || [],
	});
	const [new_tag, setNewTag] = createSignal("");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!props.is_new) {
			if (!props.skill) return;
			try {
				await api.post("/resume/skill/update", {
					...form_data,
					skill_id: props.skill.skill_id,
				});
				props.onSubmit(props.skill.skill_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		} else {
			try {
				const res = await api.post("/resume/skill/create", form_data);
				const skill_id = res.data.skill_id;
				props.onSubmit(skill_id);
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
					Skill Name
				</label>
				<input
					type="text"
					value={form_data.skill_name}
					onInput={(e) =>
						setFormData("skill_name", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					required
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">
						Skill Type
					</label>
					<select
						value={form_data.optional_skill_type}
						onChange={(e) =>
							setFormData(
								"optional_skill_type",
								e.currentTarget.value
							)
						}
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					>
						<option value="">Select Type</option>
						<option value="Technical">Technical</option>
						<option value="Soft">Soft</option>
						<option value="Language">Language</option>
						<option value="Tool">Tool</option>
						<option value="Framework">Framework</option>
						<option value="Platform">Platform</option>
						<option value="Other">Other</option>
					</select>
				</div>

				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">
						Skill Level
					</label>
					<select
						value={form_data.optional_skill_level}
						onChange={(e) =>
							setFormData(
								"optional_skill_level",
								e.currentTarget.value
							)
						}
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					>
						<option value="">Select Level</option>
						<option value="beginner">Beginner</option>
						<option value="amateur">Amateur</option>
						<option value="competent">Competent</option>
						<option value="proficient">Proficient</option>
						<option value="Expert">Expert</option>
					</select>
				</div>
			</div>

			<div class="space-y-2 mt-4">
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

			<div class="flex justify-end gap-4 mt-4">
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
					Save Skill
				</button>
			</div>
		</form>
	);
}
