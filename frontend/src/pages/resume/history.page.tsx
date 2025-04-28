import { useFault } from "@components/fault";
import Header from "@components/header.autherized";
import LoadingSpinner from "@components/loading.spinner";
import ResumePreview from "@components/resume/generators/offline.view";
import { A } from "@solidjs/router";
import { db } from "@utils/db/db";
import {
	DB_JOB_SPECIFIC_RESUMES,
	JobSpecificResumeNotFoundError,
} from "@utils/db/resume.db";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
	Suspense,
} from "solid-js";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import Footer from "@components/footer.default";

interface HistoryPageProps {}

function HistoryPage(props: HistoryPageProps) {
	const fault = useFault();
	const [selected_resume_id, select_resume_id] = createSignal<string>();
	const [resumes, { refetch, mutate }] = createResource(async () => {
		try {
			const res = await DB_JOB_SPECIFIC_RESUMES.all_titles(db);
			return res;
		} catch (err) {
			fault.major({
				message: (err as JobSpecificResumeNotFoundError).message,
			});
			return [];
		}
	});
	createEffect(() => {
		const res = resumes();
		if (res && res.length > 0 && !selected_resume_id()) {
			select_resume_id(res[0].id);
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
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen lg:max-h-screen">
			<Header />
			<section
				class="lg:grid lg:grid-cols-2 flex flex-col lg:gap-4 gap-16 justify-start h-full grow overflow-hidden
			 items-start text-forest-900"
			>
				<section class="overflow-y-hidden pr-4 lg:h-full  lg:max-h-full max-h-96 w-full">
					<div class="overflow-y-hidden lg:h-full  lg:max-h-full max-h-96 flex flex-col gap-4">
						<h2 class="w-full border-b-2 border-forest-900 pb-2">
							Recently created resumes :
						</h2>
						<Suspense fallback={<LoadingSpinner />}>
							<ol class="overflow-y-auto w-full flex flex-col gap-4">
								<For
									each={resumes()}
									fallback={
										"Start creating resumes for your next dream job"
									}
								>
									{(resume) => {
										return (
											<li
												class="w-full flex flex-row gap-2 items-center group"
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
													class="flex-shrink-0 lg:hidden lg:group-hover:block"
												>
													<EditIcon class="min-w-fit fill-forest-900" />
												</A>
											</li>
										);
									}}
								</For>
							</ol>
						</Suspense>
					</div>
				</section>
				<Show
					when={selected_resume_id() && resume()}
					fallback={
						<section class="rounded bg-lapis-10 overflow-y-auto p-4 h-full">
							<div class="w-full h-full flex flex-col items-center justify-center">
								<div class="items-center flex flex-col gap-4">
									<h2>
										No resume to display, Start creating
										resumes for your next dream job
									</h2>
									<A
										href="/"
										class="w-fit text-center px-4 py-2 bg-lapis-200 hover:bg-lapis-100 text-snow-100 rounded"
									>
										Return to home page
									</A>
								</div>
							</div>
						</section>
					}
				>
					<ResumePreview job_specific_resume={resume()!} />
				</Show>
			</section>
			<Footer />
		</main>
	);
}

export default HistoryPage;
