import { For, Show, createResource } from "solid-js";
import { A } from "@solidjs/router";
import PlanIcon from "@assets/icons/plan.svg?component-solid";
import VerifiedIcon from "@assets/icons/verified.svg?component-solid";
import UnverifiedIcon from "@assets/icons/unverified.svg?component-solid";
import api from "@utils/api";
import { createCachedResource } from "@utils/cache";

interface PlanSectionProps {}

export function PlanSection(props: PlanSectionProps) {
	const [status] = createCachedResource(
		async () => {
			try {
				const res = await api.get("/payment/status");
				const validity_status = res.data
					.validity_status as UserValidityStatus;
				return validity_status;
			} catch (error) {}
		},
		{ cache_key: "PlanSection:/payment/status" }
	);
	const [history] = createCachedResource(
		async () => {
			try {
				const res = await api.get("/payment/history");
				const payment_history = res.data
					.payment_history as UserPaymentHistory[];
				return payment_history;
			} catch (error) {}
		},
		{ cache_key: "PlanSection:/payment/history" }
	);
	return (
		<section class="overflow-hidden w-full bg-white rounded p-6 shadow-sm flex flex-col gap-4">
			<header class="flex flex-row gap-4 border-b-2 border-forest-900 pb-2">
				<PlanIcon class="fill-forest-900" />
				<h2 class="text-sm text-gray-500 uppercase ">Your Plan</h2>
			</header>
			<Show
				when={!status()?.is_valid}
				fallback={
					<div class="flex flex-col gap-2">
						<span class="flex flex-row items-center gap-4">
							<VerifiedIcon class="fill-forest-500" />
							<p>Your account is active</p>
						</span>
						<div class="self-center">
							<p>
								since :{" "}
								{new Date(status()?.created_at!).toDateString()}
							</p>
							<p>
								expire on :{" "}
								{new Date(status()?.expired_at!).toDateString()}
							</p>
						</div>
					</div>
				}
			>
				<div class="flex flex-col gap-2">
					<span class="flex flex-row items-center gap-4">
						<UnverifiedIcon class="fill-forest-900" />
						<p>Your account is deactivated</p>
					</span>
					<span class="self-center">to activate your account : </span>
					<A
						href="/pricing"
						class="self-center w-fit px-4 py-2 bg-forest-300 hover:bg-forest-100 text-snow-100 rounded transition-all duration-100 ease-in-out "
					>
						buy here
					</A>
				</div>
			</Show>
			<section class="overflow-hidden h-fit max-h-32">
				<Show when={history() && (history()?.length ?? 0 > 0)}>
					<fieldset class="overflow-hidden h-full flex flex-col gap-4 ">
						<label>Payment history :</label>
						<ol class="overflow-y-auto h-full flex flex-col gap-2 items-center">
							<For each={history()}>
								{(payment) => {
									return (
										<div class=" w-1/2 flex flex-row justify-between">
											<span>
												{new Date(
													payment.created_at
												).toDateString()}
											</span>{" "}
											<span>
												{Number(
													payment.amount / 100
												).toFixed(2)}{" "}
												{payment.currency}
											</span>
										</div>
									);
								}}
							</For>
						</ol>
					</fieldset>
				</Show>
			</section>
		</section>
	);
}
