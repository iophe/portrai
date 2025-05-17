import { createSignal, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { AxiosError } from "axios";

import Header from "@components/header.autherized";
import Footer from "@components/footer.default";
import LoadingSpinner from "@components/loading.spinner";
import { En, Fr, Lang } from "@components/language";

// Types
interface PricingProps {}

interface PricingPlan {
	id: string;
	title: {
		eng: string;
		fr: string;
	};
	price: number;
	duration: {
		eng: string;
		fr: string;
	};
	features: {
		eng: string;
		fr: string;
	}[];
	envKey: string;
	action: {
		eng: string;
		fr: string;
	};
}
export const PRICING_PLANS: PricingPlan[] = [
	{
		id: "free-trial",
		title: {
			eng: "Starter Plan",
			fr: "Forfait Débutant",
		},
		price: 0,
		duration: {
			eng: "7-day free trial, no credit card required",
			fr: "Essai gratuit de 7 jours, aucune carte de crédit requise",
		},
		features: [
			{
				eng: "Create 10 AI-optimized professional resumes",
				fr: "Créez 10 CV professionnels optimisés par l'IA",
			},
			{
				eng: "Generate 10 tailored cover letters",
				fr: "Générez 10 lettres de motivation personnalisées",
			},
			{
				eng: "Customize up to 5 versions per resume",
				fr: "Personnalisez jusqu'à 5 versions par CV",
			},
		],
		envKey: import.meta.env.VITE_DEFAULT_PLAN,
		action: {
			eng: "Start Now",
			fr: "Commencer maintenant",
		},
	},
	{
		id: "one-month",
		title: {
			eng: "Career Accelerator",
			fr: "Accélérateur de Carrière",
		},
		price: 9.99,
		duration: {
			eng: "for one month (no subcription)",
			fr: "pour un mois (sans abonnement)",
		},
		features: [
			{
				eng: "Create 50 AI-optimized professional resumes",
				fr: "Créez 50 CV professionnels optimisés par l'IA",
			},
			{
				eng: "Generate 50 tailored cover letters",
				fr: "Générez 50 lettres de motivation personnalisées",
			},
			{
				eng: "Customize up to 10 versions per resume",
				fr: "Personnalisez jusqu'à 10 versions par CV",
			},
		],
		envKey: import.meta.env.VITE_PLAN_1_MONTH,
		action: {
			eng: "Buy Now",
			fr: "Acheter maintenant",
		},
	},
	{
		id: "three-month",
		title: {
			eng: "Career Advantage",
			fr: "Avantage Carrière",
		},
		price: 19.99,
		duration: {
			eng: "for 3 months (best value)",
			fr: "pour 3 mois (meilleur rapport qualité-prix)",
		},
		features: [
			{
				eng: "Create 100 AI-optimized professional resumes",
				fr: "Créez 100 CV professionnels optimisés par l'IA",
			},
			{
				eng: "Generate 100 tailored cover letters",
				fr: "Générez 100 lettres de motivation personnalisées",
			},
			{
				eng: "Unlimited resume versions and customizations",
				fr: "Versions et personnalisations illimitées de CV",
			},
		],
		envKey: import.meta.env.VITE_PLAN_3_MONTH,
		action: {
			eng: "Buy Now",
			fr: "Acheter maintenant",
		},
	},
];

// Pricing card component for DRY code
export function PricingCard(plan: PricingPlan) {
	if (localStorage.getItem("IS_AUTHENTICATED") && plan.id === "free-trial") {
		return;
	}
	const navigate = useNavigate();
	const [loading, setLoading] = createSignal<boolean>(false);
	const [activePlan, setActivePlan] = createSignal<string | null>(null);

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

	const isLoading = () => loading() && activePlan() === plan.envKey;

	return (
		<article class="rounded shadow-lg divide-y divide-gray-200 transition-transform hover:scale-105 hover:shadow-xl">
			<section class="p-6 flex flex-col gap-8">
				<h2 class="text-2xl text-center font-semibold text-forest-900">
					<Lang>
						<En>{plan.title.eng}</En>
						<Fr>{plan.title.fr}</Fr>
					</Lang>
				</h2>
				<p class="text-center">
					{plan.price > 0 && (
						<span class="text-base font-medium text-gray-600 alice-regular">
							<Lang>
								<En>{plan.price < 11 ? "Only " : ""}</En>
								<Fr>{plan.price < 11 ? "Seulement " : ""}</Fr>
							</Lang>
						</span>
					)}
					{plan.price > 0 && (
						<strong class="text-4xl font-extrabold text-forest-700 alice-regular">
							{plan.price.toString().split(".")[0]}
							{plan.price.toString().split(".").length > 1 ? (
								<span class="text-3xl opacity-70">
									.{plan.price.toString().split(".")[1]}
								</span>
							) : (
								""
							)}
							€
						</strong>
					)}
					<span class="text-base font-medium text-gray-600">
						<Lang>
							<En>
								{plan.price > 0
									? " " + plan.duration.eng
									: plan.duration.eng}
							</En>
							<Fr>
								{plan.price > 0
									? " " + plan.duration.fr
									: plan.duration.fr}
							</Fr>
						</Lang>
					</span>
				</p>
				<ul
					class="flex flex-col gap-4"
					role="list"
					aria-label={`{plan.title.eng} features`}
				>
					<For each={plan.features}>
						{(feature) => (
							<li class="flex items-start">
								<span class="text-forest-500 mr-2">•</span>
								<span class="text-base text-gray-800">
									<Lang>
										<En>{feature.eng}</En>
										<Fr>{feature.fr}</Fr>
									</Lang>
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
					aria-label={`Select ${plan.title.eng}`}
				>
					<Show
						when={isLoading()}
						fallback={
							<Lang>
								<En>{plan.action.eng}</En>
								<Fr>{plan.action.fr}</Fr>
							</Lang>
						}
					>
						<LoadingSpinner white />
					</Show>
				</button>
			</section>
		</article>
	);
}

function Pricing(props: PricingProps) {
	return (
		<main class="lg:px-48 px-8 mx-auto justify-items-center p-4 flex flex-col gap-4 lg:h-screen min-h-screen">
			<Header />
			<section class="lg:py-16 py-8 h-full flex flex-col gap-16 items-center">
				<div class="flex flex-col gap-16 items-center">
					{/* Header */}
					<header class="text-center max-w-3xl mx-auto">
						<h1 class="text-3xl font-extrabold text-forest-900 sm:text-4xl">
							<Lang>
								<En>Simple, Transparent Pricing</En>
								<Fr>Tarification simple et transparente</Fr>
							</Lang>
						</h1>
						<p class="mt-4 text-xl text-gray-600">
							<Lang>
								<En>Find your next dream job within weeks</En>
								<Fr>
									Trouvez votre prochain emploi de rêve en
									quelques semaines
								</Fr>
							</Lang>
						</p>
					</header>

					{/* Pricing Cards */}
					<section
						class="flex flex-col lg:flex-row justify-center items-center gap-8 w-full max-w-6xl"
						aria-label="Pricing plans"
					>
						<For each={PRICING_PLANS}>
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
