import { api } from "@utils/api";
import Header from "../../components/header.autherized";
import { useNavigate, useParams } from "@solidjs/router";
import { ExperienceList, OfflineExperienceList } from "@components/resume/experience/experience.list";
import { EducationList } from "@components/resume/education/education.list";
import { CertificateList } from "@components/resume/certificate/certificate.list";
import { SkillList } from "@components/resume/skill/skill.list";
import { ProjectList } from "@components/resume/project/project.list";
import ResumePreview from "@components/resume/generators/preview";
import ExperienceIcon from "@assets/icons/briefcase.svg?component-solid";
import EducationIcon from "@assets/icons/graduation.svg?component-solid";
import CertificateIcon from "@assets/icons/diploma.svg?component-solid";
import ProjectIcon from "@assets/icons/project.svg?component-solid";
import SkillIcon from "@assets/icons/skill.svg?component-solid";
import SettingsIcon from "@assets/icons/settings.svg?component-solid";
import { createResource, createSignal, Match, Show, Suspense, Switch } from "solid-js";
import ResumeSettings from "@components/resume/resume.settings";
import { useFault } from "@components/fault";
import { DB_JOB_SPECIFIC_RESUMES, JobSpecificResumeNotFoundError } from "@utils/db/resume.db";
import { db } from "@utils/db/db";
import LoadingSpinner from "@components/loading.spinner";

interface ResumeProps {}

function Resume(props: ResumeProps) {
	const navigate = useNavigate();
    const params = useParams();
    const fault = useFault();
    
    const [resume, {refetch,mutate}] = createResource(async () => {
        try {
            const res = await DB_JOB_SPECIFIC_RESUMES.get(db, params.title);
            return res
        } catch (err) {
            fault.major({ message: (err as JobSpecificResumeNotFoundError).message });
        }
    });
	const [section, set_section] = createSignal("experience");

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section
				class="grid grid-cols-2 gap-4 justify-start h-full overflow-hidden
			 items-start text-night-900"
			>
				<section class="overflow-y-auto pr-4 h-full">
					<aside class="flex gap-4 justify-between text-sm">
						<button
							onclick={() => {
								set_section("settings");
							}}
							class="flex flex-wrap gap-2 items-center rounded"
							classList={{
								"bg-lapis-50 px-4 py-2":
									section() === "settings",
							}}
						>
							<SettingsIcon class="w-8 h-8 [&_path]:stroke-night-900" />
						</button>
						<button
							onclick={() => {
								set_section("experience");
							}}
							class="flex flex-wrap gap-2 items-center rounded"
							classList={{
								"bg-lapis-50 px-4 py-2":
									section() === "experience",
							}}
						>
							<label>Experiences</label>
							<ExperienceIcon class="w-8 h-8 [&_path]:stroke-night-900" />
						</button>
						<button
							onclick={() => {
								set_section("education");
							}}
							class="flex flex-wrap gap-2 items-center rounded"
							classList={{
								"bg-lapis-50 px-4 py-2":
									section() === "education",
							}}
						>
							<label>Educations</label>
							<EducationIcon class="w-8 h-8 [&_path]:stroke-night-900" />
						</button>
						<button
							onclick={() => {
								set_section("certificate");
							}}
							class="flex flex-wrap gap-2 items-center rounded"
							classList={{
								"bg-lapis-50 px-4 py-2":
									section() === "certificate",
							}}
						>
							<label>Certifications</label>
							<CertificateIcon class="w-8 h-8 [&_path]:stroke-night-900" />
						</button>
						<button
							onclick={() => {
								set_section("project");
							}}
							class="flex flex-wrap gap-2 items-center rounded"
							classList={{
								"bg-lapis-50 px-4 py-2":
									section() === "project",
							}}
						>
							<label>Projects</label>
							<ProjectIcon class="w-8 h-8 [&_path]:stroke-night-900" />
						</button>
						<button
							onclick={() => {
								set_section("skill");
							}}
							class="flex flex-wrap gap-2 items-center rounded"
							classList={{
								"bg-lapis-50 px-4 py-2": section() === "skill",
							}}
						>
							<label>Skills</label>
							<SkillIcon class="w-8 h-8 [&_path]:stroke-night-900" />
						</button>
					</aside>
					<br />
                    <Show when={resume()} fallback={<LoadingSpinner />}>
                        <Switch>
                            <Match when={section() === "experience"}>
                                <OfflineExperienceList experiences={resume()?.resume_data.experiences ?? []}/>
                            </Match>
                            <Match when={section() === "education"}>
                                <EducationList />
                            </Match>
                            <Match when={section() === "certificate"}>
                                <CertificateList />
                            </Match>
                            <Match when={section() === "project"}>
                                <ProjectList />
                            </Match>
                            <Match when={section() === "skill"}>
                                <SkillList />
                            </Match>
                            <Match when={section() === "settings"}>
                                <ResumeSettings />
                            </Match>
                        </Switch>
                    </Show>
				</section>
				<section class="rounded bg-lapis-10 overflow-y-auto p-4 h-full">
                    <Show when={resume()} fallback={<LoadingSpinner />}>
					    <ResumePreview job_specific_resume={resume()!}/>
                    </Show>
				</section>
			</section>
		</main>
	);
}

export default Resume;
