import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import LogoIcon from "@assets/icons/logo.svg?component-solid";
import { api } from "@utils/api";

function Header() {
	const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");

	return (
		<header class="w-full flex md:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest flex flex-row gap-2 items-center">
					<LogoIcon />
					<span>
						PORTR
						<span class="alice-regular text-forest-900">AI</span>
					</span>
				</h1>
			</A>
			<div class="md:w-fit w-full text-sm md:text-xl flex flex-row md:gap-16 md:justify-center justify-between items-center">
				<A
					href="/blogs"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h1>Blog</h1>
				</A>
				<A
					href="/pricing"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h1>Pricing</h1>
				</A>
				<Show when={!is_authenticated}>
					<A
						href="/signin"
						class="tracking-widest"
						activeClass="text-forest-600"
					>
						<h1>Sign In</h1>
					</A>
				</Show>
				<Show
					when={is_authenticated}
					fallback={
						<A
							href="/pricing"
							class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
							activeClass="text-forest-600"
						>
							<h1 class="text-nowrap">Get Started</h1>
						</A>
					}
				>
					<A
						href="/account"
						class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
						activeClass="text-forest-600"
					>
						<h1 class="text-nowrap">My account</h1>
					</A>
				</Show>
			</div>
		</header>
	);
}

export default Header;
