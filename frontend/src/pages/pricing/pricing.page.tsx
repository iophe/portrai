import { createSignal, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { AxiosError } from "axios";

import Header from "@components/header.autherized";
import Footer from "@components/footer.default";
import LoadingSpinner from "@components/loading.spinner";

// Types
interface PricingProps {}

interface PricingPlan {
	id: string;
	title: string;
	price: number;
	duration: string;
	features: string[];
	envKey: string;
	action: string;
}

function Pricing(props: PricingProps) {
	const navigate = useNavigate();
	const [loading, setLoading] = createSignal<boolean>(false);
	const [activePlan, setActivePlan] = createSignal<string | null>(null);

	// Define pricing plans in one place for better maintainability
	const pricingPlans: PricingPlan[] = [
			{
			id: "free-trial",
			title: "Starter Plan",
			price: 0,
			duration: "7-day free trial, no credit card required",
			features: [
			  "Create 10 AI-optimized professional resumes",
			  "Generate 10 tailored cover letters",
			  "Customize up to 5 versions per resume",
			],
			envKey: import.meta.env.DEFAULT_PLAN,
			action:"Start Now",
		  },
		  {
			id: "one-month",
			title: "Career Accelerator",
			price: 10,
			duration: "for one month (no subcription)",
			features: [
			  "Create 50 AI-optimized professional resumes",
			  "Generate 50 tailored cover letters",
			  "Customize up to 10 versions per resume",
			],
			envKey: import.meta.env.PLAN_1_MONTH,
			action:"Buy Now",
		  },
		  {
			id: "three-month",
			title: "Career Advantage",
			price: 20,
			duration: "for 3 months (best value)",
			features: [
			  "Create 100 AI-optimized professional resumes",
			  "Generate 100 tailored cover letters",
			  "Unlimited resume versions and customizations",
			],
			envKey: import.meta.env.PLAN_3_MONTH,
			action:"Buy Now",
		  }
	];
	
	const handlePayment = async (plan: string) => {
		try {
			setLoading(true);
			setActivePlan(plan);

			const isAuthenticated = localStorage.getItem("IS_AUTHENTICATED");
			const route = isAuthenticated ? "/signin" : "/signup";

			navigate(`${route}?payment=${plan}`);
		} catch (err) {
			if ((err as AxiosError).response?.status === 401) {
				navigate("/signup");
			}
			console.error("Payment error:", err);
		} finally {
			setLoading(false);
			setActivePlan(null);
		}
	};
	
	// Pricing card component for DRY code
	const PricingCard = (plan: PricingPlan) => {
		if (localStorage.getItem("IS_AUTHENTICATED") && plan.id === "free-trial") {
			return
		}
		const isLoading = () => loading() && activePlan() === plan.envKey;

		return (
			<article class="rounded shadow-lg divide-y divide-gray-200 transition-transform hover:scale-105 hover:shadow-xl">
				<section class="p-6 flex flex-col gap-8">
					<h2 class="text-2xl text-center font-semibold text-forest-900">
						{plan.title}
					</h2>
					<p class="text-center">
						{plan.price > 0 && (
							<span class="text-base font-medium text-gray-600">
								{plan.price === 10 ? "Only " : ""}
							</span>
						)}
						{plan.price > 0 && (
							<strong class="text-4xl font-extrabold text-forest-900">
								{plan.price}€
							</strong>
						)}
						<span class="text-base font-medium text-gray-600">
							{plan.price > 0
								? " " + plan.duration
								: plan.duration}
						</span>
					</p>
					<ul
						class="flex flex-col gap-4"
						role="list"
						aria-label={`${plan.title} features`}
					>
						<For each={plan.features}>
							{(feature) => (
								<li class="flex items-start">
									<span class="text-forest-500 mr-2">•</span>
									<span class="text-base text-gray-800">
										{feature}
									</span>
								</li>
							)}
						</For>
					</ul>
					<button
						onClick={() => handlePayment(plan.envKey)}
						class="bg-forest-600 w-full px-6 py-3 rounded-md text-snow-100 text-center font-medium
					 transition-colors hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2"
						classList={{
							"opacity-75 cursor-not-allowed": isLoading(),
						}}
						disabled={isLoading()}
						aria-busy={isLoading()}
						aria-label={`Select ${plan.title}`}
					>
						<Show when={isLoading()} fallback={plan.action}>
							<LoadingSpinner white/>
						</Show>
					</button>
				</section>
			</article>
		);
	};

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 md:h-screen min-h-screen">
			<Header />
			<section class="md:py-16 py-8 h-full flex flex-col gap-16 items-center">
				<div class="flex flex-col gap-16 items-center">
					{/* Header */}
					<header class="text-center max-w-3xl mx-auto">
						<h1 class="text-3xl font-extrabold text-forest-900 sm:text-4xl">
							Simple, Transparent Pricing
						</h1>
						<p class="mt-4 text-xl text-gray-600">
							Find your next dream job within weeks
						</p>
					</header>

					{/* Pricing Cards */}
					<section
						class="flex flex-col md:flex-row justify-center items-center gap-8 w-full max-w-6xl"
						aria-label="Pricing plans"
					>
						<For each={pricingPlans}>
							{(plan) => <PricingCard {...plan} />}
						</For>
					</section>
				</div>
			</section>
			<Footer />
		</main>
	);
}

export default Pricing;
