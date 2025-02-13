// FailPage.jsx
import { createSignal } from "solid-js";

const FailPage = () => {
	const [errorMessage] = createSignal(
		new URLSearchParams(window.location.search).get("error") ||
			"Payment failed"
	);

	const handleRetry = () => {
		window.location.href = "http://localhost:5050/checkout";
	};

	const handleContact = () => {
		window.location.href = "mailto:support@votreapp.com";
	};

	return (
		<div class="min-h-screen flex items-center justify-center bg-gray-50">
			<div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
				<div class="mb-4 text-red-500">
					<svg
						class="mx-auto h-12 w-12"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<h2 class="text-2xl font-bold mb-4 text-gray-800">
					Payment Failed
				</h2>
				<p class="text-gray-600 mb-6">{errorMessage()}</p>

				<div class="space-y-3">
					<button
						onClick={handleRetry}
						class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
						Try Again
					</button>
					<button
						onClick={handleContact}
						class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
					>
						Contact Support
					</button>
				</div>
			</div>
		</div>
	);
};
