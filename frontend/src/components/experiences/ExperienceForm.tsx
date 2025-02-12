import { useFault } from "@components/fault";
import { createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";

interface ExperienceFormProps {
	experience?: Experience;
	onSubmit: (data: Omit<Experience, "experience_id">) => void;
	onCancel: () => void;
}

function ExperienceForm(props: ExperienceFormProps) {
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		company_name: props.experience?.company_name || "",
		job_title: props.experience?.job_title || "",
		location: props.experience?.location || "",
		start_date: props.experience?.start_date || "",
		end_date: props.experience?.end_date || "",
		is_current: props.experience?.is_current || false,
		description: props.experience?.description || "",
		priority: props.experience?.priority || 0,
		tags: props.experience?.tags || [],
		notes: props.experience?.notes || [],
	});

	const [new_tag, setNewTag] = createSignal("");

	function handleSubmit(e: Event) {
		e.preventDefault();
		props.onSubmit(form_data);
	}

	function addTag(e: KeyboardEvent) {
		if (e.key === "Enter" && new_tag()) {
			e.preventDefault();
			setFormData("tags", [...form_data.tags, new_tag()]);
			setNewTag("");
		}
	}

	return (
		<form onSubmit={handleSubmit} class="space-y-4 max-w-2xl mx-auto">
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
						value={form_data.end_date}
						onInput={(e) =>
							setFormData("end_date", e.currentTarget.value)
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

export default ExperienceForm;
