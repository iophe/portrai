import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteList } from "../notes.util";
import ItemArticle from "../utils/item.article";
import { ItemDate, ItemInfo, ItemText } from "../utils/item.content";
import { FormTags, Tags } from "../utils/tags";
import FormArticle from "../utils/form.article";
import {
	FormCancelButton,
	FormDeleteButton,
	FormInputDate,
	FormInputText,
	FormLabeledInput,
	FormSubmitButton,
	FormTextArea,
} from "../utils/form.input";
import { useNavigate } from "@solidjs/router";

interface CertificateViewProps {
	certificate: Certificate;
	edit: (certificate_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
	offline?: boolean;
	toggle_visibility?: (id: number) => void;
}

export function CertificateView(props: CertificateViewProps) {
	const fault = useFault();
	const navigate = useNavigate();
	return (
		<ItemArticle
			edit={props.edit}
			item_id={props.certificate.certificate_id}
			title={props.certificate.certificate_name}
			subtitle={props.certificate.optional_issuer}
			set_dragged_id={props.set_dragged_id}
			draggable={props.draggable}
			is_visible={props.certificate?.is_visible ?? true}
			toggle_visibility={async () => {
				if (!props.certificate) return;
				if (props.offline) {
					props.toggle_visibility?.(props.certificate.certificate_id);
				} else {
					try {
						await api.post("/resume/items/toggle", {
							item_id: props.certificate.certificate_id,
							item_type: "certificate",
						});
						props.refetch();
					} catch (error) {
						if ((error as AxiosError).status === 402) {
							navigate("/pricing");
						}
						if (
							(error as AxiosError).status !== 401 &&
							(error as AxiosError).status !== 402
						)
							fault.minor({
								message:
									(
										(error as AxiosError).response
											?.data as any
									).error ?? (error as AxiosError).message,
							});
					}
				}
			}}
		>
			<Show when={props.certificate.optional_location}>
				<ItemInfo>{props.certificate.optional_location}</ItemInfo>
			</Show>
			<Show when={props.certificate.optional_granted_date}>
				<ItemDate
					date={new Date(props.certificate.optional_granted_date)}
				/>
			</Show>
			<ItemText>{props.certificate.description}</ItemText>
			<Tags values={props.certificate.tags} />
			<NoteList
				notes={props.certificate.notes}
				id={props.certificate.certificate_id}
				section_type="certificate"
				refetch={props.refetch}
			/>
		</ItemArticle>
	);
}

interface CertificateFormProps {
	certificate?: Certificate;
	is_new?: boolean;
	delete: (id: number) => void;
	onSubmit: (certificate_id: number, c: Certificate) => void;
	onCancel: () => void;
	offline?: boolean;
}

export function CertificateForm(props: CertificateFormProps) {
	const navigate = useNavigate();
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		certificate_name: props.certificate?.certificate_name || "",
		optional_issuer: props.certificate?.optional_issuer || "",
		optional_location: props.certificate?.optional_location || "",
		optional_granted_date: props.certificate?.optional_granted_date || "",
		description: props.certificate?.description || "",
		priority: props.certificate?.priority || 0,
		tags: props.certificate?.tags || [],
		notes: props.certificate?.notes || [],
	});

	async function handleSubmit() {
		if (!props.is_new) {
			if (!props.certificate) return;
			try {
				const itemData = {
					item_id: props.certificate.certificate_id,
					item_type: "certificate",
					title: form_data.certificate_name,
					subtitle: form_data.optional_issuer,
					location: form_data.optional_location,
					start_date: form_data.optional_granted_date,
					description: form_data.description,
					priority: form_data.priority,
					tags: form_data.tags,
					// metadata can be used for any certificate-specific fields
					metadata: {},
				};

				if (!props.offline) {
					await api.post("/resume/items/update", itemData);
				}
				props.onSubmit(props.certificate.certificate_id, {
					certificate_id: props.certificate.certificate_id,
					certificate_name: form_data.certificate_name,
					optional_issuer: form_data.optional_issuer,
					optional_location: form_data.optional_location,
					optional_granted_date: form_data.optional_granted_date,
					description: form_data.description,
					priority: form_data.priority,
					is_visible: true,
					tags: form_data.tags,
					notes: [],
				});
			} catch (error) {
				if ((error as AxiosError).status === 402) {
					navigate("/pricing");
				}
				if (
					(error as AxiosError).status !== 401 &&
					(error as AxiosError).status !== 402
				)
					fault.minor({
						message:
							((error as AxiosError).response?.data as any)
								.error ?? (error as AxiosError).message,
					});
			}
		} else {
			try {
				const itemData = {
					item_type: "certificate",
					title: form_data.certificate_name,
					subtitle: form_data.optional_issuer,
					location: form_data.optional_location,
					start_date: form_data.optional_granted_date,
					description: form_data.description,
					tags: form_data.tags,
					// metadata can be used for any certificate-specific fields
					metadata: {},
				};

				let item_id = 0;
				if (!props.offline) {
					const res = await api.post(
						"/resume/items/create",
						itemData
					);
					item_id = res.data.item_id;
				}
				props.onSubmit(item_id, {
					certificate_id: item_id,
					certificate_name: form_data.certificate_name,
					optional_issuer: form_data.optional_issuer,
					optional_location: form_data.optional_location,
					optional_granted_date: form_data.optional_granted_date,
					description: form_data.description,
					priority: form_data.priority,
					is_visible: true,
					tags: form_data.tags,
					notes: [],
				});
			} catch (error) {
				if ((error as AxiosError).status === 402) {
					navigate("/pricing");
				}
				if (
					(error as AxiosError).status !== 401 &&
					(error as AxiosError).status !== 402
				)
					fault.minor({
						message:
							((error as AxiosError).response?.data as any)
								.error ?? (error as AxiosError).message,
					});
			}
		}
	}

	return (
		<FormArticle on_submit={handleSubmit}>
			<FormDeleteButton
				delete={() => props.delete(props.certificate!.certificate_id)}
			/>
			<FormLabeledInput label="Certificate Name">
				<FormInputText
					value={form_data.certificate_name}
					on_input={(value) => setFormData("certificate_name", value)}
					placeholder="Write the name of the certificate"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput label="Issuer" optional>
				<FormInputText
					value={form_data.optional_issuer}
					on_input={(value) => setFormData("optional_issuer", value)}
					placeholder="Write the issuer"
				/>
			</FormLabeledInput>

			<FormLabeledInput label="Location" optional>
				<FormInputText
					value={form_data.optional_location}
					on_input={(value) =>
						setFormData("optional_location", value)
					}
					placeholder="Write the location"
				/>
			</FormLabeledInput>
			<FormLabeledInput label="Granted Date" optional>
				<FormInputDate
					value={form_data.optional_granted_date}
					on_input={(value) =>
						setFormData("optional_granted_date", value)
					}
					placeholder="select granted date"
				/>
			</FormLabeledInput>

			<FormLabeledInput label="Description">
				<FormTextArea
					placeholder="write the description of this certificate"
					value={form_data.description}
					on_input={(value) => setFormData("description", value)}
					rows={4}
				/>
			</FormLabeledInput>
			<FormTags
				add={(tag) => {
					setFormData("tags", [...form_data.tags, tag]);
				}}
				delete={(idx) => {
					setFormData("tags", (t) => t.filter((_, i) => i !== idx));
				}}
				tags={form_data.tags}
			/>
			<div class="flex justify-end gap-4">
				<FormCancelButton cancel={props.onCancel} />
				<FormSubmitButton />
			</div>
		</FormArticle>
	);
}
