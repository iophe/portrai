import { createSignal, For } from "solid-js";

interface TagsProps {
	values: string[];
}

export function Tags(props: TagsProps) {
	return (
		<ul class="flex gap-2 flex-wrap">
			<For each={props.values}>
				{(value) => (
					<li class="px-2 py-1 bg-lapis-50 text-gray-700 text-sm rounded">
						{value}
					</li>
				)}
			</For>
		</ul>
	);
}

interface FormTagsProps {
	add: (tag: string) => void;
	delete: (idx: number) => void;
	tags: string[];
}

export function FormTags(props: FormTagsProps) {
	const [new_tag, setNewTag] = createSignal("");

	function addTag(e: KeyboardEvent) {
		if (e.key === "Enter" && new_tag()) {
			e.preventDefault();
			props.add(new_tag());
			setNewTag("");
		}
	}

	return (
		<div class="space-y-2">
			<label class="block text-sm font-medium text-gray-700">Tags</label>
			<input
				type="text"
				value={new_tag()}
				onInput={(e) => setNewTag(e.currentTarget.value)}
				onKeyPress={addTag}
				placeholder="Press Enter to add tag"
				class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
			/>
			<ul class="flex gap-2 flex-wrap">
				<For each={props.tags}>
					{(tag, index) => (
						<li class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded flex items-center gap-1">
							{tag}
							<button
								type="button"
								onClick={() => props.delete(index())}
								class="text-gray-500 hover:text-gray-700 smooth-transition"
							>
								×
							</button>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
}
