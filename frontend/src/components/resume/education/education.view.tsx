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

interface EducationViewProps {
	education: Education;
	edit: (education_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
}

export function EducationView(props: EducationViewProps) {
	const fault = useFault();
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
				try {
					await api.post("/resume/education/toggle", {
						education_id: props.education.education_id,
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
			<NoteList
				notes={props.education.notes}
				id={props.education.education_id}
				section_type="education"
				refetch={props.refetch}
			/>
		</ItemArticle>
	);
}

interface EducationFormProps {
	education?: Education;
	is_new?: boolean;
	delete: () => void;
	onSubmit: (education_id: number) => void;
	onCancel: () => void;
}

export function EducationForm(props: EducationFormProps) {
	const fault = useFault();
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
				await api.post("/resume/education/update", {
					...form_data,
					education_id: props.education.education_id,
				});
				props.onSubmit(props.education.education_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		} else {
			try {
				const res = await api.post(
					"/resume/education/create",
					form_data
				);
				const education_id = res.data.education_id;
				props.onSubmit(education_id);
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
			<FormLabeledInput label="Degree">
				<FormInputText
					value={form_data.degree}
					on_input={(value) => setFormData("degree", value)}
					placeholder="Write the degree"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput label="School">
				<FormInputText
					value={form_data.school}
					on_input={(value) => setFormData("school", value)}
					placeholder="Write the school"
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
				label="Currently Studying"
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
