// SuccessPage.jsx
import { createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

const SuccessPage = () => {
	const navigate = useNavigate();

	createEffect(() => {
		// Redirect after 3 seconds
		const timer = setTimeout(() => {
			navigate("/");
		}, 5000);

		// Cleanup timeout if component unmounts
		return () => clearTimeout(timer);
	});

	return (
		<div class="min-h-screen flex items-center justify-center bg-gray-50">
			<div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
				<div class="mb-4 text-green-500">
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
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h2 class="text-2xl font-bold mb-4 text-gray-800">
					Payment Successful!
				</h2>
				<p class="text-gray-600 mb-4">
					You will be redirected to resume builder shortly...
				</p>
				<div class="animate-pulse">
					<div class="h-2 w-24 mx-auto bg-gray-200 rounded"></div>
				</div>
			</div>
		</div>
	);
};

export default SuccessPage;
