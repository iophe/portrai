import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { EducationForm, EducationView } from "./education.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";

interface EducationListProps {}

export function EducationList(props: EducationListProps) {
	const fault = useFault();

	const [educations, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get("/resume/education/all");
			const result: EducationsResponse =
				response.data as EducationsResponse;
			return result.educations;
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return [];
		}
	});

	const [editing_educations, updateEditingEducations] = createStore(
		[] as number[]
	);

	const [creating_new, createNew] = createSignal(false);
	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Educations"
				section_name="education"
				form={(props) => (
					<EducationForm
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
				<For each={educations()}>
					{(education) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_educations.includes(id)
								}
								id={education.education_id}
								getId={(e: Education) => e.education_id}
								list={educations}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									mutate(new_list);
									try {
										await api.post(
											"/resume/education/reorder",
											{
												education_id: source_id,
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
									when={editing_educations.includes(
										education.education_id
									)}
									fallback={
										<EducationView
											refetch={() => refetch()}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_educations.includes(id)
											}
											education={education}
											edit={(education_id) => {
												updateEditingEducations([
													...editing_educations,
													education_id,
												]);
											}}
										/>
									}
								>
									<EducationForm
										education={education}
										onCancel={() => {
											updateEditingEducations(
												editing_educations.filter(
													(id) =>
														id !==
														education.education_id
												)
											);
										}}
										delete={async () => {
											try {
												await api.post(
													"/resume/education/delete",
													{
														education_id:
															education.education_id,
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
										onSubmit={() => {
											refetch();
											updateEditingEducations(
												editing_educations.filter(
													(id) =>
														id !==
														education.education_id
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
