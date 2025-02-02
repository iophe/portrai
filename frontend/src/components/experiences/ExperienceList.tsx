import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, For, Show } from "solid-js";

interface ExperienceListProps {
	onEdit: (experience: Experience) => void;
	onDelete: (id: number) => void;
}

function ExperienceList(props: ExperienceListProps) {
	const fault = useFault();

	const [experiences] = createResource(async () => {
		try {
			const response = await api.get("/resume/experience/all");
			const result: ExperiencesResponse =
				response.data as ExperiencesResponse;
			return result.experiences;
		} catch (error) {
			fault.minor({
				message: ((error as AxiosError).response?.data as any).error ?? (error as AxiosError).message,
			});
			return [];
		}
	});

	return (
		<section class="space-y-4">
			<h2 class="text-2xl font-semibold text-gray-900">
				Work Experience
			</h2>
			<Show
				when={!experiences.loading}
				fallback={<p class="text-gray-500">Loading experiences...</p>}
			>
				<For each={experiences()}>
					{(experience) => (
						<article class="p-4 border border-gray-200 rounded-lg">
							<header class="flex justify-between items-start mb-2">
								<div>
									<h3 class="text-lg font-medium text-gray-900">
										{experience.job_title}
									</h3>
									<p class="text-gray-700">
										{experience.company_name}
									</p>
								</div>
								<div class="flex gap-2">
									<button
										onClick={() => props.onEdit(experience)}
										class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
									>
										Edit
									</button>
									<button
										onClick={() =>
											props.onDelete(
												experience.experience_id
											)
										}
										class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
									>
										Delete
									</button>
								</div>
							</header>
							<p class="text-gray-600 text-sm mb-2">
								{experience.location}
							</p>
							<p class="text-gray-700">
								{experience.description}
							</p>
							<footer class="mt-2">
								<ul class="flex gap-2 flex-wrap">
									<For each={experience.tags}>
										{(tag) => (
											<li class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
												{tag}
											</li>
										)}
									</For>
								</ul>
							</footer>
						</article>
					)}
				</For>
			</Show>
		</section>
	);
}

export default ExperienceList;
