import { api } from "@utils/api";
import Header from "../../components/header.autherized";
import { useNavigate } from "@solidjs/router";
import { ExperienceList } from "@components/resume/experience/experience.list";
import { EducationList } from "@components/resume/education/education.list";
import { CertificateList } from "@components/resume/certificate/certificate.list";
import { SkillList } from "@components/resume/skill/skill.list";
import { ProjectList } from "@components/resume/project/project.list";
import { createSignal, Match, Switch } from "solid-js";
import ResumeAIPreview from "@components/resume/generators/online.view";
import ResumeSettings from "@components/resume/resume.settings";
import Footer from "@components/footer.default";
import AsideSelector from "@components/resume/selector.aside";

interface HomeProps {}

function Home(props: HomeProps) {
	const navigate = useNavigate();

	const [section, set_section] = createSignal("experience");

	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen md:max-h-screen">
			<Header />
			<section
				class="md:grid md:grid-cols-2 flex flex-col-reverse justify-end md:gap-4 gap-16 grow h-full md:min-h-full overflow-hidden
			 items-start text-forest-900"
			>
				<section class="md:overflow-y-auto md:pr-4 md:h-full w-full h-full">
					<AsideSelector
						section={section}
						set_section={set_section}
					/>
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

				<ResumeAIPreview />
			</section>

			<Footer />
		</main>
	);
}

export default Home;
