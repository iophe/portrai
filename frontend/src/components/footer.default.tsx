import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "@utils/api";
import { En, Fr, Lang, useLang } from "./language";

function Footer() {
	return (
	  <footer class="w-full flex flex-row gap-4 lg:px-16 px-4 justify-between items-center bg-lapis-10">
		<A href="/about-us" class="tracking-widest text-forest-900">
		  <h2>
			<Lang>
			  {[
				<En>About us</En>,
				<Fr>À propos</Fr>
			  ]}
			</Lang>
		  </h2>
		</A>
		<A href="/support" class="tracking-widest text-forest-900">
		  <h2>
			<Lang>
			  {[
				<En>Support</En>,
				<Fr>Assistance</Fr>
			  ]}
			</Lang>
		  </h2>
		</A>
		<A
		  href="/pricing"
		  class="tracking-widest text-forest-900"
		  activeClass="text-forest-600"
		>
		  <Lang>
			{[
			  <En>Pricing</En>,
			  <Fr>Prix</Fr>
			]}
		  </Lang>
		</A>
	  </footer>
	);
  }

export default Footer;
