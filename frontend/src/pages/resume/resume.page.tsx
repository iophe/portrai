import { api } from "@utils/api";
import Header from "../../components/header.autherized";
import { useNavigate, useParams } from "@solidjs/router";
import {
	ExperienceList,
	OfflineExperienceList,
} from "@components/resume/experience/experience.list";
import {
	EducationList,
	OfflineEducationList,
} from "@components/resume/education/education.list";
import {
	CertificateList,
	OfflineCertificateList,
} from "@components/resume/certificate/certificate.list";
import {
	OfflineSkillList,
	SkillList,
} from "@components/resume/skill/skill.list";
import {
	OfflineProjectList,
	ProjectList,
} from "@components/resume/project/project.list";
import ResumePreview from "@components/resume/generators/offline.view";
import {
	createResource,
	createSignal,
	Match,
	Show,
	Suspense,
	Switch,
} from "solid-js";
import ResumeSettings from "@components/resume/resume.settings";
import { useFault } from "@components/fault";
import {
	DB_JOB_SPECIFIC_RESUMES,
	JobSpecificResumeNotFoundError,
} from "@utils/db/resume.db";
import { db } from "@utils/db/db";
import LoadingSpinner from "@components/loading.spinner";
import Footer from "@components/footer.default";
import AsideSelector from "@components/resume/selector.aside";

interface ResumeProps {}

