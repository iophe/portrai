import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { createSignal, Show } from "solid-js";
import ExperienceList from "./ExperienceList";
import ExperienceForm from "./ExperienceForm";
import { AxiosError } from "axios";

interface ExperienceManagerProps {
	onClose: () => void;
}

function ExperienceManager(props: ExperienceManagerProps) {
	const fault = useFault();
	const [editing_experience, setEditingExperience] =
		createSignal<Experience | null>(null);
	const [show_form, setShowForm] = createSignal(false);

	async function handleCreate(data: Omit<Experience, "experience_id">) {
		try {
			await api.post("/resume/experience/create", data);
			setShowForm(false);
		} catch (error) {
			fault.minor({
				message: ((error as AxiosError).response?.data as any).error ?? (error as AxiosError).message,
			});
		}
	}

	async function handleUpdate(data: Omit<Experience, "experience_id">) {
		try {
			const experience = editing_experience();
			if (!experience) return;

			await api.post("/resume/experience/update", {
				...data,
				experience_id: experience.experience_id,
			});

			setEditingExperience(null);
			setShowForm(false);
		} catch (error) {
			fault.minor({
				message: ((error as AxiosError).response?.data as any).error ?? (error as AxiosError).message,
			});
		}
	}

	async function handleDelete(id: number) {
		try {
			await api.post("/resume/experience/delete", { experience_id: id });
		} catch (error) {
			fault.minor({
				message: ((error as AxiosError).response?.data as any).error ?? (error as AxiosError).message,
			});
		}
	}

	return (
		<main class="p-4 max-w-4xl mx-auto">
			<header class="flex justify-between items-center mb-6">
				<h1 class="text-3xl font-bold text-gray-900">
					Experience Manager
				</h1>
				<div class="flex gap-4">
					<button
						onClick={() => setShowForm(true)}
						class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
					>
						Add Experience
					</button>
					<button
						onClick={props.onClose}
						class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
					>
						Close
					</button>
				</div>
			</header>

			<Show
				when={show_form()}
				fallback={
					<ExperienceList
						onEdit={(exp) => {
							setEditingExperience(exp);
							setShowForm(true);
						}}
						onDelete={handleDelete}
					/>
				}
			>
				<ExperienceForm
					experience={editing_experience()!}
					onSubmit={(data) =>
						editing_experience()
							? handleUpdate(data)
							: handleCreate(data)
					}
					onCancel={() => {
						setShowForm(false);
						setEditingExperience(null);
					}}
				/>
			</Show>
		</main>
	);
}

export default ExperienceManager;
