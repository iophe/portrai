import { Component, Show, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import LogoIcon from "@assets/icons/logo.svg?component-solid";
import { api } from "@utils/api";
import {
	En,
	Fr,
	Lang,
	LangProvider,
	Test,
	useLang,
} from "@components/language";

function Header() {
	const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");

	return (
		<header class="w-full flex lg:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest flex flex-row gap-2 items-center">
					<LogoIcon />
					<span>
						PORTR
						<span class="alice-regular text-forest-900">AI</span>
					</span>
				</h1>
			</A>

			<div class="lg:w-fit w-full text-sm lg:text-xl flex flex-row lg:gap-16 lg:justify-center justify-between items-center">
				<A
					href="/blogs"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>Blog</En>
						<Fr>Blog</Fr>
					</Lang>
				</A>

				<A
					href="/pricing"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>Pricing</En>
						<Fr>Prix</Fr>
					</Lang>
				</A>

				<Show when={!is_authenticated}>
					<A
						href="/signin"
						class="tracking-widest"
						activeClass="text-forest-600"
					>
						<Lang>
							<En>Signin</En>
							<Fr>Se Connecter</Fr>
						</Lang>
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
							<h1 class="text-nowrap">
								<Lang>
									<En>Get Started</En>
									<Fr>Commencer</Fr>
								</Lang>
							</h1>
						</A>
					}
				>
					<A
						href="/account"
						class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
						activeClass="text-forest-600"
					>
						<h1 class="text-nowrap">
							<Lang>
								<En>My account</En>
								<Fr>Mon compte</Fr>
							</Lang>
						</h1>
					</A>
				</Show>
			</div>
		</header>
	);
}

export default Header;
