import { api } from "@utils/api";
import Header from "../../components/header.autherized";
import { useNavigate } from "@solidjs/router";
import { ExperienceList } from "@components/resume/experience/experience.list";
import { EducationList } from "@components/resume/education/education.list";
import { CertificateList } from "@components/resume/certificate/certificate.list";
import { SkillList } from "@components/resume/skill/skill.list";
import { ProjectList } from "@components/resume/project/project.list";
import { createSignal, Match, onMount, Switch } from "solid-js";
import ResumeAIPreview from "@components/resume/generators/online.view";
import ResumeSettings from "@components/resume/resume.settings";
import Footer from "@components/footer.default";
import AsideSelector from "@components/resume/selector.aside";
import {
	TutorialMetadata,
	TutorialProvider,
	useTutorial,
} from "@components/onboarding";

interface HomeProps {}

function Home(props: HomeProps) {
	const navigate = useNavigate();
	const tutorial = useTutorial();

	const [section, set_section] = createSignal("experience");
	const [refresh, refresh_signal] = createSignal(0);

	function refetch() {
		refresh_signal((x) => (x + 1) % 100);
	}

	onMount(() => {
		const tutorial_metadata_json =
			localStorage.getItem("tutorial-metadata") ?? "{}";
		const tutorial_metadata = JSON.parse(
			tutorial_metadata_json
		) as TutorialMetadata;

		if (
			!tutorial_metadata ||
			!(tutorial_metadata["add-resume-item"]?.completed ?? false)
		) {
			tutorial.show(
				"add-resume-item",
				tutorial_metadata["add-resume-item"]
			);
		}
	});

	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen lg:max-h-screen">
			<Header />
			<section
				class="lg:grid lg:grid-cols-2 flex flex-col-reverse justify-end lg:gap-4 gap-16 grow h-full lg:min-h-full overflow-hidden
			 items-start text-forest-900"
			>
				<section class="lg:overflow-y-auto lg:pr-4 lg:h-full w-full h-full">
					<AsideSelector
						section={section}
						set_section={set_section}
					/>
					<br />
					<Switch>
						<Match when={section() === "experience"}>
							<ExperienceList on_refetch={refetch} />
						</Match>
						<Match when={section() === "education"}>
							<EducationList on_refetch={refetch} />
						</Match>
						<Match when={section() === "certificate"}>
							<CertificateList on_refetch={refetch} />
						</Match>
						<Match when={section() === "project"}>
							<ProjectList on_refetch={refetch} />
						</Match>
						<Match when={section() === "skill"}>
							<SkillList on_refetch={refetch} />
						</Match>
						<Match when={section() === "settings"}>
							<ResumeSettings on_refetch={refetch} />
						</Match>
					</Switch>
				</section>

				<ResumeAIPreview refresh_signal={refresh} />
			</section>

			<Footer />
		</main>
	);
}

function Page() {
	return (
		<TutorialProvider>
			<Home />
		</TutorialProvider>
	);
}
export default Page;