function Resume(props: ResumeProps) {
	const navigate = useNavigate();
	const params = useParams();
	const fault = useFault();

	const [resume, { refetch: refetch_resume_data, mutate }] = createResource(
		async () => {
			try {
				const res = await DB_JOB_SPECIFIC_RESUMES.get(db, params.id);
				return res;
			} catch (err) {
				fault.major({
					message: (err as JobSpecificResumeNotFoundError).message,
				});
			}
		}
	);
	const [section, set_section] = createSignal("experience");
	const [refresh, refresh_signal] = createSignal(0);

	function refetch() {
		refetch_resume_data();
		refresh_signal((x) => (x + 1) % 100);
	}

	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen md:max-h-screen">
			<Header />
			<section
				class="md:grid md:grid-cols-2 flex flex-col-reverse justify-end md:gap-4 gap-16 grow h-full md:min-h-full overflow-hidden
			 items-start text-forest-900"
			>
				<section class="md:overflow-y-auto md:pr-4 md:h-full w-full">
					<AsideSelector
						section={section}
						set_section={set_section}
					/>
					<br />
					<Show when={resume()} fallback={<LoadingSpinner />}>
						<Switch>
							<Match when={section() === "experience"}>
								<OfflineExperienceList
									experiences={
										resume()?.resume_data.experiences.sort(
											(a, b) => a.priority - b.priority
										) ?? []
									}
									add={async (experience) => {
										experience.experience_id = (
											resume()?.resume_data.experiences ??
											[]
										).length;
										const update = resume()!;
										experience.priority =
											1 +
											update.resume_data.experiences
												.map((v) => v.priority)
												.reduce(
													(a, b) => Math.max(a, b),
													-Infinity
												);
										update.resume_data.experiences.push(
											experience
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									update={async (experience) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.experiences.findIndex(
												(v) =>
													v.experience_id ===
													experience.experience_id
											);

										update_resume_data.experiences[idx] =
											experience;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									toggle_visibility={async (id) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.experiences.findIndex(
												(v) => v.experience_id === id
											);

										update_resume_data.experiences[
											idx
										].is_visible =
											!update_resume_data.experiences[idx]
												.is_visible;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									delete={async (id) => {
										const update = resume()!;
										const idx =
											update.resume_data.experiences.findIndex(
												(v) => v.experience_id === id
											);
										update.resume_data.experiences.splice(
											idx,
											1
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									reorder={async (experiences) => {
										const update_resume_data =
											resume()!.resume_data;
										for (
											let idx = 0;
											idx < experiences.length;
											idx++
										) {
											const e = experiences[idx];

											const j =
												update_resume_data.experiences.findIndex(
													(v) =>
														v.experience_id ===
														e.experience_id
												);
											update_resume_data.experiences[
												j
											].priority = idx;
										}

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
								/>
							</Match>
							<Match when={section() === "education"}>
								<OfflineEducationList
									educations={
										resume()?.resume_data.educations.sort(
											(a, b) => a.priority - b.priority
										) ?? []
									}
									add={async (education) => {
										education.education_id = (
											resume()?.resume_data.educations ??
											[]
										).length;
										const update = resume()!;
										education.priority =
											1 +
											update.resume_data.educations
												.map((v) => v.priority)
												.reduce(
													(a, b) => Math.max(a, b),
													-Infinity
												);
										update.resume_data.educations.push(
											education
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									toggle_visibility={async (id) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.educations.findIndex(
												(v) => v.education_id === id
											);

										update_resume_data.educations[
											idx
										].is_visible =
											!update_resume_data.educations[idx]
												.is_visible;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									update={async (education) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.educations.findIndex(
												(v) =>
													v.education_id ===
													education.education_id
											);

										update_resume_data.educations[idx] =
											education;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									delete={async (id) => {
										const update = resume()!;
										const idx =
											update.resume_data.educations.findIndex(
												(v) => v.education_id === id
											);
										update.resume_data.educations.splice(
											idx,
											1
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									reorder={async (educations) => {
										const update_resume_data =
											resume()!.resume_data;
										for (
											let idx = 0;
											idx < educations.length;
											idx++
										) {
											const e = educations[idx];

											const j =
												update_resume_data.educations.findIndex(
													(v) =>
														v.education_id ===
														e.education_id
												);
											update_resume_data.educations[
												j
											].priority = idx;
										}

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
								/>
							</Match>
							<Match when={section() === "certificate"}>
								<OfflineCertificateList
									certificates={
										resume()?.resume_data.certificates.sort(
											(a, b) => a.priority - b.priority
										) ?? []
									}
									add={async (certificate) => {
										certificate.certificate_id = (
											resume()?.resume_data
												.certificates ?? []
										).length;
										const update = resume()!;
										certificate.priority =
											1 +
											update.resume_data.certificates
												.map((v) => v.priority)
												.reduce(
													(a, b) => Math.max(a, b),
													-Infinity
												);
										update.resume_data.certificates.push(
											certificate
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									toggle_visibility={async (id) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.certificates.findIndex(
												(v) => v.certificate_id === id
											);

										update_resume_data.certificates[
											idx
										].is_visible =
											!update_resume_data.certificates[
												idx
											].is_visible;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									update={async (certificate) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.certificates.findIndex(
												(v) =>
													v.certificate_id ===
													certificate.certificate_id
											);

										update_resume_data.certificates[idx] =
											certificate;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									delete={async (id) => {
										const update = resume()!;
										const idx =
											update.resume_data.certificates.findIndex(
												(v) => v.certificate_id === id
											);
										update.resume_data.certificates.splice(
											idx,
											1
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									reorder={async (certificates) => {
										const update_resume_data =
											resume()!.resume_data;
										for (
											let idx = 0;
											idx < certificates.length;
											idx++
										) {
											const e = certificates[idx];

											const j =
												update_resume_data.certificates.findIndex(
													(v) =>
														v.certificate_id ===
														e.certificate_id
												);
											update_resume_data.certificates[
												j
											].priority = idx;
										}

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
								/>
							</Match>
							<Match when={section() === "project"}>
								<OfflineProjectList
									projects={
										resume()?.resume_data.projects.sort(
											(a, b) => a.priority - b.priority
										) ?? []
									}
									add={async (project) => {
										project.project_id = (
											resume()?.resume_data.projects ?? []
										).length;
										const update = resume()!;
										project.priority =
											1 +
											update.resume_data.projects
												.map((v) => v.priority)
												.reduce(
													(a, b) => Math.max(a, b),
													-Infinity
												);
										update.resume_data.projects.push(
											project
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									toggle_visibility={async (id) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.certificates.findIndex(
												(v) => v.certificate_id === id
											);

										update_resume_data.certificates[
											idx
										].is_visible =
											!update_resume_data.certificates[
												idx
											].is_visible;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									update={async (project) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.projects.findIndex(
												(v) =>
													v.project_id ===
													project.project_id
											);

										update_resume_data.projects[idx] =
											project;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									delete={async (id) => {
										const update = resume()!;
										const idx =
											update.resume_data.projects.findIndex(
												(v) => v.project_id === id
											);
										update.resume_data.projects.splice(
											idx,
											1
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									reorder={async (projects) => {
										const update_resume_data =
											resume()!.resume_data;
										for (
											let idx = 0;
											idx < projects.length;
											idx++
										) {
											const e = projects[idx];

											const j =
												update_resume_data.projects.findIndex(
													(v) =>
														v.project_id ===
														e.project_id
												);
											update_resume_data.projects[
												j
											].priority = idx;
										}

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
								/>
							</Match>
							<Match when={section() === "skill"}>
								<OfflineSkillList
									skills={
										resume()?.resume_data.skills.sort(
											(a, b) => a.priority - b.priority
										) ?? []
									}
									add={async (skill) => {
										skill.skill_id = (
											resume()?.resume_data.skills ?? []
										).length;
										const update = resume()!;
										skill.priority =
											1 +
											update.resume_data.skills
												.map((v) => v.priority)
												.reduce(
													(a, b) => Math.max(a, b),
													-Infinity
												);
										update.resume_data.skills.push(skill);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									toggle_visibility={async (id) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.skills.findIndex(
												(v) => v.skill_id === id
											);

										update_resume_data.skills[
											idx
										].is_visible =
											!update_resume_data.skills[idx]
												.is_visible;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									update={async (skill) => {
										const update_resume_data =
											resume()!.resume_data;

										const idx =
											update_resume_data.skills.findIndex(
												(v) =>
													v.skill_id ===
													skill.skill_id
											);

										update_resume_data.skills[idx] = skill;

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
									delete={async (id) => {
										const update = resume()!;
										const idx =
											update.resume_data.skills.findIndex(
												(v) => v.skill_id === id
											);
										update.resume_data.skills.splice(
											idx,
											1
										);
										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											update.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update.resume_data
													)
												),
											}
										);
										refetch();
									}}
									reorder={async (skills) => {
										const update_resume_data =
											resume()!.resume_data;
										for (
											let idx = 0;
											idx < skills.length;
											idx++
										) {
											const e = skills[idx];

											const j =
												update_resume_data.skills.findIndex(
													(v) =>
														v.skill_id ===
														e.skill_id
												);
											update_resume_data.skills[
												j
											].priority = idx;
										}

										await DB_JOB_SPECIFIC_RESUMES.upsert(
											db,
											resume()!.id,
											{
												resume_data: JSON.parse(
													JSON.stringify(
														update_resume_data
													)
												),
											}
										);
										refetch();
									}}
								/>
							</Match>
							<Match when={section() === "settings"}>
								<ResumeSettings offline />
							</Match>
						</Switch>
					</Show>
				</section>
				<Show when={resume()} fallback={<LoadingSpinner />}>
					<ResumePreview
						job_specific_resume={resume()!}
						refresh_signal={refresh}
					/>
				</Show>
			</section>
			<Footer />
		</main>
	);
}

export default Resume;
