import { api } from "@utils/api";
import Header from "../../components/header.default";
import { useNavigate } from "@solidjs/router";

interface HomeProps {}

function Home(props: HomeProps) {
	const navigate = useNavigate();

	return (
		<main class="p-4 flex flex-col gap-4 bg-gray-50 min-h-screen">
			<section class="flex flex-col gap-4 grow justify-center md:items-center text-gray-900">
				<button
					onclick={async () => {
						try {
							await api.post("/auth/logout");
							localStorage.clear();
							window.location.reload();
						} catch (error) {
							console.error(error);
						}
					}}
				>
					log out
				</button>
				<button
					onclick={async () => {
						try {
							const res = await api.post("/auth/delete");
							console.log(res);

							localStorage.clear();
							window.location.reload();
						} catch (error) {
							console.error(error);
						}
					}}
				>
					delete account
				</button>
			</section>
		</main>
	);
}

export default Home;
