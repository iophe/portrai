import {
	createEffect,
	createResource,
	createSignal,
	For,
	Match,
	Show,
	Switch,
} from "solid-js";
import Header from "../../components/header.default";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { useNavigate } from "@solidjs/router";

interface PricingProps {}

function Pricing(props: PricingProps) {
	const navigate = useNavigate();

	const [loading, setLoading] = createSignal<boolean>(false);

	const handlePayment = async (plan: string) => {
		try {
			setLoading(true);
			navigate(`/signup?payment=${plan}`);
		} catch (err) {
			if ((err as AxiosError).response?.status === 401) {
				navigate("/signup");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section class="md:py-16 py-8 flex flex-col gap-16 items-center">
				{/* Header */}
				<header class="text-center">
					<h1 class="text-3xl font-extrabold text-night-900 sm:text-4xl">
						Simple, Transparent Pricing
					</h1>
					<p class="mt-4 text-xl text-gray-600">
						Find your next dream job within weeks
					</p>
				</header>

				{/* Pricing Cards */}
				<section class="" aria-label="Pricing plans">
					<article class="rounded shadow-lg divide-y divide-gray-200">
						<section class="p-6 flex flex-col gap-8">
							<h2 class="text-2xl text-center font-semibold text-night-900">
								3-Month Access Plan
							</h2>
							<p class="text-center">
								<span class="text-base font-medium text-gray-500">
									Only{" "}
								</span>
								<strong class="text-4xl font-extrabold text-night-900">
									20€
								</strong>
								<span class="text-base font-medium text-gray-500">
									{" "}
									for 3-mounth
								</span>
							</p>
							<ul
								class="flex flex-col gap-8"
								role="list"
								aria-label="Plan features"
							>
								<li class="">
									<span class="text-base text-gray-500">
										- Unlimited resume
									</span>
								</li>
								<li class="">
									<span class="text-base text-gray-500">
										- AI Powered resume tinkering and
										generation
									</span>
								</li>
								<li class="">
									<span class="text-base text-gray-500">
										- AI Powered cover letters
									</span>
								</li>
							</ul>
							<button
								onClick={() => handlePayment("3month")}
								class=" bg-night-600 w-full px-6 py-3 rounded-md text-snow-100 text-center font-medium"
								classList={{
									"opacity-75 cursor-not-allowed": loading(),
								}}
								disabled={loading()}
								aria-label={`Select 3 Month Access`}
							>
								<Show when={loading()} fallback="Buy now">
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
				</section>
			</section>
		</main>
	);
}

export default Pricing;
