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
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/payment";

interface SkillViewProps {
	skill: Skill;
	edit: (skill_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
	offline?: boolean;
	toggle_visibility?: (id: number) => void;
}

export function SkillView(props: SkillViewProps) {
	const fault = useFault();
	const navigate = useNavigate();
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
				if (props.offline) {
					props.toggle_visibility?.(props.skill.skill_id);
				} else {
					try {
						await api.post("/resume/items/toggle", {
							item_id: props.skill.skill_id,
							item_type: "skill",
						});
						props.refetch();
					} catch (error) {
						ProcessMajorError(error, navigate, fault);
					}
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
			<Show when={!props.offline}>
				<NoteList
					notes={props.skill.notes}
					id={props.skill.skill_id}
					section_type="skill" // Changed from "experience" to "skill" to fix a bug
					refetch={props.refetch}
				/>
			</Show>
		</ItemArticle>
	);
}

interface SkillFormProps {
	skill?: Skill;
	is_new?: boolean;
	delete: (id: number) => void;
	onSubmit: (skill_id: number, s: Skill) => void;
	onCancel: () => void;
	offline?: boolean;
}

export function SkillForm(props: SkillFormProps) {
	const fault = useFault();
	const navigate = useNavigate();
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
				const itemData = {
					item_id: props.skill.skill_id,
					item_type: "skill",
					title: form_data.skill_name,
					subtitle: form_data.optional_skill_type,
					description: form_data.description,
					priority: form_data.priority,
					tags: form_data.tags,
					// Store skill level in metadata
					metadata: {
						skill_level: form_data.optional_skill_level,
					},
				};

				if (!props.offline) {
					await api.post("/resume/items/update", itemData);
				}
				props.onSubmit(props.skill.skill_id, {
					skill_id: props.skill.skill_id,
					skill_name: form_data.skill_name,
					optional_skill_type: form_data.optional_skill_type,
					optional_skill_level: form_data.optional_skill_level,
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
					item_type: "skill",
					title: form_data.skill_name,
					subtitle: form_data.optional_skill_type,
					description: form_data.description,
					tags: form_data.tags,
					// Store skill level in metadata
					metadata: {
						skill_level: form_data.optional_skill_level,
					},
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
					skill_id: item_id,
					skill_name: form_data.skill_name,
					optional_skill_type: form_data.optional_skill_type,
					optional_skill_level: form_data.optional_skill_level,
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
				no_confirm={props.skill?.skill_id === undefined}
				delete={() => {
					if (props.skill?.skill_id) {
						props.delete(props.skill?.skill_id);
					} else {
						props.onCancel();
					}
				}}
			/>
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
					placeholder="write the description of this skill"
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
