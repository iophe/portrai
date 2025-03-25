import { children, createSignal, JSXElement } from "solid-js";
import { Motion } from "solid-motionone";
import AddIcon from "@assets/icons/add.svg?component-solid";

interface SectionTitleProps {
	add: () => void;
	children: JSXElement;
}

function SectionTitle(props: SectionTitleProps) {
	return (
		<Motion
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.1, easing: "ease-out" }}
		>
			<span class="flex flex-row gap-4 items-center">
				<h2 class="md:text-2xl text-xl font-semibold text-forest-900">
					{props.children}
				</h2>
				<Motion
					hover={{ scale: 1.1 }}
					press={{ scale: 0.95 }}
					transition={{ duration: 0.15 }}
				>
					<button
						onClick={() => props.add()}
						title="add a new experience"
						class="relative"
					>
						<AddIcon class="fill-forest-900" />
						<Motion
							hover={{ opacity: 1, scale: 1 }}
							initial={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.2 }}
							style={{
								position: "absolute",
								top: "-2px",
								right: "-2px",
								width: "6px",
								height: "6px",
								"border-radius": "50%",
								"background-color": "var(--forest-900)",
							}}
						></Motion>
					</button>
				</Motion>
			</span>
		</Motion>
	);
}

export default SectionTitle;
