import { useFault } from "@components/fault";
import { createResource, createSignal, Show } from "solid-js";
import { generatePDF } from "./generator.utils";
import { TemplateData } from "./templates/template.utils";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { ExecutiveTemplate } from "./templates/default.template";

interface ResumePreviewProps {
	template_name?: string;
}

function ResumePreview(props: ResumePreviewProps) {
	const fault = useFault();

	let cv_ref: HTMLDivElement | undefined = undefined;
	const [is_generating, toGenerating] = createSignal(false);

	// Fetch resume data
	const [resume_data] = createResource<TemplateData>(async () => {
		try {
			const res = await api.get("/resume/data");

			//             const test = await api.post("/ai/session/start", {
			//                 job_description:`
			// About The Job
			// Scaleway is looking for a Backend Developer to join the team in charge of the Identity and Access Management (IAM) product and also the internal API Gateway.

			// Identity and Access Management
			// The Identity and Access Management (IAM) product is at the heart of securing access to Scaleway’s resources. It enables seamless management of both human and machine access across your organization. IAM also empowers you to define precise access controls through policies ensuring that users, applications, and groups have the right level of access to each product. Our service authenticates over 7,000 requests per second.

			// API Gateway
			// The internal API Gateway is a cornerstone of Scaleway’s cloud ecosystem and a key project within our team. It serves as the central hub for all public and internal API requests at Scaleway. Key features of the API Gateway include cross-region and cross-zone routing, rate limiting, authentication, support for both gRPC and REST protocols, and efficient load balancing. These capabilities ensure seamless, secure, and high-performance interactions across our platform. For a deeper dive into the API Gateway, check out this presentation from 2019 (still generally up-to-date).

			// Team’s Philosophy

			//      Code review is an essential part of our team’s work. Every code base modification will be reviewed by peers
			//      We strongly believe in automated tests and the confidence they bring when pressing the "Deploy to production" button
			//      DevOps good practices are part of the team’s DNA
			//      Peer-programming is encouraged to enable knowledge sharing and to make sure everyone is comfortable with every part of the codebase
			//      We are a tech team and, as such, your manager will be a developer
			//      When solving a problem, we value pragmatic solutions while clearly identifying potential future issues
			//      We value positive thinking and see each new challenge as an opportunity to improve our team as a whole

			// Minimum Qualifications

			//     At least 4 years of experience in back-end development
			//     Ability to write well-tested code
			//     Good understanding of the HTTP protocol and REST APIs
			//     Capable of making a deep dive into a large code base
			//     Experience in SQL no matter how many JOINs are involved
			//     Git fluency
			//     Eager to learn new things every day
			//     Very good command in English and French
			//     Experience with monitoring systems (Prometheus, AlertManager, OpenSearch)
			//     Familiar with common DevOps tooling like Docker / CI-CD / Ansible

			// Preferred Qualifications

			//     Experience with distributed micro-service ecosystems
			//     Knowledge of gRPC and Protobuf
			//     Fluent with databases, SQL queries optimization, transactions
			//     Fluent in Golang

			// Responsibilities

			//     Design, develop and maintain new features on services owned by the team
			//     Write simple, clean, coherent and well-tested code
			//     Take every opportunity to fight technical debt
			//     Carefully review the team's merge requests
			//     Actively participate in all team agile rituals (daily, retrospectives, etc.)

			// Our technical stack

			//     Golang
			//     PostgreSQL
			//     Redis
			//     gRPC / Protobuf
			//     Envoy
			//     Docker
			//     Ansible and Terraform
			//     Prometheus (with Alertmanager, Opsgenie)
			//     Gitlab CI
			// `
			//             });

			// console.log(test);

			return {
				resume_data: res.data.resume_data as ResumeData,
				contact: {
					name: "Test",
					email: "test@test.com",
				},
			};
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return {
				contact: {
					name: "Test",
					email: "test@test.com",
				},
				resume_data: {
					experiences: [],
					educations: [],
					skills: [],
					certificates: [],
					projects: [],
				},
			};
		}
	});

	return (
		<section class="w-full">
			<div class="flex flex-col items-start gap-4">
				<button
					class=""
					onClick={async () => {
						if (!cv_ref) return;
						try {
							toGenerating(true);
							generatePDF(cv_ref, {
								name: "my_cv.pdf",
							});
							fault.info({
								message: "successfully generated the PDF",
							});
						} catch (error) {
							fault.major({
								message: "Failed to generate the PDF",
							});
						} finally {
							toGenerating(false);
						}
					}}
					disabled={is_generating()}
				>
					<Show
						when={!is_generating()}
						fallback={"Generating PDF..."}
					>
						Download PDF
					</Show>
				</button>
			</div>
			<div ref={cv_ref} class="max-w-[210mm] min-h-[297mm] h-[297mm]">
				<Show when={resume_data()}>
					<ExecutiveTemplate
						data={resume_data()!}
						settings={{
							font_size: {
								name: "2rem",
								section_title: "1.25rem",
								subsection_title: "1.1rem",
								body: "0.9rem",
							},
							spacing: {
								section: "1.5rem",
								subsection: "1rem",
								item: "0.75rem",
							},
							show_sections: {
								summary: true,
								experience: true,
								education: true,
								skills: true,
								certificates: true,
								projects: true,
							},
						}}
					/>
				</Show>
			</div>
		</section>
	);
}

export default ResumePreview;
