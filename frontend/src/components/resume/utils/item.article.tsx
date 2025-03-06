import { children, JSXElement, Match, Setter, Switch } from "solid-js";
import ItemHeader from "./item.header";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import DragIcon from "@assets/icons/drag.svg?component-solid";
import EyeOpenIcon from "@assets/icons/eye.svg?component-solid";
import EyeCloseIcon from "@assets/icons/eye-closed.svg?component-solid";

interface ItemArticleProps {
	item_id: number;
	title: string;
	subtitle?: string;
	edit: (item_id: number) => void;

	is_visible: boolean;
	toggle_visibility: () => void;

	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
	children?: JSXElement;
}

function ItemArticle(props: ItemArticleProps) {
	return (
		<article class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-2">
			<header class="flex flex-row justify-between">
				<button
					draggable={!props.draggable(props.item_id)}
					onDragStart={(e: DragEvent) => {
						props.set_dragged_id(props.item_id);

						if (e.dataTransfer) {
							e.dataTransfer.effectAllowed = "move";
							if (e.target instanceof HTMLElement) {
								e.target.classList.add("opacity-50");
							}
						}
					}}
					onDragEnd={(e: DragEvent) => {
						props.set_dragged_id(null);
						if (e.target instanceof HTMLElement) {
							e.target.classList.remove("opacity-50");
						}
					}}
					class="cursor-move pr-4 py-4 hover:bg-gray-100"
					title="Drag to reorder"
				>
					<DragIcon class="fill-night-900" />
				</button>
				<div class="flex flex-row gap-4">
					<button
						title="toggle visibility"
						onclick={() => {
							props.toggle_visibility();
						}}
					>
						<Switch>
							<Match when={props.is_visible}>
								<EyeOpenIcon class="fill-night-900" />
							</Match>
							<Match when={!props.is_visible}>
								<EyeCloseIcon class="fill-night-900" />
							</Match>
						</Switch>
					</button>
					<button
						title="Edit"
						onclick={() => {
							props.edit(props.item_id);
						}}
					>
						<EditIcon class="fill-night-900" />
					</button>
				</div>
			</header>
			<ItemHeader
				edit={props.edit}
				item_id={props.item_id}
				title={props.title}
				subtitle={props.subtitle}
				set_dragged_id={props.set_dragged_id}
				draggable={props.draggable}
			/>
			{props.children}
		</article>
	);
}

export default ItemArticle;
