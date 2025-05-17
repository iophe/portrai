import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { ProjectForm, ProjectView } from "./project.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import { createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/api";
import { En, Fr, Lang } from "@components/language";

interface ProjectListProps {
	on_refetch: () => void;
}

export function ProjectList(props: ProjectListProps) {
	const fault = useFault();
	const navigate = useNavigate();

	const [projects, { mutate, refetch: refetch_items }] = createCachedResource(
		async () => {
			try {
				const response = await api.get(
					"/resume/items/by-type?item_type=project"
				);
				const result = response.data.items as ResumeItem[];

				const projectItems = result.map((item) => ({
					project_id: item.item_id,
					project_title: item.title,
					optional_project_subtitle: item.subtitle,
					start_date: item.start_date,
					optional_end_date: item.end_date,
					is_current: item.is_current,
					description: item.description,
					priority: item.priority,
					is_visible: item.is_visible,
					tags: item.tags,
					notes: item.notes,
				}));

				return projectItems as Project[];
			} catch (error) {
				ProcessMajorError(error, navigate, fault);
				return [];
			}
		},
		{ cache_key: "ProjectList:/resume/items/by-type?item_type=project" }
	);
	function refetch() {
		refetch_items();
		props.on_refetch();
	}
	const [editing_projects, updateEditingProjects] = createStore(
		[] as number[]
	);

	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				en_section_title="Projects"
				fr_section_title="Projects"
				section_name="project"
				form={(props) => (
					<ProjectForm
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
				list={projects}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>
							<Lang>
								<En>
									Add your personal projects in your resume
								</En>
								<Fr>
									Ajoutez vos projets personnels dans votre CV
								</Fr>
							</Lang>
						</p>{" "}
					</span>
				}
			/>
			<Suspense fallback={<LoadingSpinner />}>
				<For each={projects()}>
					{(project) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_projects.includes(id)
								}
								id={project.project_id}
								getId={(e) => e.project_id}
								list={projects}
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
												item_type: "project", // Specify the item type
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
									when={editing_projects.includes(
										project.project_id
									)}
									fallback={
										<ProjectView
											refetch={() => refetch()}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_projects.includes(id)
											}
											project={project}
											edit={(project_id) => {
												updateEditingProjects([
													...editing_projects,
													project_id,
												]);
											}}
										/>
									}
								>
									<ProjectForm
										project={project}
										delete={async () => {
											try {
												await api.post(
													"/resume/items/delete",
													{
														item_id:
															project.project_id,
														item_type: "project", // Specify the item type
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
										onCancel={() => {
											updateEditingProjects(
												editing_projects.filter(
													(id) =>
														id !==
														project.project_id
												)
											);
										}}
										onSubmit={() => {
											refetch();
											updateEditingProjects(
												editing_projects.filter(
													(id) =>
														id !==
														project.project_id
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

interface OfflineProjectListProps {
	projects: Project[];
	add: (project: Project) => void;
	update: (project: Project) => void;
	delete: (id: number) => void;
	reorder: (new_list: Project[]) => void;
	toggle_visibility: (id: number) => void;
}

export function OfflineProjectList(props: OfflineProjectListProps) {
	const fault = useFault();

	const [editing_projects, updateEditingProjects] = createStore(
		[] as number[]
	);

	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				en_section_title="Projects"
				fr_section_title="Projects"
				section_name="project"
				form={(p) => (
					<ProjectForm
						delete={() => {}}
						onCancel={() => {
							p.cancel();
						}}
						onSubmit={(i, v) => {
							p.submit();
							props.add(v);
						}}
						is_new
						offline
					/>
				)}
				open={props.projects.length === 0}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>
							<Lang>
								<En>
									Add some personal projects in this resume
								</En>
								<Fr>
									Ajoutez des projets personnels dans votre CV
								</Fr>
							</Lang>
						</p>{" "}
					</span>
				}
			/>
			<Suspense fallback={<LoadingSpinner />}>
				<For each={props.projects}>
					{(project) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_projects.includes(id)
								}
								id={project.project_id}
								getId={(e) => e.project_id}
								list={() => props.projects}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									props.reorder(new_list);
								}}
							>
								<Show
									when={editing_projects.includes(
										project.project_id
									)}
									fallback={
										<ProjectView
											refetch={() => {}}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_projects.includes(id)
											}
											project={project}
											toggle_visibility={
												props.toggle_visibility
											}
											edit={(project_id) => {
												updateEditingProjects([
													...editing_projects,
													project_id,
												]);
											}}
											offline
										/>
									}
								>
									<ProjectForm
										project={project}
										delete={(id) => {
											props.delete(id);
										}}
										onCancel={() => {
											updateEditingProjects(
												editing_projects.filter(
													(id) =>
														id !==
														project.project_id
												)
											);
										}}
										onSubmit={(i, v) => {
											props.update(v);
											updateEditingProjects(
												editing_projects.filter(
													(id) =>
														id !==
														project.project_id
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
