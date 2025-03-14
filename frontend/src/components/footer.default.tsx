import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "@utils/api";

function Footer() {
	return (
		<footer class="w-full flex flex-row gap-4 md:px-16 px-4 justify-between items-center bg-lapis-10">
			<A href="/about-us" class="tracking-widest text-forest-900 ">
				<h2>About us</h2>
			</A>
			<A href="/support" class="tracking-widest text-forest-900 ">
				<h2>Support</h2>
			</A>
			<A
				href="/pricing"
				class="tracking-widest  text-forest-900 "
				activeClass="text-forest-600"
			>
				Pricing
			</A>
		</footer>
	);
}

export default Footer;
