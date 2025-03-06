import { A } from "@solidjs/router";
import { Show } from "solid-js";
import HomeIcon from "@assets/icons/home.svg?component-solid";
import { api } from "@utils/api";

interface HeaderProps {}

function Header(props: HeaderProps) {
	return (
		<header class="flex flex-row justify-between">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-night-900">AI</span>
				</h1>
			</A>
			<div class="flex flex-row gap-8 items-center">
				<A
					href="/history"
					class="tracking-widest"
					activeClass="text-night-600"
				>
					<h2>History</h2>
				</A>

			<A
					href="/blog"
					class="tracking-widest"
					activeClass="text-night-600"
				>
					<h2>Templates</h2>
				</A>
				<A
					href="/account"
					class="tracking-widest bg-night-800 text-snow-100 py-2 px-4 rounded"
					activeClass="text-night-600"
				>
					<h2 class="text-nowrap">My Account</h2>
				</A>
			</div>
		</header>
	);
}

export function AccountHeader(props: HeaderProps) {
	return (
		<header class="flex flex-row justify-between">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-night-900">AI</span>
				</h1>
			</A>
			<div class="flex flex-row gap-8 items-center">
				<A
					href="/blog"
					class="tracking-widest"
					activeClass="text-night-600"
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
					class="tracking-widest bg-night-800 text-snow-100 py-2 px-4 rounded"
				>
					<h2 class="text-nowrap">Log out</h2>
				</button>
			</div>
		</header>
	);
}
export default Header;
