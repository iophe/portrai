import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { CertificateForm, CertificateView } from "./certificate.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import LoadingSpinner from "@components/loading.spinner";

interface CertificateListProps {}

export function CertificateList(props: CertificateListProps) {
	const fault = useFault();

	const [certificates, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get("/resume/certificate/all");
			const result: CertificatesResponse =
				response.data as CertificatesResponse;
			return result.certificates;
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return [];
		}
	});

	const [editing_certificates, updateEditingCertificates] = createStore(
		[] as number[]
	);

	const [creating_new, createNew] = createSignal(false);
	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Certifications and Licenses"
				section_name="certification"
				form={(props) => (
					<CertificateForm
						delete={() => {}}
						onCancel={() => {
							props.cancel();
						}}
						onSubmit={() => {
							props.submit();
							refetch();
						}}
						is_new
					/>
				)}
			/>

			<Suspense fallback={<LoadingSpinner />}>
				<For each={certificates()}>
					{(certificate) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_certificates.includes(id)
								}
								id={certificate.certificate_id}
								getId={(e: Certificate) => e.certificate_id}
								list={certificates}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									mutate(new_list);
									try {
										await api.post(
											"/resume/certificate/reorder",
											{
												certificate_id: source_id,
												after_id: target_id,
											}
										);
									} catch (error) {
										fault.minor({
											message:
												(
													(error as AxiosError)
														.response?.data as any
												).error ??
												(error as AxiosError).message,
										});
									}
								}}
							>
								<Show
									when={editing_certificates.includes(
										certificate.certificate_id
									)}
									fallback={
										<CertificateView
											refetch={() => refetch()}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_certificates.includes(
													id
												)
											}
											certificate={certificate}
											edit={(certificate_id) => {
												updateEditingCertificates([
													...editing_certificates,
													certificate_id,
												]);
											}}
										/>
									}
								>
									<CertificateForm
										certificate={certificate}
										delete={async () => {
											try {
												await api.post(
													"/resume/certificate/delete",
													{
														certificate_id:
															certificate.certificate_id,
													}
												);
												refetch();
											} catch (error) {
												fault.minor({
													message:
														(
															(
																error as AxiosError
															).response
																?.data as any
														).error ??
														(error as AxiosError)
															.message,
												});
											}
										}}
										onCancel={() => {
											updateEditingCertificates(
												editing_certificates.filter(
													(id) =>
														id !==
														certificate.certificate_id
												)
											);
										}}
										onSubmit={() => {
											refetch();
											updateEditingCertificates(
												editing_certificates.filter(
													(id) =>
														id !==
														certificate.certificate_id
												)
											);
										}}
									/>
								</Show>
							</Ordered>
						);
					}}
				</For>
			</Suspense>
		</section>
	);
}
