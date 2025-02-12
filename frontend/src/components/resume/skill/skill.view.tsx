import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteList } from "../notes.util";
import ItemArticle from "../utils/item.article";
import { ItemInfo, ItemText } from "../utils/item.content";
import { FormTags, Tags } from "../utils/tags";
import FormArticle from "../utils/form.article";
import {
	FormCancelButton,
	FormCheckbox,
	FormDeleteButton,
	FormInputDate,
	FormInputText,
	FormLabeledInput,
	FormSelect,
	FormSubmitButton,
	FormTextArea,
} from "../utils/form.input";

interface SkillViewProps {
	skill: Skill;
	edit: (skill_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
}

export function SkillView(props: SkillViewProps) {
	const fault = useFault();
	return (
		<ItemArticle
			edit={props.edit}
			item_id={props.skill.skill_id}
			title={props.skill.skill_name}
			set_dragged_id={props.set_dragged_id}
			draggable={props.draggable}
			is_visible={props.skill?.is_visible ?? true}
			toggle_visibility={async () => {
				if (!props.skill) return;
				try {
					await api.post("/resume/skill/toggle", {
						skill_id: props.skill.skill_id,
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
			<Show when={props.skill.optional_skill_type}>
				<ItemInfo>Type: {props.skill.optional_skill_type}</ItemInfo>
			</Show>
			<Show when={props.skill.optional_skill_level}>
				<ItemInfo>Level: {props.skill.optional_skill_level}</ItemInfo>
			</Show>
			<ItemText>{props.skill.description}</ItemText>
			<Tags values={props.skill.tags} />
			<NoteList
				notes={props.skill.notes}
				id={props.skill.skill_id}
				section_type="experience"
				refetch={props.refetch}
			/>
		</ItemArticle>
	);
}

interface SkillFormProps {
	skill?: Skill;
	is_new?: boolean;
	delete: () => void;
	onSubmit: (skill_id: number) => void;
	onCancel: () => void;
}

export function SkillForm(props: SkillFormProps) {
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		skill_name: props.skill?.skill_name || "",
		optional_skill_type: props.skill?.optional_skill_type || "",
		optional_skill_level: props.skill?.optional_skill_level || "",
		description: props.skill?.description || "",
		priority: props.skill?.priority || 0,
		tags: props.skill?.tags || [],
		notes: props.skill?.notes || [],
	});

	async function handleSubmit() {
		if (!props.is_new) {
			if (!props.skill) return;
			try {
				await api.post("/resume/skill/update", {
					...form_data,
					skill_id: props.skill.skill_id,
				});
				props.onSubmit(props.skill.skill_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		} else {
			try {
				const res = await api.post("/resume/skill/create", form_data);
				const skill_id = res.data.skill_id;
				props.onSubmit(skill_id);
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

			<FormLabeledInput label="Skill">
				<FormInputText
					value={form_data.skill_name}
					on_input={(value) => setFormData("skill_name", value)}
					placeholder="Write the skill"
					required
				/>
			</FormLabeledInput>

			<FormLabeledInput label="Skill Type" optional>
				<FormSelect
					value={form_data.optional_skill_type}
					on_input={(value) =>
						setFormData("optional_skill_type", value)
					}
					choices={[
						"Technical",
						"Soft",
						"Language",
						"Tool",
						"Framework",
						"Platform",
						"Other",
					]}
					select_label="Select Type"
				/>
			</FormLabeledInput>
			<FormLabeledInput label="Skill Level" optional>
				<FormSelect
					value={form_data.optional_skill_level}
					on_input={(value) =>
						setFormData("optional_skill_level", value)
					}
					choices={[
						"Beginner",
						"Amateur",
						"Competent",
						"Proficient",
						"Expert",
					]}
					select_label="Select Level"
				/>
			</FormLabeledInput>
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
