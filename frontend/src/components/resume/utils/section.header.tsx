import {
	children,
	createEffect,
	createSignal,
	JSXElement,
	Resource,
	Show,
} from "solid-js";
import SectionTitle from "./section.title";
import { useLang } from "@components/language";

interface FormProps {
	cancel: () => void;
	submit: () => void;
}

interface SectionHeaderProps<T> {
	add: () => void;
	en_section_title: string;
	fr_section_title: string;
	section_name: string;
	form: (props: FormProps) => JSXElement;
	list?: Resource<T[]>;
	fallback?: JSXElement;
	open?: boolean;
}

function SectionHeader<T>(props: SectionHeaderProps<T>) {
	const lang = useLang();
	const [creating_new, create_new] = createSignal(props.open ?? false);
	createEffect(() => {
		if (props.list && props.list()?.length === 0) {
			create_new(true);
		}
	});
	return (
		<div class="flex flex-col gap-2">
			<SectionTitle
				add={() => {
					create_new(true);
				}}
			>
				<Show
					when={lang.current() === "fr"}
					fallback={props.en_section_title}
				>
					{props.fr_section_title}
				</Show>
			</SectionTitle>
			<Show
				when={props.open || (props.list && props.list()?.length === 0)}
			>
				{props.fallback}
			</Show>
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
