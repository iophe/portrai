import Header from "@components/header.autherized";
import { Component, For, Show, createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import AccountIcon from "@assets/icons/account.svg?component-solid";
import AvatarIcon from "@assets/icons/avatar.svg?component-solid";
import PlanIcon from "@assets/icons/plan.svg?component-solid";
import DangerIcon from "@assets/icons/danger.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import { createStore } from "solid-js/store";
import { AccountSection } from "@components/account.section";
import { AvatarSection } from "@components/avatar.section";
import { PlanSection } from "@components/plan.section";
import Footer from "@components/footer.default";
import { DangerZone } from "@components/danger.section";

interface AccountPageProps {}

function Account(props: AccountPageProps) {
	const [active_section, set_active_section] = createSignal("account");

	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 lg:h-screen lg:max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-4 justify-start h-full overflow-y-auto items-start text-forest-900">
				<section class="w-full lg:grid lg:grid-cols-2 flex flex-col gap-4">
					<AccountSection />
					<section class="flex flex-col gap-4">
						<AvatarSection />
						<PlanSection />
					</section>
				</section>

				<DangerZone />
			</section>
			<Footer />
		</main>
	);
}

export default Account;
