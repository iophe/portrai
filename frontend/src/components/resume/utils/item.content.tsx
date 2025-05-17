import { En, Fr, Lang } from "@components/language";
import { JSXElement, Show } from "solid-js";

interface ItemInfoProps {
	children?: JSXElement;
}

export function ItemInfo(props: ItemInfoProps) {
	return <p class="text-gray-600 text-sm">{props.children}</p>;
}

interface ItemTextProps {
	children?: JSXElement;
}

export function ItemText(props: ItemTextProps) {
	return (
		<p class="text-gray-700 border-l-4 border-l-lapis-50 pl-4">
			{props.children}
		</p>
	);
}

interface ItemDateProps {
	date: Date;
}

export function ItemDate(props: ItemDateProps) {
	return <p class="text-gray-600 text-sm">{props.date.toDateString()}</p>;
}

interface ItemDateRangeProps {
	start: Date;
	end?: Date;
}

export function ItemDateRange(props: ItemDateRangeProps) {
	return (
		<span class="flex gap-1">
			<ItemDate date={props.start} />
			<p> - </p>
			<Show
				when={props.end}
				fallback={
					<p class="text-gray-600 text-sm">
						<Lang>
							<En>present</En>
							<Fr>présent</Fr>
						</Lang>
					</p>
				}
			>
				<ItemDate date={props.end!} />
			</Show>
		</span>
	);
}
