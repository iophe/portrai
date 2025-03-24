import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { ExperienceForm, ExperienceView } from "./experience.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";
import { createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";

interface ExperienceListProps {
	onOrder?: (experienceIds: number[]) => void;
}

export function ExperienceList(props: ExperienceListProps) {
	const fault = useFault();
	const navigate = useNavigate();

	const [experiences, { mutate, refetch }] = createCachedResource(
		async () => {
			try {
				const response = await api.get(
					"/resume/items/by-type?item_type=experience"
				);
				const result = response.data.items as ResumeItem[];

				const experienceItems: Experience[] = result.map(
					(item) =>
						({
							experience_id: item.item_id,
							job_title: item.title,
							company_name: item.subtitle,
							location: item.location,
							start_date: item.start_date,
							optional_end_date: item.end_date,
							is_current: item.is_current,
							description: item.description,
							priority: item.priority,
							is_visible: item.is_visible,
							tags: item.tags,
							notes: item.notes,
						}) as Experience
				);

				return experienceItems;
			} catch (error) {
				if ((error as AxiosError).status === 402) {
					navigate("/pricing");
				}
				if (
					(error as AxiosError).status !== 401 &&
					(error as AxiosError).status !== 402
				)
					fault.minor({
						message:
							((error as AxiosError).response?.data as any)
								.error ?? (error as AxiosError).message,
					});
				return [];
			}
		},
		{
			cache_key:
				"ExperienceList:/resume/items/by-type?item_type=experience",
		}
	);

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
						delete={() => {
							props.cancel();
						}}
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
								getId={(e) => e.experience_id}
								list={experiences}
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
												item_type: "experience", // Specify the item type
											}
										);
									} catch (error) {
										if (
											(error as AxiosError).status === 402
										) {
											navigate("/pricing");
										}
										if (
											(error as AxiosError).status !== 401
										)
											fault.minor({
												message:
													(
														(error as AxiosError)
															.response
															?.data as any
													).error ??
													(error as AxiosError)
														.message,
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
													"/resume/items/delete",
													{
														item_id:
															experience.experience_id,
														item_type: "experience", // Specify the item type
													}
												);
												refetch();
											} catch (error) {
												if (
													(error as AxiosError)
														.status === 402
												) {
													navigate("/pricing");
												}
												if (
													(error as AxiosError)
														.status !== 401
												)
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

interface OfflineExperienceListProps {
	experiences: Experience[];
	add: (experience: Experience) => void;
	update: (experience: Experience) => void;
	delete: (id: number) => void;
	toggle_visibility: (id: number) => void;
	reorder: (new_list: Experience[]) => void;
}

export function OfflineExperienceList(props: OfflineExperienceListProps) {
	const fault = useFault();

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
				form={(p) => (
					<ExperienceForm
						delete={() => {}}
						onCancel={() => {
							p.cancel();
						}}
						onSubmit={(id, exp) => {
							p.submit();
							props.add(exp);
						}}
						is_new
						offline
					/>
				)}
			/>
			<Suspense fallback={<LoadingSpinner />}>
				<For each={props.experiences}>
					{(experience) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_experiences.includes(id)
								}
								id={experience.experience_id}
								getId={(e) => e.experience_id}
								list={() => props.experiences}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									props.reorder(new_list);
								}}
							>
								<Show
									when={editing_experiences.includes(
										experience.experience_id
									)}
									fallback={
										<ExperienceView
											refetch={() => {}}
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
											toggle_visibility={
												props.toggle_visibility
											}
											offline
										/>
									}
								>
									<ExperienceForm
										experience={experience}
										delete={(id) => {
											props.delete(id);
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
										onSubmit={(id, exp) => {
											props.update(exp);
											updateEditingExperiences(
												editing_experiences.filter(
													(id) =>
														id !==
														experience.experience_id
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
