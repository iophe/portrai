import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { CertificateForm, CertificateView } from "./certificate.view";
import { Ordered } from "../ordered.util";
import SectionHeader from "../utils/section.header";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import LoadingSpinner from "@components/loading.spinner";
import { createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/payment";

interface CertificateListProps {
	on_refetch: () => void;
}

export function CertificateList(props: CertificateListProps) {
	const fault = useFault();
	const navigate = useNavigate();

	const [certificates, { mutate, refetch: refetch_items }] =
		createCachedResource(
			async () => {
				try {
					const response = await api.get(
						"/resume/items/by-type?item_type=certificate"
					);
					const result = response.data.items as ResumeItem[];

					const certificateItems = result.map((item) => ({
						certificate_id: item.item_id,
						certificate_name: item.title,
						optional_issuer: item.subtitle,
						optional_location: item.location,
						optional_granted_date: item.start_date,
						description: item.description,
						priority: item.priority,
						is_visible: item.is_visible,
						tags: item.tags,
						notes: item.notes,
					}));

					return certificateItems as Certificate[];
				} catch (error) {
					ProcessMajorError(error, navigate, fault);
					return [];
				}
			},
			{
				cache_key:
					"CertificateList:/resume/items/by-type?item_type=certificate",
			}
		);
	function refetch() {
		refetch_items();
		props.on_refetch();
	}
	const [editing_certificates, updateEditingCertificates] = createStore(
		[] as number[]
	);

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
				list={certificates}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>
							Add some certifications or licenses in your resume
						</p>{" "}
					</span>
				}
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
								getId={(e) => e.certificate_id}
								list={certificates}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									mutate(new_list);
									try {
										await api.post(
											"/resume/items/reorder",
											{
												item_id: source_id,
												after_id: target_id,
												item_type: "certificate", // Specify the item type
											}
										);
									} catch (error) {
										ProcessMajorError(
											error,
											navigate,
											fault
										);
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
													"/resume/items/delete",
													{
														item_id:
															certificate.certificate_id,
														item_type:
															"certificate", // Specify the item type
													}
												);
												refetch();
											} catch (error) {
												ProcessMajorError(
													error,
													navigate,
													fault
												);
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

interface OfflineCertificateListProps {
	certificates: Certificate[];
	add: (certificate: Certificate) => void;
	update: (certificate: Certificate) => void;
	delete: (id: number) => void;
	reorder: (new_list: Certificate[]) => void;
	toggle_visibility: (id: number) => void;
}

export function OfflineCertificateList(props: OfflineCertificateListProps) {
	const fault = useFault();

	const [editing_certificates, updateEditingCertificates] = createStore(
		[] as number[]
	);

	const [dragged_id, set_dragged_id] = createSignal<number | null>(null);

	return (
		<section class="w-full flex flex-col gap-4 justify-items-center">
			<SectionHeader
				add={() => {}}
				section_title="Certifications and Licenses"
				section_name="certification"
				form={(p) => (
					<CertificateForm
						delete={() => {}}
						onCancel={() => {
							p.cancel();
						}}
						onSubmit={(i, v) => {
							p.submit();
							props.add(v);
						}}
						is_new
						offline
					/>
				)}
				open={props.certificates.length === 0}
				fallback={
					<span class="flex flex-wrap gap-2 text-lapis-500">
						<HelpIcon class="min-w-fit fill-lapis-400" />{" "}
						<p>
							Add some certifications or licenses in this resume
						</p>{" "}
					</span>
				}
			/>

			<Suspense fallback={<LoadingSpinner />}>
				<For each={props.certificates}>
					{(certificate) => {
						return (
							<Ordered
								set_dragged_id={set_dragged_id}
								dragged_id={dragged_id}
								draggable={(id) =>
									editing_certificates.includes(id)
								}
								id={certificate.certificate_id}
								getId={(e) => e.certificate_id}
								list={() => props.certificates}
								onSubmit={async (
									new_list,
									source_id,
									target_id
								) => {
									props.reorder(new_list);
								}}
							>
								<Show
									when={editing_certificates.includes(
										certificate.certificate_id
									)}
									fallback={
										<CertificateView
											refetch={() => {}}
											set_dragged_id={set_dragged_id}
											draggable={(id) =>
												editing_certificates.includes(
													id
												)
											}
											certificate={certificate}
											toggle_visibility={
												props.toggle_visibility
											}
											edit={(certificate_id) => {
												updateEditingCertificates([
													...editing_certificates,
													certificate_id,
												]);
											}}
											offline
										/>
									}
								>
									<CertificateForm
										certificate={certificate}
										delete={(id) => {
											props.delete(id);
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
										onSubmit={(id, v) => {
											props.update(v);
											updateEditingCertificates(
												editing_certificates.filter(
													(id) =>
														id !==
														certificate.certificate_id
												)
											);
										}}
										offline
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
