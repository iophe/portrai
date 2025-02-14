import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "@utils/api";

const Header: Component = () => {
	return (
		<header class="flex md:flex-row flex-col gap-4 justify-between items-center">
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
				<A
					href="/pricing"
					class="tracking-widest"
					activeClass="text-night-600"
				>
					<h2>Pricing</h2>
				</A>
				<A
					href="/signin"
					class="tracking-widest bg-night-800 text-snow-100 py-2 px-4 rounded"
					activeClass="text-night-600"
				>
					<h2 class="text-nowrap">Get Started</h2>
				</A>
			</div>
		</header>
	);
};

export default Header;
