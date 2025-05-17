import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { EducationForm, EducationView } from "./education.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import { createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/api";
import { En, Fr, Lang } from "@components/language";

interface EducationListProps {
	on_refetch: () => void;
}

export function EducationList(props: EducationListProps) {
	const fault = useFault();
	const navigate = useNavigate();

	const [educations, { mutate, refetch: refetch_items }] =
		createCachedResource(
			async () => {
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
					ProcessMajorError(error, navigate, fault);
					return [];
				}
			},
			{
				cache_key:
					"EducationList:/resume/items/by-type?item_type=education",
			}
		);

	function refetch() {
		refetch_items();
		props.on_refetch();
	}

	const [editing_educations, updateEditingEducations] = createStore(
		[] as number[]
	);

	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				en_section_title="Educations"
				fr_section_title="Éducations"
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
				list={educations}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>
							<Lang>
								<En>
									Add your educational background and
									qualifications in your resume
								</En>
								<Fr>
									Ajoutez votre formation et vos
									qualifications à votre CV
								</Fr>
							</Lang>
							A
						</p>{" "}
					</span>
				}
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
										ProcessMajorError(
											error,
											navigate,
											fault
										);
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
												ProcessMajorError(
													error,
													navigate,
													fault
												);
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
				en_section_title="Educations"
				fr_section_title="Éducations"
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
				open={props.educations.length === 0}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>
							<Lang>
								<En>
									Add some educational background and
									qualifications in this resume
								</En>
								<Fr>
									Ajoutez des formation et des qualifications
									à votre CV
								</Fr>
							</Lang>
						</p>{" "}
					</span>
				}
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
