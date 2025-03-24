import { For, Show, createResource } from "solid-js";
import { A } from "@solidjs/router";
import { Motion, Presence } from "solid-motionone";
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
		<Motion
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<section class="overflow-hidden w-full bg-white rounded p-6 shadow-sm flex flex-col gap-4">
				<Motion
					initial={{ x: -5, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.15 }}
				>
					<header class="flex flex-row gap-4 border-b-2 border-forest-900 pb-2">
						<PlanIcon class="fill-forest-900" />
						<h2 class="text-sm text-gray-500 uppercase">
							Your Plan
						</h2>
					</header>
				</Motion>

				<Presence>
					<Show
						when={!status()?.is_valid}
						fallback={
							<Motion
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.25 }}
							>
								<div class="flex flex-col gap-2">
									<Motion
										initial={{ x: -5, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										transition={{
											duration: 0.2,
											delay: 0.05,
										}}
									>
										<span class="flex flex-row items-center gap-4">
											<VerifiedIcon class="fill-forest-500" />
											<p>Your account is active</p>
										</span>
									</Motion>
									<Motion
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{
											duration: 0.2,
											delay: 0.1,
										}}
									>
										<div class="self-center">
											<p>
												since :{" "}
												{new Date(
													status()?.created_at!
												).toDateString()}
											</p>
											<p>
												expire on :{" "}
												{new Date(
													status()?.expired_at!
												).toDateString()}
											</p>
										</div>
									</Motion>
								</div>
							</Motion>
						}
					>
						<Motion
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25 }}
						>
							<div class="flex flex-col gap-2">
								<Motion
									initial={{ x: -5, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ duration: 0.2, delay: 0.05 }}
								>
									<span class="flex flex-row items-center gap-4">
										<UnverifiedIcon class="fill-forest-900" />
										<p>Your account is deactivated</p>
									</span>
								</Motion>
								<Motion
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.2, delay: 0.1 }}
								>
									<span class="self-center">
										to activate your account :{" "}
									</span>
								</Motion>
								<Motion
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.25, delay: 0.15 }}
									hover={{ scale: 1.03 }}
									press={{ scale: 0.97 }}
								>
									<A
										href="/pricing"
										class="self-center w-fit px-4 py-2 bg-forest-300 hover:bg-forest-100 text-snow-100 rounded smooth-transition"
									>
										buy here
									</A>
								</Motion>
							</div>
						</Motion>
					</Show>
				</Presence>

				<Motion
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<section class="overflow-hidden h-fit max-h-32">
						<Show when={history() && (history()?.length ?? 0 > 0)}>
							<fieldset class="overflow-hidden h-full flex flex-col gap-4">
								<label>Payment history :</label>
								<ol class="overflow-y-auto h-full flex flex-col gap-2 items-center">
									<For each={history()}>
										{(payment, index) => (
											<Motion.div
												initial={{
													opacity: 0,
													x: -5,
												}}
												animate={{
													opacity: 1,
													x: 0,
												}}
												transition={{
													duration: 0.15,
													delay: 0.05 * (index() + 1), // Staggered animation
												}}
												class="w-full md:w-1/2 flex flex-row justify-between"
											>
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
											</Motion.div>
										)}
									</For>
								</ol>
							</fieldset>
						</Show>
					</section>
				</Motion>
			</section>
		</Motion>
	);
}
