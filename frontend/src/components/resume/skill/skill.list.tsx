import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { SkillForm, SkillView } from "./skill.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";

interface SkillListProps {}

export function SkillList(props: SkillListProps) {
	const fault = useFault();

	const [skills, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get(
				"/resume/items/by-type?item_type=skill"
			);
			const result = response.data.items as ResumeItem[];

			const skillItems = result.map((item) => ({
				skill_id: item.item_id,
				skill_name: item.title,
				optional_skill_type: item.subtitle,
				optional_skill_level:
					JSON.parse(item.metadata ?? "{}").skill_level || "",
				description: item.description,
				priority: item.priority,
				is_visible: item.is_visible,
				tags: item.tags,
				notes: item.notes,
			}));

			return skillItems as Skill[];
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return [];
		}
	});

	const [editing_skills, updateEditingSkills] = createStore([] as number[]);

	const [creating_new, createNew] = createSignal(false);
	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Skills and Expertise"
				section_name="skill"
				form={(props) => (
					<SkillForm
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
				<For each={skills()}>
					{(skill) => (
						<Ordered
							set_dragged_id={set_dragged_id}
							dragged_id={dragged_id}
							draggable={(id) => editing_skills.includes(id)}
							id={skill.skill_id}
							getId={(e) => e.skill_id}
							list={skills}
							onSubmit={async (
								new_list,
								source_id,
								target_id
							) => {
								mutate(new_list);
								try {
									await api.post("/resume/items/reorder", {
										item_id: source_id,
										after_id: target_id,
										item_type: "skill", // Specify the item type
									});
								} catch (error) {
									fault.minor({
										message:
											(
												(error as AxiosError).response
													?.data as any
											).error ??
											(error as AxiosError).message,
									});
								}
							}}
						>
							<Show
								when={editing_skills.includes(skill.skill_id)}
								fallback={
									<SkillView
										refetch={() => refetch()}
										set_dragged_id={set_dragged_id}
										draggable={(id) =>
											editing_skills.includes(id)
										}
										skill={skill}
										edit={(skill_id) => {
											updateEditingSkills([
												...editing_skills,
												skill_id,
											]);
										}}
									/>
								}
							>
								<SkillForm
									skill={skill}
									delete={async () => {
										try {
											await api.post(
												"/resume/items/delete",
												{
													item_id: skill.skill_id,
													item_type: "skill", // Specify the item type
												}
											);
											refetch();
										} catch (error) {
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
									onCancel={() => {
										updateEditingSkills(
											editing_skills.filter(
												(id) => id !== skill.skill_id
											)
										);
									}}
									onSubmit={() => {
										refetch();
										updateEditingSkills(
											editing_skills.filter(
												(id) => id !== skill.skill_id
											)
										);
									}}
								/>
							</Show>
						</Ordered>
					)}
				</For>
			</Suspense>
		</section>
	);
}
