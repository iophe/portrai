import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { ProjectForm, ProjectView } from "./project.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";

interface ProjectListProps {}

export function ProjectList(props: ProjectListProps) {
	const fault = useFault();

	const [projects, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get("/resume/project/all");
			const result: ProjectsResponse = response.data as ProjectsResponse;
			return result.projects;
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return [];
		}
	});

	const [editing_projects, updateEditingProjects] = createStore(
		[] as number[]
	);

	const [creating_new, createNew] = createSignal(false);
	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Projects"
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
								getId={(e: Project) => e.project_id}
								list={projects}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									mutate(new_list);
									try {
										await api.post(
											"/resume/project/reorder",
											{
												project_id: source_id,
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
													"/resume/project/delete",
													{
														project_id:
															project.project_id,
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
