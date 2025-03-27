import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteList } from "../notes.util";
import ItemArticle from "../utils/item.article";
import { ItemDateRange, ItemText } from "../utils/item.content";
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

interface ProjectViewProps {
	project: Project;
	edit: (project_id: number) => void;
	refetch: () => void;
	set_dragged_id: Setter<number | null>;
	draggable: (id: number) => boolean;
	offline?: boolean;
	toggle_visibility?: (id: number) => void;
}

export function ProjectView(props: ProjectViewProps) {
	const fault = useFault();
	const navigate = useNavigate();
	return (
		<ItemArticle
			edit={props.edit}
			item_id={props.project.project_id}
			title={props.project.project_title}
			subtitle={props.project.optional_project_subtitle}
			set_dragged_id={props.set_dragged_id}
			draggable={props.draggable}
			is_visible={props.project.is_visible}
			toggle_visibility={async () => {
				if (!props.project) return;
				if (props.offline) {
					props.toggle_visibility?.(props.project.project_id);
				} else {
					try {
						await api.post("/resume/items/toggle", {
							item_id: props.project.project_id,
							item_type: "project",
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
			<ItemDateRange
				start={new Date(props.project.start_date)}
				end={
					props.project.optional_end_date
						? new Date(props.project.optional_end_date)
						: undefined
				}
			/>
			<ItemText>{props.project.description}</ItemText>
			<Tags values={props.project.tags} />
			<Show when={!props.offline}>
				<NoteList
					notes={props.project.notes}
					id={props.project.project_id}
					section_type="project"
					refetch={props.refetch}
				/>
			</Show>
		</ItemArticle>
	);
}

interface ProjectFormProps {
	project?: Project;
	is_new?: boolean;
	delete: (id: number) => void;
	onSubmit: (project_id: number, p: Project) => void;
	onCancel: () => void;
	offline?: boolean;
}

export function ProjectForm(props: ProjectFormProps) {
	const fault = useFault();
	const navigate = useNavigate();
	const [form_data, setFormData] = createStore({
		project_title: props.project?.project_title || "",
		optional_project_subtitle:
			props.project?.optional_project_subtitle || "",
		start_date: props.project?.start_date || "",
		optional_end_date: props.project?.optional_end_date || "",
		is_current: props.project?.is_current || false,
		description: props.project?.description || "",
		priority: props.project?.priority || 0,
		tags: props.project?.tags || [],
		notes: props.project?.notes || [],
	});
	async function handleSubmit() {
		if (!props.is_new) {
			if (!props.project) return;
			try {
				const itemData = {
					item_id: props.project.project_id,
					item_type: "project",
					title: form_data.project_title,
					subtitle: form_data.optional_project_subtitle,
					start_date: form_data.start_date,
					end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					priority: form_data.priority,
					tags: form_data.tags,
					// metadata can be used for any project-specific fields
					metadata: {},
				};

				if (!props.offline) {
					await api.post("/resume/items/update", itemData);
				}
				props.onSubmit(props.project.project_id, {
					project_id: props.project.project_id,
					project_title: form_data.project_title,
					optional_project_subtitle:
						form_data.optional_project_subtitle,
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
					item_type: "project",
					title: form_data.project_title,
					subtitle: form_data.optional_project_subtitle,
					start_date: form_data.start_date,
					end_date: form_data.optional_end_date,
					is_current: form_data.is_current,
					description: form_data.description,
					tags: form_data.tags,
					// metadata can be used for any project-specific fields
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
					project_id: item_id,
					project_title: form_data.project_title,
					optional_project_subtitle:
						form_data.optional_project_subtitle,
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
				no_confirm={props.project?.project_id === undefined}
				delete={() => {
					if (props.project?.project_id) {
						props.delete(props.project?.project_id);
					} else {
						props.onCancel();
					}
				}}
			/>
			<FormLabeledInput label="Project Title">
				<FormInputText
					value={form_data.project_title}
					on_input={(value) => setFormData("project_title", value)}
					placeholder="Write the project title"
					required
				/>
			</FormLabeledInput>
			<FormLabeledInput label="Subtitle" optional>
				<FormInputText
					value={form_data.optional_project_subtitle}
					on_input={(value) =>
						setFormData("optional_project_subtitle", value)
					}
					placeholder="Write the project subtitle"
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
				label="Ongoing Project"
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
