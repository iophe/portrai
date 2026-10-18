import { For, Show, createResource } from "solid-js";
import { A } from "@solidjs/router";
import { Motion, Presence } from "solid-motionone";
import PlanIcon from "@assets/icons/plan.svg?component-solid";
import VerifiedIcon from "@assets/icons/verified.svg?component-solid";
import UnverifiedIcon from "@assets/icons/unverified.svg?component-solid";
import api from "@utils/api";
import { createCachedResource } from "@utils/cache";
import { En, Fr, Lang } from "./language";

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
		<Motion.section
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			class="overflow-hidden w-full bg-white rounded p-6 shadow-sm flex flex-col gap-4"
		>
			<Motion.header
				initial={{ x: -5, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.15 }}
				class="flex flex-row gap-4 border-b-2 border-forest-900 pb-2"
			>
				<PlanIcon class="min-w-fit fill-forest-900" />
				<h2 class="text-sm text-gray-500 uppercase">
					<Lang>
						<En>Your Plan</En>
						<Fr>Votre Abonnement</Fr>
					</Lang>
				</h2>
			</Motion.header>

			<Presence>
				<Show
					when={!status()?.is_valid}
					fallback={
						<Motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25 }}
							class="flex flex-col gap-2"
						>
							<Motion.span
								initial={{ x: -5, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{
									duration: 0.2,
									delay: 0.05,
								}}
								class="flex flex-row items-center gap-4"
							>
								<VerifiedIcon class="min-w-fit fill-forest-500" />
								<p>
									<Lang>
										<En>
											Your account is active, your current
											plan is{" "}
											{status()?.price_description}
										</En>
										<Fr>
											Votre compte est actif, votre
											abonnement actuel est{" "}
											{status()?.price_description}
										</Fr>
									</Lang>
								</p>
							</Motion.span>
							<Motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 0.2,
									delay: 0.1,
								}}
								class="self-center"
							>
								<p>
									<Lang>
										<En>
											since:{" "}
											{new Date(
												status()?.created_at!
											).toDateString()}
										</En>
										<Fr>
											depuis:{" "}
											{new Date(
												status()?.created_at!
											).toDateString()}
										</Fr>
									</Lang>
								</p>
								<p>
									<Lang>
										<En>
											expire on:{" "}
											{new Date(
												status()?.expired_at!
											).toDateString()}
										</En>
										<Fr>
											expire le:{" "}
											{new Date(
												status()?.expired_at!
											).toDateString()}
										</Fr>
									</Lang>
								</p>
							</Motion.div>
						</Motion.div>
					}
				>
					<Motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						class="flex flex-col gap-2"
					>
						<Motion.span
							initial={{ x: -5, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.2, delay: 0.05 }}
							class="flex flex-row items-center gap-4"
						>
							<UnverifiedIcon class="min-w-fit fill-forest-900" />
							<p>
								<Lang>
									<En>Your account is deactivated</En>
									<Fr>Votre compte est désactivé</Fr>
								</Lang>
							</p>
						</Motion.span>
						<Motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.2, delay: 0.1 }}
							class="self-center"
						>
							<Lang>
								<En>to activate your account:</En>
								<Fr>pour activer votre compte:</Fr>
							</Lang>
						</Motion.span>
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
								<Lang>
									<En>buy here</En>
									<Fr>acheter ici</Fr>
								</Lang>
							</A>
						</Motion>
					</Motion.div>
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
							<label>
								<Lang>
									<En>Payment history:</En>
									<Fr>Historique des paiements:</Fr>
								</Lang>
							</label>
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
											class="w-full lg:w-1/2 flex flex-row justify-between"
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
		</Motion.section>
	);
}
