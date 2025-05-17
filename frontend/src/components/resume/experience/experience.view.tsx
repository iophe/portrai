import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteList } from "../notes.util";
import ItemArticle from "../utils/item.article";
import { FormTags, Tags } from "../utils/tags";
import { ItemDateRange, ItemInfo, ItemText } from "../utils/item.content";
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

interface ExperienceViewProps {
	experience: Experience;
	edit: (experience_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
	offline?: boolean;
	toggle_visibility?: (id: number) => void;
}

export function ExperienceView(props: ExperienceViewProps) {
	const fault = useFault();
	const navigate = useNavigate();
	return (
		<ItemArticle
			edit={props.edit}
			item_id={props.experience.experience_id}
			title={props.experience.job_title}
			subtitle={props.experience.company_name}
			set_dragged_id={props.set_dragged_id}
			draggable={props.draggable}
			is_visible={props.experience?.is_visible ?? true}
			toggle_visibility={async () => {
				if (!props.experience) return;
				if (props.offline) {
					props.toggle_visibility?.(props.experience.experience_id);
				} else {
					try {
						await api.post("/resume/items/toggle", {
							item_id: props.experience.experience_id,
							item_type: "experience",
						});
						props.refetch();
					} catch (error) {
						ProcessMajorError(error, navigate, fault);
					}
				}
			}}
		>
			<ItemInfo>{props.experience.location}</ItemInfo>
			<ItemDateRange
				start={new Date(props.experience.start_date)}
				end={
					props.experience.optional_end_date
						? new Date(props.experience.optional_end_date)
						: undefined
				}
			/>
			<ItemText>{props.experience.description}</ItemText>
			<Tags values={props.experience.tags} />
			<Show when={!props.offline}>
				<NoteList
					notes={props.experience.notes}
					id={props.experience.experience_id}
					section_type="experience"
					refetch={props.refetch}
				/>
			</Show>
		</ItemArticle>
	);
}

interface ExperienceFormProps {
	experience?: Experience;
	is_new?: boolean;
	delete: (experience_id: number) => void;
	onSubmit: (experience_id: number, exp: Experience) => void;
	onCancel: () => void;
	offline?: boolean;
}

export function ExperienceForm(props: ExperienceFormProps) {
	const fault = useFault();
	const navigate = useNavigate();
	const [form_data, setFormData] = createStore({
		company_name: props.experience?.company_name || "",
		job_title: props.experience?.job_title || "",
		location: props.experience?.location || "",
		start_date: props.experience?.start_date || "",
		optional_end_date: props.experience?.optional_end_date || "",
		is_current: props.experience?.is_current || false,
		description: props.experience?.description || "",
		priority: props.experience?.priority || 0,
		tags: props.experience?.tags || [],
		notes: props.experience?.notes || [],
	});

	async function handleSubmit() {
		if (!props.is_new) {
			if (!props.experience) return;
			try {
				const itemData = {
					item_id: props.experience.experience_id,
					item_type: "experience",
					title: form_data.job_title,
					subtitle: form_data.company_name,
					location: form_data.location,
					start_date: form_data.start_date,
					end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					priority: form_data.priority,
					tags: form_data.tags,
					metadata: {},
				};
				if (!props.offline) {
					await api.post("/resume/items/update", itemData);
				}
				props.onSubmit(props.experience.experience_id, {
					experience_id: props.experience.experience_id,
					company_name: form_data.company_name,
					job_title: form_data.job_title,
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
					item_type: "experience",
					title: form_data.job_title,
					subtitle: form_data.company_name,
					location: form_data.location,
					start_date: form_data.start_date,
					end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					tags: form_data.tags,
					// metadata can be used for any experience-specific fields
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
					experience_id: item_id,
					company_name: form_data.company_name,
					job_title: form_data.job_title,
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
				no_confirm={props.experience?.experience_id === undefined}
				delete={() => {
					if (props.experience?.experience_id) {
						props.delete(props.experience?.experience_id);
					} else {
						props.onCancel();
					}
				}}
			/>
			<FormLabeledInput
				label={
					<Lang>
						<En>Job Title</En>
						<Fr>Titre de l'emploi</Fr>
					</Lang>
				}
			>
				<FormInputText
					value={form_data.job_title}
					on_input={(value) => setFormData("job_title", value)}
					en_placeholder="Write the job title"
					fr_placeholder="Écrivez le nom de l'emploi"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput
				label={
					<Lang>
						<En>Company</En>
						<Fr>Entreprise</Fr>
					</Lang>
				}
			>
				<FormInputText
					value={form_data.company_name}
					on_input={(value) => setFormData("company_name", value)}
					en_placeholder="Write the company name"
					fr_placeholder="Écrivez le nom de l'entreprise"
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
				label={
					<Lang>
						<En>Current Position</En>
						<Fr>Actuel</Fr>
					</Lang>
				}
				on_input={(value) => setFormData("is_current", value)}
				value={form_data.is_current}
			/>

			<FormLabeledInput label="Description">
				<FormTextArea
					en_placeholder="write the description of this experience"
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
