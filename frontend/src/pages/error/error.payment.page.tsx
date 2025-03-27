import Header from "@components/header.default";
import UnverifiedIcon from "@assets/icons/unverified.svg?component-solid";
import { A } from "@solidjs/router";
import Footer from "@components/footer.default";

interface ErrorPaymentPageProps {}

function ErrorPayment(props: ErrorPaymentPageProps) {
	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 md:h-screen md:max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-8 justify-center h-full overflow-y-auto items-center text-forest-900">
				<div class="flex flex-col items-center text-center max-w-2xl">
					<UnverifiedIcon />
					<h1 class="text-3xl font-bold mb-2">Payment Failed</h1>
					<h2 class="text-xl font-medium mb-6 text-gray-600">
						Your payment could not be processed
					</h2>
					<p class="text-lg mb-4">
						We encountered an issue while processing your payment.
						This could be due to insufficient funds, incorrect card
						information, or a temporary issue with the payment
						provider.
					</p>
					<p class="text-md mb-8 text-gray-700">
						No charges have been made to your account. You can try
						again with a different payment method or contact support
						if you need assistance.
					</p>
					<div class="flex flex-col md:flex-row gap-4">
						<A
							href="/checkout"
							class="px-6 py-3 bg-forest-700 text-white rounded hover:bg-forest-800 smooth-transition"
						>
							Try Again
						</A>
						<A
							href="/support"
							class="px-6 py-3 border border-forest-700 text-forest-700 rounded hover:bg-forest-50 smooth-transition"
						>
							Contact Support
						</A>
						<A
							href="/"
							class="px-6 py-3 text-forest-700 hover:underline smooth-transition"
						>
							Return to Homepage
						</A>
					</div>
				</div>
			</section>
			<Footer />
		</main>
	);
}

export default ErrorPayment;
