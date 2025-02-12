import { createSignal, For, Match, Show, Switch } from "solid-js";
import Header from "../../components/header.default";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { useNavigate } from "@solidjs/router";

interface PricingProps {}

function Pricing(props: PricingProps) {
	const navigate = useNavigate();

	const [billingInterval, setBillingInterval] = createSignal<
		"monthly" | "yearly"
	>("monthly");

	const plans = () => [
		{
			name:
				billingInterval() === "monthly"
					? "Monthly Plan"
					: "Yearly Plan",
			price: billingInterval() === "monthly" ? "10€" : "100€",
			price_id:
				billingInterval() === "monthly"
					? "price_1QlvR609qwIgCJScHRHHQWGR"
					: import.meta.env.STRIPE_YEARLY_PRICE_ID,
			interval: billingInterval() === "monthly" ? "/month" : "/year",
			features: [
				"Full access to all features",
				"Priority support",
				"Regular updates",
				"Cloud storage",
				"Cancel anytime",
			],
			buttonText: "Subscribe Now",
			type: "subscription",
		},
		{
			name: "Lifetime Access",
			price: "150€",
			price_id: import.meta.env.STRIPE_LIFETIME_PRICE_ID,
			interval: "one-time",
			features: [
				"Full access to all features",
				"Priority support",
				"Lifetime updates",
				"Unlimited cloud storage",
				"No recurring payments",
			],
			buttonText: "Buy Now",
			type: "onetime",
			highlight: true,
		},
	];

	const [loading, setLoading] = createSignal<string | null>(null);
	const [error, setError] = createSignal<string | null>(null);

	const handleSubscribe = async (plan_type: string, price_id: string) => {
		try {
			setLoading(plan_type);
			setError(null);

			const response = await api.post(
				"/payment/create-checkout-session",
				{
					price_id: price_id,
				}
			);

			// Redirect to Stripe Checkout
			if (response.data.checkout_url) {
				window.location.href = response.data.checkout_url;
			} else {
				throw new Error("No checkout URL received");
			}
		} catch (err) {
			if ((err as AxiosError).response?.status === 401) {
				navigate("/signin");
			}
		} finally {
			setLoading(null);
		}
	};

	return (
		<main class="p-4 flex flex-col gap-4 bg-gray-50 min-h-screen">
			<Header />
			<section class="flex flex-col gap-4 grow justify-center md:items-center text-night-900">
				<article class="max-w-7xl mx-auto">
					{/* Header */}
					<header class="text-center">
						<h1 class="text-3xl font-extrabold text-night-900 sm:text-4xl">
							Simple, Transparent Pricing
						</h1>
						<p class="mt-4 text-xl text-gray-600">
							Choose the plan that works best for you
						</p>
					</header>

					{/* Billing Interval Toggle */}
					<nav
						class="mt-12 flex justify-center"
						aria-label="Billing frequency"
					>
						<fieldset class="relative bg-gray-100 rounded p-0.5 flex">
							<legend class="sr-only">Billing frequency</legend>
							<For each={["monthly", "yearly"] as const}>
								{(interval) => (
									<button
										onClick={() =>
											setBillingInterval(interval)
										}
										class="

											relative px-6 py-2 rounded-md text-sm font-medium 
											whitespace-nowrap focus:outline-none focus:ring-2 
											focus:ring-gray-500 focus:z-10 transition-all
											"
										classList={{
											"bg-white border-gray-200 shadow-sm":
												billingInterval() === interval,
											"border border-transparent":
												billingInterval() !== interval,
											"ml-0.5": interval === "yearly",
										}}
										aria-pressed={
											billingInterval() === interval
										}
										aria-label={`${interval} billing`}
									>
										<Switch>
											<Match
												when={interval === "monthly"}
											>
												Monthly billing
											</Match>
											<Match when={interval === "yearly"}>
												Yearly billing
											</Match>
										</Switch>
									</button>
								)}
							</For>
						</fieldset>
					</nav>

					{/* Pricing Cards */}
					<section
						class="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto"
						aria-label="Pricing plans"
					>
						<For each={plans()}>
							{(plan) => (
								<article
									class="rounded shadow-lg divide-y divide-gray-200"
									classList={{
										"border-2 border-gray-500":
											plan.highlight,
									}}
								>
									<section class="p-6">
										<h2 class="text-xl font-semibold text-night-900">
											{plan.name}
										</h2>
										<p class="mt-8">
											<strong class="text-4xl font-extrabold text-night-900">
												{plan.price}
											</strong>
											<span class="text-base font-medium text-gray-500">
												{plan.interval}
											</span>
										</p>
										<ul
											class="mt-6 space-y-4"
											role="list"
											aria-label="Plan features"
										>
											<For each={plan.features}>
												{(feature) => (
													<li class="flex space-x-3">
														<span class="text-base text-gray-500">
															{feature}
														</span>
													</li>
												)}
											</For>
										</ul>
										<button
											onClick={() =>
												handleSubscribe(
													plan.type,
													plan.price_id
												)
											}
											class="mt-8 block w-full px-6 py-3 rounded-md text-center font-medium"
											classList={{
												"bg-gray-600 text-white hover:bg-gray-700":
													plan.highlight,
												"bg-gray-50 text-gray-700 hover:bg-gray-100":
													!plan.highlight,
												"opacity-75 cursor-not-allowed":
													loading() !== null,
											}}
											disabled={loading() !== null}
											aria-label={`Select ${plan.name}`}
										>
											<Show
												when={loading() === plan.type}
												fallback={plan.buttonText}
											>
												<span class="inline-flex items-center">
													<svg
														class="animate-spin -ml-1 mr-3 h-5 w-5"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															class="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															stroke-width="4"
														></circle>
														<path
															class="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Processing...
												</span>
											</Show>
										</button>
									</section>
								</article>
							)}
						</For>
					</section>
				</article>
			</section>
		</main>
	);
}

export default Pricing;
