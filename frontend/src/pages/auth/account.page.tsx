import { AccountHeader } from "@components/header.autherized";

interface AccountPageProps {}

function Account(props: AccountPageProps) {
	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<AccountHeader />
			<section
				class="grid grid-cols-2 gap-4 justify-start h-full overflow-hidden
            items-start text-night-900"
			></section>
		</main>
	);
}

export default Account;
