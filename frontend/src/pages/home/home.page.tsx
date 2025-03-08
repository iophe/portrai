import { api } from "@utils/api";
import Header from "../../components/header.autherized";
import { useNavigate } from "@solidjs/router";
import { ExperienceList } from "@components/resume/experience/experience.list";
import { EducationList } from "@components/resume/education/education.list";
import { CertificateList } from "@components/resume/certificate/certificate.list";
import { SkillList } from "@components/resume/skill/skill.list";
import { ProjectList } from "@components/resume/project/project.list";
import ExperienceIcon from "@assets/icons/briefcase.svg?component-solid";
import EducationIcon from "@assets/icons/graduation.svg?component-solid";
import CertificateIcon from "@assets/icons/diploma.svg?component-solid";
import ProjectIcon from "@assets/icons/project.svg?component-solid";
import SkillIcon from "@assets/icons/skill.svg?component-solid";
import SettingsIcon from "@assets/icons/settings.svg?component-solid";
import { createSignal, Match, Switch } from "solid-js";
import ResumeAIPreview from "@components/resume/generators/generator.view";
import ResumeSettings from "@components/resume/resume.settings";

interface HomeProps {}

function Home(props: HomeProps) {
	const navigate = useNavigate();

	const [section, set_section] = createSignal("experience");

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section
				class="grid grid-cols-2 gap-4 justify-start h-full overflow-hidden
			 items-start text-forest-900"
			>
				<section class="overflow-y-auto pr-4 h-full">
					<aside class="flex gap-4 justify-between text-sm pb-2 border-b-2 border-forest-900">
						<button
							onclick={() => {
								set_section("settings");
							}}
							class="flex flex-wrap gap-2 items-center rounded opacity-70 hover:opacity-100 transition duration-200 ease-in-out"
							classList={{
								"bg-forest-50 px-4 py-2 opacity-100":
									section() === "settings",
							}}
						>
							<SettingsIcon
								class=""
								classList={{
									"fill-forest-900": section() === "settings",
									"fill-forest-700": section() !== "settings",
								}}
							/>
						</button>
						<button
							onclick={() => {
								set_section("experience");
							}}
							class="flex flex-wrap gap-2 items-center rounded opacity-70 hover:opacity-100 transition-opacity duration-200 ease-in-out"
							classList={{
								"bg-forest-50 px-4 py-2 opacity-100":
									section() === "experience",
							}}
						>
							<label
								classList={{
									"text-forest-900":
										section() === "experience",
									"text-forest-700":
										section() !== "experience",
								}}
							>
								Experiences
							</label>
							<ExperienceIcon
								class=""
								classList={{
									"fill-forest-900":
										section() === "experience",
									"fill-forest-700":
										section() !== "experience",
								}}
							/>
						</button>
						<button
							onclick={() => {
								set_section("education");
							}}
							class="flex flex-wrap gap-2 items-center rounded opacity-70 hover:opacity-100 transition-opacity duration-200 ease-in-out"
							classList={{
								"bg-forest-50 px-4 py-2 opacity-100":
									section() === "education",
							}}
						>
							<label
								classList={{
									"text-forest-900":
										section() === "education",
									"text-forest-700":
										section() !== "education",
								}}
							>
								Educations
							</label>
							<EducationIcon
								class=""
								classList={{
									"fill-forest-900":
										section() === "education",
									"fill-forest-700":
										section() !== "education",
								}}
							/>
						</button>
						<button
							onclick={() => {
								set_section("certificate");
							}}
							class="flex flex-wrap gap-2 items-center rounded opacity-70 hover:opacity-100 transition-opacity duration-200 ease-in-out"
							classList={{
								"bg-forest-50 px-4 py-2 opacity-100":
									section() === "certificate",
							}}
						>
							<label
								classList={{
									"text-forest-900":
										section() === "certificate",
									"text-forest-700":
										section() !== "certificate",
								}}
							>
								Certifications
							</label>
							<CertificateIcon
								class=""
								classList={{
									"fill-forest-900":
										section() === "certificate",
									"fill-forest-700":
										section() !== "certificate",
								}}
							/>
						</button>
						<button
							onclick={() => {
								set_section("project");
							}}
							class="flex flex-wrap gap-2 items-center rounded opacity-70 hover:opacity-100 transition-opacity duration-200 ease-in-out"
							classList={{
								"bg-forest-50 px-4 py-2 opacity-100":
									section() === "project",
							}}
						>
							<label
								classList={{
									"text-forest-900": section() === "project",
									"text-forest-700": section() !== "project",
								}}
							>
								Projects
							</label>
							<ProjectIcon
								class=""
								classList={{
									"fill-forest-900": section() === "project",
									"fill-forest-700": section() !== "project",
								}}
							/>
						</button>
						<button
							onclick={() => {
								set_section("skill");
							}}
							class="flex flex-wrap gap-2 items-center rounded opacity-70 hover:opacity-100 transition-opacity duration-200 ease-in-out"
							classList={{
								"bg-forest-50 px-4 py-2 opacity-100":
									section() === "skill",
							}}
						>
							<label
								classList={{
									"text-forest-900": section() === "skill",
									"text-forest-700": section() !== "skill",
								}}
							>
								Skills
							</label>
							<SkillIcon
								class=""
								classList={{
									"fill-forest-900": section() === "skill",
									"fill-forest-700": section() !== "skill",
								}}
							/>
						</button>
					</aside>
					<br />
					<Switch>
						<Match when={section() === "experience"}>
							<ExperienceList />
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
				</section>
				<section class="rounded bg-lapis-10 overflow-y-auto p-4 h-full">
					<ResumeAIPreview />
				</section>
			</section>
		</main>
	);
}

export default Home;
