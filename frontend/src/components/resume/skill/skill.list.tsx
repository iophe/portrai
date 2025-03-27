import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { SkillForm, SkillView } from "./skill.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import { createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";

interface SkillListProps {}

export function SkillList(props: SkillListProps) {
	const fault = useFault();
	const navigate = useNavigate();

	const [skills, { mutate, refetch }] = createCachedResource(
		async () => {
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
		{ cache_key: "SkillList:/resume/items/by-type?item_type=skill" }
	);

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
				list={skills}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>Add some of your skills in your resume</p>{" "}
					</span>
				}
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
									if ((error as AxiosError).status === 402) {
										navigate("/pricing");
									}
									if (
										(error as AxiosError).status !== 401 &&
										(error as AxiosError).status !== 402
									)
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
											if (
												(error as AxiosError).status ===
												402
											) {
												navigate("/pricing");
											}
											if (
												(error as AxiosError).status !==
												401
											)
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

interface OfflineSkillListProps {
	skills: Skill[];
	add: (skill: Skill) => void;
	update: (skill: Skill) => void;
	delete: (id: number) => void;
	reorder: (new_list: Skill[]) => void;
	toggle_visibility: (id: number) => void;
}

export function OfflineSkillList(props: OfflineSkillListProps) {
	const fault = useFault();

	const [editing_skills, updateEditingSkills] = createStore([] as number[]);

	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Skills and Expertise"
				section_name="skill"
				form={(p) => (
					<SkillForm
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
				open={props.skills.length === 0}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>Add some of your skills in this resume</p>{" "}
					</span>
				}
			/>
			<Suspense fallback={<LoadingSpinner />}>
				<For each={props.skills}>
					{(skill) => (
						<Ordered
							set_dragged_id={set_dragged_id}
							dragged_id={dragged_id}
							draggable={(id) => editing_skills.includes(id)}
							id={skill.skill_id}
							getId={(e) => e.skill_id}
							list={() => props.skills}
							onSubmit={async (
								new_list,
								source_id,
								target_id
							) => {
								props.reorder(new_list);
							}}
						>
							<Show
								when={editing_skills.includes(skill.skill_id)}
								fallback={
									<SkillView
										refetch={() => {}}
										set_dragged_id={set_dragged_id}
										draggable={(id) =>
											editing_skills.includes(id)
										}
										skill={skill}
										toggle_visibility={
											props.toggle_visibility
										}
										edit={(skill_id) => {
											updateEditingSkills([
												...editing_skills,
												skill_id,
											]);
										}}
										offline
									/>
								}
							>
								<SkillForm
									skill={skill}
									delete={(id) => {
										props.delete(id);
									}}
									onCancel={() => {
										updateEditingSkills(
											editing_skills.filter(
												(id) => id !== skill.skill_id
											)
										);
									}}
									onSubmit={(id, v) => {
										props.update(v);
										updateEditingSkills(
											editing_skills.filter(
												(id) => id !== skill.skill_id
											)
										);
									}}
									offline
								/>
							</Show>
						</Ordered>
					)}
				</For>
			</Suspense>
		</section>
	);
}
