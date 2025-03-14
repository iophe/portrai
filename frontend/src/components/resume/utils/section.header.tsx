import { children, createSignal, JSXElement, Show } from "solid-js";
import SectionTitle from "./section.title";

interface FormProps {
	cancel: () => void;
	submit: () => void;
}

interface SectionHeaderProps {
	add: () => void;
	section_title: string;
	section_name: string;
	form: (props: FormProps) => JSXElement;
}

function SectionHeader(props: SectionHeaderProps) {
	const [creating_new, create_new] = createSignal(false);
	return (
		<div>
			<SectionTitle
				add={() => {
					create_new(true);
				}}
			>
				{props.section_title}
			</SectionTitle>

			<Show when={creating_new()}>
				{props.form({
					cancel() {
						create_new(false);
					},
					submit() {
						create_new(false);
					},
				})}
			</Show>
		</div>
	);
}

export default SectionHeader;
