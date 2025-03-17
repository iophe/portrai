import Footer from "@components/footer.default";
import Header from "@components/header.default";


interface VerifyPageProps {}

function VerifyPage(props:VerifyPageProps) {
    return (
        <main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 md:h-screen md:max-h-screen">
        <Header />

        <section class="w-full flex flex-col gap-4 justify-start h-full overflow-y-auto items-start text-forest-900">
            Verify account TEST
        </section>
        <Footer />
    </main>
    );
}

export default VerifyPage;