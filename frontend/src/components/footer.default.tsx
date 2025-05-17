import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "@utils/api";
import { En, Fr, Lang, useLang } from "./language";
import LangFrIcon from "@assets/icons/lang_fr.svg?component-solid";
import LangEnIcon from "@assets/icons/lang_en.svg?component-solid";

function Footer() {
	const lang = useLang();
	return (
		<footer class="w-full flex flex-row gap-4 lg:px-16 px-4 justify-between items-center bg-lapis-10">
			<A href="/about-us" class="tracking-widest text-forest-900">
				<h2>
					<Lang>
						<En>About us</En>
						<Fr>À propos</Fr>
					</Lang>
				</h2>
			</A>
			<A href="/support" class="tracking-widest text-forest-900">
				<h2>
					<Lang>
						<En>Support</En>
						<Fr>Assistance</Fr>
					</Lang>
				</h2>
			</A>

			<A
				href="/pricing"
				class="tracking-widest text-forest-900"
				activeClass="text-forest-600"
			>
				<Lang>
					<En>Pricing</En>
					<Fr>Prix</Fr>
				</Lang>
			</A>
			<div class="flex flex-row items-center gap-2">
				<button
					onclick={() => lang.update("fr")}
					disabled={lang.current() === "fr"}
				>
					<LangFrIcon
						class="min-w-fit "
						classList={{
							"fill-forest-400": lang.current() === "fr",
							"fill-forest-900": lang.current() !== "fr",
						}}
					/>
				</button>
				/
				<button
					onclick={() => lang.update("en")}
					disabled={lang.current() === "en"}
				>
					<LangEnIcon
						class="min-w-fit "
						classList={{
							"fill-forest-400": lang.current() === "en",
							"fill-forest-900": lang.current() !== "en",
						}}
					/>
				</button>
			</div>
		</footer>
	);
}

export default Footer;
