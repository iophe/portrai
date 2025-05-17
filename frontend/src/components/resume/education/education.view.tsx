import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteList } from "../notes.util";
import ItemArticle from "../utils/item.article";
import { ItemDateRange, ItemInfo, ItemText } from "../utils/item.content";
import { FormTags, Tags } from "../utils/tags";
import FormArticle from "../utils/form.article";
import {
	FormCancelButton,
	FormCheckbox,
	FormDeleteButton,
	FormInputDate,
	FormInputText,
	FormLabeledInput,
	FormSubmitButton,
	FormTextArea,
} from "../utils/form.input";
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/api";
import { En, Fr, Lang } from "@components/language";

interface EducationViewProps {
	education: Education;
	edit: (education_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
	offline?: boolean;
	toggle_visibility?: (id: number) => void;
}

export function EducationView(props: EducationViewProps) {
	const fault = useFault();
	const navigate = useNavigate();
	return (
		<ItemArticle
			edit={props.edit}
			item_id={props.education.education_id}
			title={props.education.degree}
			subtitle={props.education.school}
			set_dragged_id={props.set_dragged_id}
			draggable={props.draggable}
			is_visible={props.education?.is_visible ?? true}
			toggle_visibility={async () => {
				if (!props.education) return;
				if (props.offline) {
					props.toggle_visibility?.(props.education.education_id);
				} else {
					try {
						await api.post("/resume/items/toggle", {
							item_id: props.education.education_id,
							item_type: "education",
						});
						props.refetch();
					} catch (error) {
						ProcessMajorError(error, navigate, fault);
					}
				}
			}}
		>
			<ItemInfo>{props.education.location}</ItemInfo>
			<ItemDateRange
				start={new Date(props.education.start_date)}
				end={
					props.education.optional_end_date
						? new Date(props.education.optional_end_date)
						: undefined
				}
			/>
			<ItemText>{props.education.description}</ItemText>
			<Tags values={props.education.tags} />
			<Show when={!props.offline}>
				<NoteList
					notes={props.education.notes}
					id={props.education.education_id}
					section_type="education"
					refetch={props.refetch}
				/>
			</Show>
		</ItemArticle>
	);
}

interface EducationFormProps {
	education?: Education;
	is_new?: boolean;
	delete: (id: number) => void;
	onSubmit: (education_id: number, e: Education) => void;
	onCancel: () => void;
	offline?: boolean;
}

export function EducationForm(props: EducationFormProps) {
	const fault = useFault();
	const navigate = useNavigate();
	const [form_data, setFormData] = createStore({
		school: props.education?.school || "",
		degree: props.education?.degree || "",
		location: props.education?.location || "",
		start_date: props.education?.start_date || "",
		optional_end_date: props.education?.optional_end_date || "",
		is_current: props.education?.is_current || false,
		description: props.education?.description || "",
		priority: props.education?.priority || 0,
		tags: props.education?.tags || [],
		notes: props.education?.notes || [],
	});

	async function handleSubmit() {
		if (!props.is_new) {
			if (!props.education) return;
			try {
				const itemData = {
					item_id: props.education.education_id,
					item_type: "education",
					title: form_data.degree,
					subtitle: form_data.school,
					location: form_data.location,
					start_date: form_data.start_date,
					end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					priority: form_data.priority,
					tags: form_data.tags,
					// metadata can be used for any education-specific fields
					metadata: {},
				};

				if (!props.offline) {
					await api.post("/resume/items/update", itemData);
				}
				props.onSubmit(props.education.education_id, {
					education_id: props.education.education_id,
					school: form_data.school,
					degree: form_data.degree,
					location: form_data.location,
					start_date: form_data.start_date,
					optional_end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					priority: form_data.priority,
					is_visible: true,
					tags: form_data.tags,
					notes: [],
				});
			} catch (error) {
				ProcessMajorError(error, navigate, fault);
			}
		} else {
			try {
				const itemData = {
					item_type: "education",
					title: form_data.degree,
					subtitle: form_data.school,
					location: form_data.location,
					start_date: form_data.start_date,
					end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					tags: form_data.tags,
					// metadata can be used for any education-specific fields
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
					education_id: item_id,
					school: form_data.school,
					degree: form_data.degree,
					location: form_data.location,
					start_date: form_data.start_date,
					optional_end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					priority: form_data.priority,
					is_visible: true,
					tags: form_data.tags,
					notes: [],
				});
			} catch (error) {
				ProcessMajorError(error, navigate, fault);
			}
		}
	}

	return (
		<FormArticle on_submit={handleSubmit}>
			<FormDeleteButton
				no_confirm={props.education?.education_id === undefined}
				delete={() => {
					if (props.education?.education_id) {
						props.delete(props.education?.education_id);
					} else {
						props.onCancel();
					}
				}}
			/>
			<FormLabeledInput
				label={
					<Lang>
						<En>Degree</En>
						<Fr>Diplôme</Fr>
					</Lang>
				}
			>
				<FormInputText
					value={form_data.degree}
					on_input={(value) => setFormData("degree", value)}
					en_placeholder="Write the degree"
					fr_placeholder="Écrivez le nom du diplôme"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput
				label={
					<Lang>
						<En>School</En>
						<Fr>École</Fr>
					</Lang>
				}
			>
				<FormInputText
					value={form_data.school}
					on_input={(value) => setFormData("school", value)}
					en_placeholder="Write the school"
					fr_placeholder="Écrivez le nom de l'école"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput
				label={
					<Lang>
						<En>Location</En>
						<Fr>Lieu</Fr>
					</Lang>
				}
			>
				<FormInputText
					value={form_data.location}
					on_input={(value) => setFormData("location", value)}
					en_placeholder="Write the location"
					fr_placeholder="Écrivez le lieu"
					required
				/>
			</FormLabeledInput>
			<div class="grid grid-cols-2 gap-4">
				<FormLabeledInput
					label={
						<Lang>
							<En>Start Date</En>
							<Fr>Date de début</Fr>
						</Lang>
					}
				>
					<FormInputDate
						value={form_data.start_date}
						on_input={(value) => setFormData("start_date", value)}
						en_placeholder="select start date"
						fr_placeholder="Sélectionnez une date de début"
						required
					/>
				</FormLabeledInput>

				<FormLabeledInput
					label={
						<Lang>
							<En>End Date</En>
							<Fr>Date de fin</Fr>
						</Lang>
					}
					optional
				>
					<FormInputDate
						value={form_data.optional_end_date}
						on_input={(value) =>
							setFormData("optional_end_date", value)
						}
						disabled={form_data.is_current}
						en_placeholder="select end date"
						fr_placeholder="Sélectionnez une date de fin"
					/>
				</FormLabeledInput>
			</div>
			<FormCheckbox
				label="Currently Studying"
				on_input={(value) => setFormData("is_current", value)}
				value={form_data.is_current}
			/>

			<FormLabeledInput label="Description">
				<FormTextArea
					en_placeholder="write the description of this education"
					fr_placeholder="Écrivez une description"
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
