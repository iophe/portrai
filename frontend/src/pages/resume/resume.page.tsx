import { useFault } from "@components/fault";
import Header from "@components/header.default";
import { CertificateList } from "@components/resume/certificate/certificate.list";
import { EducationList } from "@components/resume/education/education.list";
import { ExperienceList } from "@components/resume/experience/experience.list";
import ResumePreview from "@components/resume/generators/preview";
import { ProjectList } from "@components/resume/project/project.list";
import { SkillList } from "@components/resume/skill/skill.list";
import { api } from "@utils/api";
import { createSignal } from "solid-js";

interface ResumeProps {}

function Resume(props: ResumeProps) {
	return (
		<main class="p-4 flex flex-col gap-4 bg-gray-50 min-h-screen">
			<Header />
			<section class="w-full flex flex-col gap-4 items-center">
				<section class="w-3/4  flex flex-col gap-4 items-center">
					<ExperienceList />
					<EducationList />
					<CertificateList />
					<SkillList />
					<ProjectList />

					<ResumePreview />
				</section>
			</section>
		</main>
	);
}

export default Resume;
