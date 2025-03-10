import Footer from "@components/footer.default";
import Header from "@components/header.autherized";

interface TemplatesPage {}

function TemplatesPage(props: TemplatesPage) {
	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 md:h-screen md:max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-4 justify-start h-full overflow-y-auto items-start text-forest-900"></section>
			<Footer />
		</main>
	);
}

export default TemplatesPage;
