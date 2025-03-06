import { children, createSignal, JSXElement } from "solid-js";
import AddIcon from "@assets/icons/add.svg?component-solid";

interface SectionTitleProps {
	add: () => void;
	children: JSXElement;
}

function SectionTitle(props: SectionTitleProps) {
	return (
		<span class="flex flex-row gap-4 items-center">
			<h2 class="text-2xl font-semibold text-night-900">
				{props.children}
			</h2>
			<button onClick={() => props.add()} title="add a new experience">
				<AddIcon class="fill-night-900" />
			</button>
		</span>
	);
}

export default SectionTitle;
