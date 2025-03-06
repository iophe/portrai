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
			const response = await api.get(
				"/resume/items/by-type?item_type=education"
			);
			const result = response.data.items as ResumeItem[];

			const educationItems = result.map((item) => ({
				education_id: item.item_id,
				degree: item.title,
				school: item.subtitle,
				location: item.location,
				start_date: item.start_date,
				optional_end_date: item.end_date,
				is_current: item.is_current,
				description: item.description,
				priority: item.priority,
				is_visible: item.is_visible,
				tags: item.tags,
				notes: item.notes,
			}));

			return educationItems as Education[];
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
								getId={(e) => e.education_id}
								list={educations}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									mutate(new_list);
									try {
										await api.post(
											"/resume/items/reorder",
											{
												item_id: source_id,
												after_id: target_id,
												item_type: "education", // Specify the item type
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
													"/resume/items/delete",
													{
														item_id:
															education.education_id,
														item_type: "education", // Specify the item type
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

interface OfflineEducationListProps {
	educations: Education[];
	add: (education: Education) => void;
	update: (education: Education) => void;
	delete: (id: number) => void;
	reorder: (new_list: Education[]) => void;
	toggle_visibility: (id: number) => void;
}

export function OfflineEducationList(props: OfflineEducationListProps) {
	const fault = useFault();

	const [editing_educations, updateEditingEducations] = createStore(
		[] as number[]
	);

	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Educations"
				section_name="education"
				form={(p) => (
					<EducationForm
						delete={() => {}}
						onCancel={() => {
							p.cancel();
						}}
						onSubmit={(id, v) => {
							p.submit();
							props.add(v);
						}}
						is_new
						offline
					/>
				)}
			/>

			<Suspense fallback={<LoadingSpinner />}>
				<For each={props.educations}>
					{(education) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_educations.includes(id)
								}
								id={education.education_id}
								getId={(e) => e.education_id}
								list={() => props.educations}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									props.reorder(new_list);
								}}
							>
								<Show
									when={editing_educations.includes(
										education.education_id
									)}
									fallback={
										<EducationView
											refetch={() => {}}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_educations.includes(id)
											}
											education={education}
											toggle_visibility={
												props.toggle_visibility
											}
											edit={(education_id) => {
												updateEditingEducations([
													...editing_educations,
													education_id,
												]);
											}}
											offline
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
										delete={(id) => {
											props.delete(id);
										}}
										onSubmit={(id, v) => {
											props.update(v);
											updateEditingEducations(
												editing_educations.filter(
													(id) =>
														id !==
														education.education_id
												)
											);
										}}
										offline
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
