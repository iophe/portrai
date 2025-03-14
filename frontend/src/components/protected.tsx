import { useNavigate } from "@solidjs/router";
import { api } from "@utils/api";
import { db } from "@utils/db/db";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import { Component, createResource, JSXElement, onMount, Show } from "solid-js";

interface ProtectedProps {
	fallback?: Component;
	redirect?: string;
	children?: JSXElement;
}

function Protected(props: ProtectedProps) {
	const navigate = useNavigate();

	onMount(() => {
		if (!localStorage.getItem("IS_AUTHENTICATED")) {
			if (props.redirect) {
				queueMicrotask(() => {
					navigate(props.redirect ?? "/", { replace: true });
				});
				return;
			}
		}
	});

	const [is_authenticated] = createResource(async () => {
		try {
			await api.get("/auth/check");
			localStorage.setItem("IS_AUTHENTICATED", "true");
			return true;
		} catch (err) {
			if (props.redirect) {
				navigate(props.redirect ?? "/", { replace: true });
			}
			localStorage.clear();
			await DB_JOB_SPECIFIC_RESUMES.clear(db);
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
