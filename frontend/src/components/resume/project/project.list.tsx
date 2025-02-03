import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { ProjectForm, ProjectView } from "./project.view";

interface ProjectListProps {}

export function ProjectList(props: ProjectListProps) {
    const fault = useFault();

    const [projects, { mutate, refetch }] = createResource(async () => {
        try {
            const response = await api.get("/resume/project/all");
            const result: ProjectsResponse = 
                response.data as ProjectsResponse;
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

    return (
        <section class="w-full flex flex-col gap-4 justify-items-center">
            <span class="flex flex-row gap-4">
                <h2 class="text-2xl font-semibold text-gray-900">
                    Projects & Portfolio
                </h2>
                <button
                    onClick={() => createNew(true)}
                    class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                    Add Project
                </button>
            </span>
            <Show when={creating_new()}>
                <ProjectForm
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
            <Suspense
                fallback={<p class="text-gray-500">Loading projects...</p>}
            >
                <For each={projects()}>
                    {(project) => {
                        return (
                            <Show
                                when={editing_projects.includes(
                                    project.project_id
                                )}
                                fallback={
                                    <ProjectView
                                        project={project}
                                        edit={(project_id) => {
                                            updateEditingProjects([
                                                ...editing_projects,
                                                project_id,
                                            ]);
                                        }}
                                        delete={async (project_id) => {
                                            try {
                                                await api.post(
                                                    "/resume/project/delete",
                                                    { project_id }
                                                );
                                                refetch();
                                            } catch (error) {
                                                fault.minor({
                                                    message:
                                                        ((error as AxiosError)
                                                            .response?.data as any)
                                                            .error ??
                                                        (error as AxiosError)
                                                            .message,
                                                });
                                            }
                                        }}
                                    />
                                }
                            >
                                <ProjectForm
                                    project={project}
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
                        );
                    }}
                </For>
            </Suspense>
        </section>
    );
}