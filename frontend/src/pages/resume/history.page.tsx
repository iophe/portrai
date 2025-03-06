import { useFault } from "@components/fault";
import Header from "@components/header.autherized";
import LoadingSpinner from "@components/loading.spinner";
import ResumePreview from "@components/resume/generators/preview";
import { A } from "@solidjs/router";
import { db } from "@utils/db/db";
import {
	DB_JOB_SPECIFIC_RESUMES,
	JobSpecificResumeNotFoundError,
} from "@utils/db/resume.db";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import { FormInputText } from "@components/resume/utils/form.input";
import { randomUUID } from "crypto";

interface HistoryPageProps {}

function HistoryPage(props: HistoryPageProps) {
	const fault = useFault();
	const [selected_resume_id, select_resume_id] = createSignal<string>();
	const [resumes, { refetch, mutate }] = createResource(async () => {
		try {
			const res = await DB_JOB_SPECIFIC_RESUMES.all_titles(db);
			select_resume_id(res[0].id);
			return res;
		} catch (err) {
			fault.major({
				message: (err as JobSpecificResumeNotFoundError).message,
			});
		}
	});
	const [resume] = createResource(selected_resume_id, async (id) => {
		try {
			const res = await DB_JOB_SPECIFIC_RESUMES.get(db, id);
			return res;
		} catch (err) {
			fault.major({
				message: (err as JobSpecificResumeNotFoundError).message,
			});
		}
	});

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section
				class="grid grid-cols-2 gap-4 justify-start h-full overflow-hidden
         items-start text-forest-900"
			>
				<section class="overflow-y-hidden pr-4 h-full">
					<div class="overflow-y-hidden h-full flex flex-col gap-4">
						<Suspense fallback={<LoadingSpinner />}>
							<h2 class="w-full border-b-2 border-forest-900 pb-2">
								Recently created resumes :
							</h2>
							<ol class="overflow-y-auto flex flex-col gap-4">
								<For
									each={resumes()}
									fallback={
										"Start creating resumes for your next dream job"
									}
								>
									{(resume) => {
										return (
											<li
												class="flex flex-row gap-2 items-center group"
												classList={{
													"p-2 bg-forest-50 rounded":
														selected_resume_id() ===
														resume.id,
												}}
											>
												<div class="flex-1 min-w-0">
													<button
														title="visualize"
														onclick={() => {
															select_resume_id(
																resume.id
															);
														}}
														class=" overflow-clip w-full text-start flex flex-row gap-1"
													>
														<span class="overflow-hidden text-ellipsis whitespace-nowrap">
															- {resume.title}
														</span>
														<span class="whitespace-nowrap">
															|{" "}
															{resume.created_at.toDateString()}
														</span>
													</button>
												</div>
												<A
													href={`/resume/${resume.id}`}
													class="flex-shrink-0 hidden group-hover:block"
												>
													<EditIcon class="fill-forest-900" />
												</A>
											</li>
										);
									}}
								</For>
							</ol>
						</Suspense>
					</div>
				</section>
				<section class="rounded bg-lapis-10 overflow-y-auto p-4 h-full">
					<Show when={resume()} fallback={<LoadingSpinner />}>
						<ResumePreview job_specific_resume={resume()!} />
					</Show>
				</section>
			</section>
		</main>
	);
}

export default HistoryPage;
