import { children, createSignal, JSXElement } from "solid-js";
import AddIcon from "@assets/icons/add.svg?component-solid";

interface SectionTitleProps {
	add: () => void;
	children: JSXElement;
}

function SectionTitle(props: SectionTitleProps) {
	return (
		<span class="flex flex-row gap-4 items-center">
			<h2 class="md:text-2xl text-xl font-semibold text-forest-900">
				{props.children}
			</h2>
			<button onClick={() => props.add()} title="add a new experience">
				<AddIcon class="fill-forest-900" />
			</button>
		</span>
	);
}

export default SectionTitle;
