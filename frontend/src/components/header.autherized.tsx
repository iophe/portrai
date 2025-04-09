import { A } from "@solidjs/router";
import { Show } from "solid-js";
import LogoIcon from "@assets/icons/logo.svg?component-solid";
import { api } from "@utils/api";
import DefaultHeader from "@components/header.default";

interface HeaderProps {}

function Header(props: HeaderProps) {
	if (!localStorage.getItem("IS_AUTHENTICATED")) {
		return <DefaultHeader />;
	}
	return (
		<header class="w-full flex md:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest flex flex-row gap-2 items-center">
					<LogoIcon /><span>PORTR<span class="alice-regular text-forest-900">AI</span></span>
				</h1>
			</A>
			<div class="md:w-fit w-full text-sm md:text-xl flex flex-row md:gap-16 md:justify-center justify-between items-center">
				<A
					href="/history"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h1>History</h1>
				</A>

				<A
					href="/my-templates"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h1>Templates</h1>
				</A>
				<A
					href="/blogs"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h1>Blog</h1>
				</A>
				<A
					href="/account"
					class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
					activeClass="text-forest-600"
				>
					<h1 class="text-nowrap">My Account</h1>
				</A>
			</div>
		</header>
	);
}

export function AccountHeader(props: HeaderProps) {
	return (
		<header class="w-full flex md:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-forest-900">AI</span>
				</h1>
			</A>
			<div class="md:w-fit w-full flex flex-row md:gap-16 md:justify-center justify-between items-center">
				<A
					href="/blog"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h2>Blog</h2>
				</A>
				<button
					onclick={async (e) => {
						try {
							await api.post("/auth/logout");
							localStorage.clear();
							window.location.reload();
						} catch (error) {
							console.error(error);
						}
					}}
					class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
				>
					<h2 class="text-nowrap">Log out</h2>
				</button>
			</div>
		</header>
	);
}
export default Header;
