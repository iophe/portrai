import { A } from "@solidjs/router";
import { Show } from "solid-js";
import HomeIcon from "@assets/icons/home.svg?component-solid";

interface HeaderProps {}

function Header(props: HeaderProps) {
	return (
		<header class="flex flex-row justify-between">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-night-900">AI</span>
				</h1>
			</A>
			<div></div>
		</header>
	);
}

export default Header;
