import { A } from "@solidjs/router";
import { Show } from "solid-js";
import HomeIcon from "@assets/icons/home.svg?component-solid";

interface HeaderProps {
	with_home?: boolean;
}

function Header(props: HeaderProps) {
	return (
		<header
			class="
            /fixed /top-4 
            /md:right-4
            /right-1/2 /translate-x-1/2 /md:translate-x-0

			md:self-end self-center
            bg-gray-100 rounded shadow-md shadow-gray-300
            w-fit h-fit
            flex flex-row items-center
        "
		>
			<div class="flex flex-row gap-8 items-center py-2 px-4 text-nowrap">
				<A href="/products">Products</A>
				<A href="/pricing">Pricing</A>
			</div>
			<div class="bg-gray-700 w-full md:w-auto px-4 py-2 text-nowrap rounded-r gap-8 text-gray-100 flex flex-row items-center justify-center">
				<Show
					when={props.with_home}
					fallback={<A href="/signin">Sign in</A>}
				>
					<A href="/home">Home</A>
				</Show>
			</div>
		</header>
	);
}

export default Header;
