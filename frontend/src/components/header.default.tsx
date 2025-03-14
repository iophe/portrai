import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "@utils/api";

function Header() {
	return (
		<header class="w-full flex md:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-forest-900">AI</span>
				</h1>
			</A>
			<div class="md:w-fit w-full flex flex-row md:gap-16 md:justify-center justify-between items-center">
				{/* <A
					href="/blog"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h2>Blog</h2>
				</A> */}
				<A
					href="/pricing"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h2>Pricing</h2>
				</A>
				<A
					href="/signin"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<h2>Sign In</h2>
				</A>
				<A
					href="/pricing"
					class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
					activeClass="text-forest-600"
				>
					<h2 class="text-nowrap">Get Started</h2>
				</A>
			</div>
		</header>
	);
}

export default Header;
