import { children, JSXElement } from "solid-js";
import { Motion } from "solid-motionone";

interface FormArticleProps {
	children?: JSXElement;
	on_submit: () => void;
}

function FormArticle(props: FormArticleProps) {
	return (
		<Motion
			initial={{ opacity: 0, scale: 0.97 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3, easing: "ease-out" }}
		>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					props.on_submit();
				}}
				class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-2 relative overflow-hidden"
			>
				<Motion
					initial={{ x: "-100%" }}
					animate={{ x: "0%" }}
					transition={{ duration: 0.4, easing: "ease-out" }}
					style={{
						position: "absolute",
						top: "0",
						left: "0",
						width: "4px",
						height: "100%",
						"background-color": "var(--lapis-200)",
					}}
				></Motion>
				{props.children}
			</form>
		</Motion>
	);
}

export default FormArticle;
