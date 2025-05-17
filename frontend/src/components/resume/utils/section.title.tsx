import { children, createSignal, JSXElement } from "solid-js";
import { Motion } from "solid-motionone";
import AddIcon from "@assets/icons/add.svg?component-solid";

interface SectionTitleProps {
	add: () => void;
	children: JSXElement;
}

function SectionTitle(props: SectionTitleProps) {
	return (
		<Motion.span
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.1, easing: "ease-out" }}
			class="flex flex-row gap-4 items-center"
		>
			<h2 class="lg:text-2xl text-xl font-semibold text-forest-900">
				{props.children}
			</h2>
			<Motion.button
				hover={{ scale: 1.1 }}
				press={{ scale: 0.95 }}
				transition={{ duration: 0.15 }}
				onClick={() => props.add()}
				title="add a new experience"
				class="relative"
			>
				<AddIcon class="min-w-fit fill-forest-900" />
			</Motion.button>
		</Motion.span>
	);
}

export default SectionTitle;
