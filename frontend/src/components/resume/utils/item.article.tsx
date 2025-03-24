import { children, JSXElement, Match, Setter, Switch } from "solid-js";
import { Motion, Presence } from "solid-motionone";
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
		<Motion
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3, easing: "ease-in-out" }}
		>
			<article class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-2">
				<header class="flex flex-row justify-between">
					<Motion
						hover={{ scale: 1.1, rotate: 2 }}
						press={{ scale: 0.95 }}
						transition={{ duration: 0.15 }}
					>
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
							class="cursor-move pr-4 py-4 hover:bg-gray-100 smooth-transition"
							title="Drag to reorder"
						>
							<DragIcon class="fill-forest-900" />
						</button>
					</Motion>
					<div class="flex flex-row gap-4">
						<Motion
							hover={{ scale: 1.2 }}
							press={{ scale: 0.9 }}
							transition={{ duration: 0.15 }}
						>
							<button
								title="toggle visibility"
								onclick={() => {
									props.toggle_visibility();
								}}
							>
								<Presence exitBeforeEnter>
									<Switch>
										<Match when={props.is_visible}>
											<Motion
												initial={{ rotateY: -90 }}
												animate={{ rotateY: 0 }}
												exit={{ rotateY: 90 }}
												transition={{ duration: 0.2 }}
											>
												<EyeOpenIcon class="fill-forest-900" />
											</Motion>
										</Match>
										<Match when={!props.is_visible}>
											<Motion
												initial={{ rotateY: -90 }}
												animate={{ rotateY: 0 }}
												exit={{ rotateY: 90 }}
												transition={{ duration: 0.2 }}
											>
												<EyeCloseIcon class="fill-forest-900" />
											</Motion>
										</Match>
									</Switch>
								</Presence>
							</button>
						</Motion>
						<Motion
							hover={{ scale: 1.2, rotate: 15 }}
							press={{ scale: 0.9 }}
							transition={{ duration: 0.15 }}
						>
							<button
								title="Edit"
								onclick={() => {
									props.edit(props.item_id);
								}}
							>
								<EditIcon class="fill-forest-900" />
							</button>
						</Motion>
					</div>
				</header>
				<Motion
					initial={{ y: 10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.1, duration: 0.3 }}
				>
					<ItemHeader
						edit={props.edit}
						item_id={props.item_id}
						title={props.title}
						subtitle={props.subtitle}
						set_dragged_id={props.set_dragged_id}
						draggable={props.draggable}
					/>
				</Motion>
				<Motion
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.3 }}
				>
					{props.children}
				</Motion>
			</article>
		</Motion>
	);
}

export default ItemArticle;
