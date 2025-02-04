import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";

interface ProjectViewProps {
	project: Project;
	edit: (project_id: number) => void;
	delete: (project_id: number) => void;
}

export function ProjectView(props: ProjectViewProps) {
	return (
		<article class="p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
			<header class="flex flex-col justify-between items-start mb-2">
				<h3 class="text-lg font-medium text-gray-900">
					{props.project.project_title}
				</h3>
				<Show when={props.project.optional_project_subtitle}>
					<h4 class="text-gray-700">
						{props.project.optional_project_subtitle}
					</h4>
				</Show>
			</header>
			<span class="flex flex-row gap-1">
				<Show when={props.project.start_date}>
					<p class="text-gray-600 text-sm">
						{props.project.start_date}
					</p>
				</Show>
				<Show
					when={
						props.project.start_date &&
						(props.project.optional_end_date ||
							props.project.is_current)
					}
				>
					<p class="text-gray-600 text-sm">-</p>
				</Show>
				<Show
					when={props.project.optional_end_date}
					fallback={
						<Show when={props.project.is_current}>
							<p class="text-gray-600 text-sm">present</p>
						</Show>
					}
				>
					<p class="text-gray-600 text-sm">
						{props.project.optional_end_date}
					</p>
				</Show>
			</span>
			<p class="text-gray-700">{props.project.description}</p>
			<footer class="mt-2">
				<ul class="flex gap-2 flex-wrap">
					<For each={props.project.tags}>
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
					title="Edit this project"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.edit(props.project.project_id);
					}}
				>
					Edit
				</button>
				<button
					title="Delete this project"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.delete(props.project.project_id);
					}}
				>
					Delete
				</button>
			</div>
		</article>
	);
}

interface ProjectFormProps {
	project?: Project;
	is_new?: boolean;
	onSubmit: (project_id: number) => void;
	onCancel: () => void;
}

export function ProjectForm(props: ProjectFormProps) {
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		project_title: props.project?.project_title || "",
		optional_project_subtitle:
			props.project?.optional_project_subtitle || "",
		start_date: props.project?.start_date || "",
		optional_end_date: props.project?.optional_end_date || "",
		is_current: props.project?.is_current || false,
		description: props.project?.description || "",
		priority: props.project?.priority || 0,
		tags: props.project?.tags || [],
		notes: props.project?.notes || [],
	});
	const [new_tag, setNewTag] = createSignal("");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!props.is_new) {
			if (!props.project) return;
			try {
				await api.post("/resume/project/update", {
					...form_data,
					project_id: props.project.project_id,
				});
				props.onSubmit(props.project.project_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		} else {
			try {
				const res = await api.post("/resume/project/create", form_data);
				const project_id = res.data.project_id;
				props.onSubmit(project_id);
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
					Project Title
				</label>
				<input
					type="text"
					value={form_data.project_title}
					onInput={(e) =>
						setFormData("project_title", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					required
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Subtitle
				</label>
				<input
					type="text"
					value={form_data.optional_project_subtitle}
					onInput={(e) =>
						setFormData(
							"optional_project_subtitle",
							e.currentTarget.value
						)
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

			<div class="flex items-center gap-2 mt-2">
				<input
					type="checkbox"
					checked={form_data.is_current}
					onChange={(e) =>
						setFormData("is_current", e.currentTarget.checked)
					}
					class="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
				/>
				<label class="text-sm text-gray-700">Ongoing Project</label>
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
					Save Project
				</button>
			</div>
		</form>
	);
}
