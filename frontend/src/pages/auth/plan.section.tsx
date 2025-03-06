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

interface UserPlan {
	type: "free" | "paid";
	features: string[];
}

interface PlanSectionProps {
	plan: UserPlan;
}

export function PlanSection(props: PlanSectionProps) {
	return (
		<section class="w-full bg-white rounded p-6 shadow-sm">
			<header class="flex flex-row gap-4 border-b-2 border-forest-900 pb-2">
				<PlanIcon class="fill-forest-900" />
				<h2 class="text-sm text-gray-500 uppercase ">Your Plan</h2>
			</header>
			<article class="flex items-center justify-between pt-4">
				<figure class="flex items-center gap-4">
					<aside class="w-12 h-12 bg-forest-50 rounded flex items-center justify-center">
						<PlanIcon class="fill-forest-900" />
					</aside>
					<figcaption>
						<h3 class="font-medium">Subscription Account</h3>
						<p class="text-sm text-gray-500">
							You are on the 3 month plan. You can save your data
							and search for jobs.
						</p>
					</figcaption>
				</figure>
				<button
					class="text-blue-500 hover:text-blue-600 font-medium"
					onclick={() => {
						// Change plan handler directly in the onclick
						console.log("Changing plan");
						// Plan change logic would go here
					}}
				>
					Change Plan
				</button>
			</article>
		</section>
	);
}
