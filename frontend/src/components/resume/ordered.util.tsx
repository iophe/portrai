import { Accessor, children, createSignal, JSXElement, Setter } from "solid-js";

interface OrderedProps<T> {
	draggable: (id: number) => boolean;
	id: number;
	list: () => T[] | undefined;
	getId: (e: T) => number;
	onSubmit: (new_list: T[], source_id: number, target_id: number) => void;
	children?: JSXElement;
	set_dragged_id: Setter<number | null>;
	dragged_id: Accessor<number | null>;
}

export function Ordered<T>(props: OrderedProps<T>) {
	return (
		<div
			draggable={!props.draggable(props.id)}
			onDragStart={(e: DragEvent) => {
				props.set_dragged_id(props.id);
				console.log("drag start", props.id);

				if (e.dataTransfer) {
					e.dataTransfer.effectAllowed = "move";
					if (e.target instanceof HTMLElement) {
						e.target.classList.add("opacity-50");
					}
				}
			}}
			onDragEnd={(e: DragEvent) => {
				console.log("drag end", props.id);
				props.set_dragged_id(null);
				if (e.target instanceof HTMLElement) {
					e.target.classList.remove("opacity-50");
				}
			}}
			onDragOver={(e: DragEvent) => {
				console.log("drag over", props.id);
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = "move";
				}
			}}
			onDrop={(e: DragEvent) => {
				e.preventDefault();
				const source_id = props.dragged_id();
				console.log("on drop", source_id);

				if (source_id !== null && source_id !== props.id) {
					const current_list = props.list();
					if (!current_list) return;

					const new_list = [...current_list];
					const source_idx = new_list.findIndex(
						(e) => props.getId(e) === source_id
					);
					const target_idx = new_list.findIndex(
						(e) => props.getId(e) === props.id
					);

					// Reorder the array
					const [moved_item] = new_list.splice(source_idx, 1);
					new_list.splice(target_idx, 0, moved_item);

					// Update the resource with new order
					console.log(new_list);

					props.onSubmit(new_list, source_id, props.id);
				}
			}}
			class="cursor-move"
		>
			{props.children}
		</div>
	);
}
