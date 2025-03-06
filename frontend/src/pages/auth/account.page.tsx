import Header from "@components/header.autherized";
import { getProfile, updateProfile, uploadAvatar } from "@utils/profile";
import { Component, For, Show, createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import AccountIcon from "@assets/icons/account.svg?component-solid";
import AvatarIcon from "@assets/icons/avatar.svg?component-solid";
import PlanIcon from "@assets/icons/plan.svg?component-solid";
import DangerIcon from "@assets/icons/danger.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import { createStore } from "solid-js/store";
import { AccountSection } from "./account.section";
import { AvatarSection } from "./avatar.section";
import { PlanSection } from "./plan.section";
import { DangerZone } from "./danger.section";

interface AccountPageProps {}

function Account(props: AccountPageProps) {
	const [active_section, set_active_section] = createSignal("account");

	return (
		<main class="md:px-48 px-8 py-4 mx-auto flex flex-col gap-4 h-screen max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-4 justify-start h-full overflow-y-auto items-start text-forest-900">
				<section class="w-full grid grid-cols-2 gap-4">
					<AccountSection />
					<section class="flex flex-col gap-4">
						<AvatarSection />
						<PlanSection plan={{ type: "paid", features: [] }} />
					</section>
				</section>

				<DangerZone />
			</section>
		</main>
	);
}

export default Account;
