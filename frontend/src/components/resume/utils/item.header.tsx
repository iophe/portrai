import { Setter, Show } from "solid-js";

interface ItemHeaderProps {
	item_id: number;
	edit: (item_id: number) => void;
	title: string;
	subtitle?: string;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
}

function ItemHeader(props: ItemHeaderProps) {
	return (
		<header class="flex flex-row gap-4 justify-between">
			<div class="flex flex-row gap-4">
				<div class="flex flex-col gap-2">
					<h3 class="text-lg font-medium text-forest-900">
						{props.title}
					</h3>
					<Show when={props.subtitle}>
						<h4 class="text-gray-700">{props.subtitle}</h4>
					</Show>
				</div>
			</div>
		</header>
	);
}

export default ItemHeader;
