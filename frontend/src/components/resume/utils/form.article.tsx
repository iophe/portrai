import { children, JSXElement } from "solid-js";

interface FormArticleProps {
	children?: JSXElement;
	on_submit: () => void;
}

function FormArticle(props: FormArticleProps) {
	return (
		<form
			onsubmit={(e) => {
				e.preventDefault();
				props.on_submit();
			}}
			class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-2"
		>
			{props.children}
		</form>
	);
}

export default FormArticle;
