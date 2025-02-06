import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { ExperienceForm, ExperienceView } from "./experience.view";
import { Ordered } from "../ordered.util";

interface ExperienceListProps {
	onOrder?: (experienceIds: number[]) => void;
}

export function ExperienceList(props: ExperienceListProps) {
	const fault = useFault();

	const [experiences, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get("/resume/experience/all");
			const result: ExperiencesResponse =
				response.data as ExperiencesResponse;
			return result.experiences;
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return [];
		}
	});

	const [editing_experiences, updateEditingExperiences] = createStore(
		[] as number[]
	);
	const [creating_new, createNew] = createSignal(false);
	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<span class="flex flex-row gap-4">
				<h2 class="text-2xl font-semibold text-gray-900">
					Professional Experiences
				</h2>
				<button
					onClick={() => createNew(true)}
					class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
				>
					Add Experience
				</button>
			</span>
			<Show when={creating_new()}>
				<ExperienceForm
					onCancel={() => {
						createNew(false);
					}}
					onSubmit={() => {
						refetch();
						createNew(false);
					}}
					is_new
				/>
			</Show>
			<Suspense
				fallback={<p class="text-gray-500">Loading experiences...</p>}
			>
				<For each={experiences()}>
					{(experience) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_experiences.includes(id)
								}
								id={experience.experience_id}
								getId={(e: Experience) => e.experience_id}
								list={experiences}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									mutate(new_list);
									try {
										await api.post(
											"/resume/experience/reorder",
											{
												experience_id: source_id,
												after_id: target_id,
											}
										);
									} catch (error) {
										fault.minor({
											message:
												(
													(error as AxiosError)
														.response?.data as any
												).error ??
												(error as AxiosError).message,
										});
									}
								}}
							>
								<Show
									when={editing_experiences.includes(
										experience.experience_id
									)}
									fallback={
										<ExperienceView
											experience={experience}
											edit={(experience_id) => {
												updateEditingExperiences([
													...editing_experiences,
													experience_id,
												]);
											}}
											delete={async (experience_id) => {
												try {
													await api.post(
														"/resume/experience/delete",
														{
															experience_id,
														}
													);
													refetch();
												} catch (error) {
													fault.minor({
														message:
															(
																(
																	error as AxiosError
																).response
																	?.data as any
															).error ??
															(
																error as AxiosError
															).message,
													});
												}
											}}
										/>
									}
								>
									<ExperienceForm
										experience={experience}
										onCancel={() => {
											updateEditingExperiences(
												editing_experiences.filter(
													(id) =>
														id !==
														experience.experience_id
												)
											);
										}}
										onSubmit={() => {
											refetch();
											updateEditingExperiences(
												editing_experiences.filter(
													(id) =>
														id !==
														experience.experience_id
												)
											);
										}}
									/>
								</Show>
							</Ordered>
						);
					}}
				</For>
			</Suspense>
		</section>
	);
}
