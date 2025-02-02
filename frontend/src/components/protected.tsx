import { useNavigate } from "@solidjs/router";
import { api } from "@utils/api";
import { Component, createResource, JSXElement, Show } from "solid-js";

interface ProtectedProps {
	fallback?: Component;
	redirect?: string;
	children?: JSXElement;
}

function Protected(props: ProtectedProps) {
	const navigate = useNavigate();

	if (!localStorage.getItem("IS_AUTHENTICATED")) {
		if (props.redirect) {
			navigate(props.redirect ?? "/", { replace: true });
			return null;
		}
		if (props.fallback) {
			return props.fallback({});
		}
	}
	const [is_authenticated] = createResource(async () => {
		try {
			await api.get("/auth/check");
			return true;
		} catch (err) {
			if (props.redirect) {
				navigate(props.redirect ?? "/", { replace: true });
			}
			localStorage.clear();
		}
		return false;
	});
	return (
		<Show when={is_authenticated()} fallback={props.fallback?.({}) ?? ""}>
			{props.children}
		</Show>
	);
}

type Page<PageProps = {}> = ((props: PageProps) => JSXElement) & {
	preload: () => Promise<{
		default: (props: PageProps) => JSXElement;
	}>;
};

function Wrapper(params: { redirect?: string; fallback?: Component }) {
	if (!params.redirect) {
		return function <Props extends {}>(
			PageComponent: Page<Props>
		): Component<Props> {
			return (props: Props) => (
				<Protected fallback={params.fallback}>
					{PageComponent && <PageComponent {...props} />}
				</Protected>
			);
		};
	} else {
		return function <Props extends {}>(
			PageComponent: Page<Props>
		): Component<Props> {
			return (props: Props) => (
				<Protected redirect={params.redirect}>
					{PageComponent && <PageComponent {...props} />}
				</Protected>
			);
		};
	}
}

export default Wrapper;
