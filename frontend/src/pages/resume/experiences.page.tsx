import ExperienceManager from "@components/experiences/ExperienceManager";
import { useFault } from "@components/fault";
import Header from "@components/header.default";
import { api } from "@utils/api";
import { createSignal } from "solid-js";

interface ExperiencesProps {}

function Experiences(props: ExperiencesProps) {
	return (
		<main class="p-4 flex flex-col gap-4 bg-gray-50 min-h-screen">
			<Header />
			<ExperienceManager
				onClose={() => {
					/* handle close if needed */
				}}
			/>
		</main>
	);
}

export default Experiences;
