import { For, JSXElement, Match, Show, Switch } from "solid-js";

import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import EyeOpenIcon from "@assets/icons/eye.svg?component-solid";
import EyeCloseIcon from "@assets/icons/eye-closed.svg?component-solid";

interface FormLabeledInputProps {
	label: string;
	children: JSXElement;
	optional?: boolean;
}

export function FormLabeledInput(props: FormLabeledInputProps) {
	return (
		<div class="space-y-2">
			<label class="block text-lg font-medium text-night-900">
				<span class="flex flex-row gap-2">
					{props.label}
					<Show when={props.optional}>
						<p class="">(optional)</p>
					</Show>
				</span>
			</label>
			{props.children}
		</div>
	);
}

interface FormInputTextProps {
	value: string;
	placeholder: string;
	on_input: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
}

export function FormInputText(props: FormInputTextProps) {
	return (
		<input
			type="text"
			value={props.value}
			placeholder={props.placeholder}
			onInput={(e) => props.on_input(e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
			required={props.required}
		/>
	);
}

interface FormTextAreaProps {
	value: string;
	placeholder: string;
	on_input: (value: string) => void;
	rows?: number;
	required?: boolean;
	disabled?: boolean;
}

export function FormTextArea(props: FormTextAreaProps) {
	return (
		<textarea
			value={props.value}
			placeholder={props.placeholder}
			onInput={(e) => props.on_input(e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
			rows={props.rows ?? 4}
		/>
	);
}

interface FormInputDateProps {
	value: string;
	placeholder: string;
	on_input: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
}

export function FormInputDate(props: FormInputDateProps) {
	return (
		<input
			type="date"
			value={props.value}
			placeholder={props.placeholder}
			onInput={(e) => props.on_input(e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
			required={props.required}
		/>
	);
}

interface FormCheckboxProps {
	value: boolean;
	label: string;
	on_input: (value: boolean) => void;
}

export function FormCheckbox(props: FormCheckboxProps) {
	return (
		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				checked={props.value}
				onChange={(e) => props.on_input(e.currentTarget.checked)}
				class="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
			/>
			<label class="text-sm text-gray-700">{props.label}</label>
		</div>
	);
}

interface FormSelectProps {
	value: string;
	on_input: (value: string) => void;
	choices: string[];
	select_label: string;
}

export function FormSelect(props: FormSelectProps) {
	return (
		<select
			value={props.value}
			onChange={(e) => props.on_input(e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
		>
			<option value="">{props.select_label}</option>
			<For each={props.choices}>
				{(choice) => <option value={choice}>{choice}</option>}
			</For>
		</select>
	);
}

interface FormCancelProps {
	cancel: () => void;
}
export function FormCancelButton(props: FormCancelProps) {
	return (
		<button
			type="button"
			onClick={props.cancel}
			class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
		>
			Cancel
		</button>
	);
}

interface FormSubmitProps {}
export function FormSubmitButton(props: FormSubmitProps) {
	return (
		<button
			type="submit"
			class="px-4 py-2 bg-night-900 text-white rounded hover:bg-gray-800"
		>
			Save
		</button>
	);
}

interface FormDeleteButtonProps {
	delete: () => void;
}

export function FormDeleteButton(props: FormDeleteButtonProps) {
	return (
		<div class="self-end flex flex-row gap-4">
			<button
				title="Delete"
				onclick={() => {
					const ok = confirm(
						"Are you sure you want to delete this ?"
					);
					if (ok) {
						props.delete();
					}
				}}
			>
				<DeleteIcon class="fill-night-900" />
			</button>
		</div>
	);
}
