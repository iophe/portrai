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

interface ExperienceViewProps {
	experience: Experience;
	edit: (experience_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
}

export function ExperienceView(props: ExperienceViewProps) {
	const fault = useFault();
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
				try {
					await api.post("/resume/items/toggle", {
						item_id: props.experience.experience_id,
						item_type: "experience",
					});
					props.refetch();
				} catch (error) {
					fault.minor({
						message:
							((error as AxiosError).response?.data as any)
								.error ?? (error as AxiosError).message,
					});
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
			<NoteList
				notes={props.experience.notes}
				id={props.experience.experience_id}
				section_type="experience"
				refetch={props.refetch}
			/>
		</ItemArticle>
	);
}

interface ExperienceFormProps {
	experience?: Experience;
	is_new?: boolean;
	delete: () => void;
	onSubmit: (experience_id: number) => void;
	onCancel: () => void;
}

export function ExperienceForm(props: ExperienceFormProps) {
	const fault = useFault();
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

				await api.post("/resume/items/update", itemData);
				props.onSubmit(props.experience.experience_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
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

				const res = await api.post("/resume/items/create", itemData);
				const item_id = res.data.item_id;
				props.onSubmit(item_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		}
	}

	return (
		<FormArticle on_submit={handleSubmit}>
			<FormDeleteButton delete={props.delete} />
			<FormLabeledInput label="Job Title">
				<FormInputText
					value={form_data.job_title}
					on_input={(value) => setFormData("job_title", value)}
					placeholder="Write the job title"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput label="Company">
				<FormInputText
					value={form_data.company_name}
					on_input={(value) => setFormData("company_name", value)}
					placeholder="Write the company name"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput label="Location">
				<FormInputText
					value={form_data.location}
					on_input={(value) => setFormData("location", value)}
					placeholder="Write the location"
					required
				/>
			</FormLabeledInput>

			<div class="grid grid-cols-2 gap-4">
				<FormLabeledInput label="Start Date">
					<FormInputDate
						value={form_data.start_date}
						on_input={(value) => setFormData("start_date", value)}
						placeholder="select start date"
						required
					/>
				</FormLabeledInput>

				<FormLabeledInput label="End Date" optional>
					<FormInputDate
						value={form_data.optional_end_date}
						on_input={(value) =>
							setFormData("optional_end_date", value)
						}
						disabled={form_data.is_current}
						placeholder="select end date"
					/>
				</FormLabeledInput>
			</div>
			<FormCheckbox
				label="Current Position"
				on_input={(value) => setFormData("is_current", value)}
				value={form_data.is_current}
			/>

			<FormLabeledInput label="Description">
				<FormTextArea
					placeholder="write the description of this experience"
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
