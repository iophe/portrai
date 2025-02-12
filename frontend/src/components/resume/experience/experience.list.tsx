import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { ExperienceForm, ExperienceView } from "./experience.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";

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
	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Professional Experiences"
				section_name="experience"
				form={(props) => (
					<ExperienceForm
						delete={() => {}}
						onCancel={() => {
							props.cancel();
						}}
						onSubmit={() => {
							props.submit();
							refetch();
						}}
						is_new
					/>
				)}
			/>
			<Suspense fallback={<LoadingSpinner />}>
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
											refetch={() => refetch()}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_experiences.includes(id)
											}
											experience={experience}
											edit={(experience_id) => {
												updateEditingExperiences([
													...editing_experiences,
													experience_id,
												]);
											}}
										/>
									}
								>
									<ExperienceForm
										experience={experience}
										delete={async () => {
											try {
												await api.post(
													"/resume/experience/delete",
													{
														experience_id:
															experience.experience_id,
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
														(error as AxiosError)
															.message,
												});
											}
										}}
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
