import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { SkillForm, SkillView } from "./skill.view";
import { Ordered } from "../ordered.util";

interface SkillListProps {}

export function SkillList(props: SkillListProps) {
	const fault = useFault();

	const [skills, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get("/resume/skill/all");
			const result: SkillsResponse = response.data as SkillsResponse;

			// Sort skills by priority
			return result.skills.sort((a, b) => b.priority - a.priority);
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

	// Group skills by type
	const groupedSkills = () => {
		const skillsData = skills() || [];
		return skillsData.reduce(
			(groups, skill) => {
				const type = skill.optional_skill_type || "Other";
				if (!groups[type]) {
					groups[type] = [];
				}
				groups[type].push(skill);
				return groups;
			},
			{} as Record<string, Skill[]>
		);
	};

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<span class="flex flex-row gap-4">
				<h2 class="text-2xl font-semibold text-gray-900">
					Skills & Expertise
				</h2>
				<button
					onClick={() => createNew(true)}
					class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
				>
					Add Skill
				</button>
			</span>
			<Show when={creating_new()}>
				<SkillForm
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
			<Suspense fallback={<p class="text-gray-500">Loading skills...</p>}>
				<For each={Object.entries(groupedSkills())}>
					{([type, typeSkills]) => (
						<div class="w-full">
							<h3 class="text-xl font-medium text-gray-800 mb-3">
								{type}
							</h3>
							<div class="grid grid-cols-1 gap-4">
								<For each={typeSkills}>
									{(skill) => (
										<Ordered
											set_dragged_id={set_dragged_id}
											dragged_id={dragged_id}
											draggable={(id) =>
												editing_skills.includes(id)
											}
											id={skill.skill_id}
											getId={(e: Skill) => e.skill_id}
											list={skills}
											onSubmit={async (
												new_list,
												source_id,
												target_id
											) => {
												mutate(new_list);
												try {
													await api.post(
														"/resume/skill/reorder",
														{
															skill_id: source_id,
															after_id: target_id,
														}
													);
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
										>
											<Show
												when={editing_skills.includes(
													skill.skill_id
												)}
												fallback={
													<SkillView
														skill={skill}
														edit={(skill_id) => {
															updateEditingSkills(
																[
																	...editing_skills,
																	skill_id,
																]
															);
														}}
														delete={async (
															skill_id
														) => {
															try {
																await api.post(
																	"/resume/skill/delete",
																	{ skill_id }
																);
																refetch();
															} catch (error) {
																fault.minor({
																	message:
																		(
																			(
																				error as AxiosError
																			)
																				.response
																				?.data as any
																		)
																			.error ??
																		(
																			error as AxiosError
																		)
																			.message,
																});
															}
														}}
													/>
												}
											>
												<SkillForm
													skill={skill}
													onCancel={() => {
														updateEditingSkills(
															editing_skills.filter(
																(id) =>
																	id !==
																	skill.skill_id
															)
														);
													}}
													onSubmit={() => {
														refetch();
														updateEditingSkills(
															editing_skills.filter(
																(id) =>
																	id !==
																	skill.skill_id
															)
														);
													}}
												/>
											</Show>
										</Ordered>
									)}
								</For>
							</div>
						</div>
					)}
				</For>
			</Suspense>
		</section>
	);
}
