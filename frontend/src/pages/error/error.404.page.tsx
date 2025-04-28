import Footer from "@components/footer.default";
import Header from "@components/header.default";

interface Error404PageProps {}

function Error404(props: Error404PageProps) {
	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 lg:h-screen lg:max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-8 justify-center h-full overflow-y-auto items-center text-forest-900">
				<div class="flex flex-col items-center text-center max-w-2xl">
					<h1 class="text-6xl font-bold mb-2">404</h1>
					<h2 class="text-3xl font-semibold mb-6">Page Not Found</h2>
					<p class="text-lg mb-8">
						The page you are looking for might have been removed,
						had its name changed, or is temporarily unavailable.
					</p>
					<div class="flex flex-col lg:flex-row gap-4">
						<a
							href="/"
							class="px-6 py-3 bg-forest-700 text-white rounded hover:bg-forest-800 smooth-transition"
						>
							Go to Homepage
						</a>
						<button
							onClick={() => history.back()}
							class="px-6 py-3 border border-forest-700 text-forest-700 rounded hover:bg-forest-50 smooth-transition"
						>
							Go Back
						</button>
					</div>
				</div>

				<div class="lg:text-8xl text-4xl opacity-20 select-none">
					¯\_(ツ)_/¯
				</div>
			</section>
			<Footer />
		</main>
	);
}

export default Error404;
