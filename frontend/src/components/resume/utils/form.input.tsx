import { For, JSXElement, Match, Show, Switch } from "solid-js";
import { Motion, Presence } from "solid-motionone";

import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import EyeOpenIcon from "@assets/icons/eye.svg?component-solid";
import EyeCloseIcon from "@assets/icons/eye-closed.svg?component-solid";
import { En, Fr, Lang, useLang } from "@components/language";

interface FormLabeledInputProps {
	label: JSXElement;
	children: JSXElement;
	optional?: boolean;
}

export function FormLabeledInput(props: FormLabeledInputProps) {
	return (
		<Motion.div
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.1, easing: "ease-out" }}
			class="space-y-2"
		>
			<label class="block text-lg font-medium text-forest-900">
				<span class="flex flex-row gap-2">
					{props.label}
					<Show when={props.optional}>
						<Motion.p
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.1, delay: 0.1 }}
						>
							<Lang>
								<En>(optional)</En>
								<Fr>(optionnel)</Fr>
							</Lang>
						</Motion.p>
					</Show>
				</span>
			</label>
			{props.children}
		</Motion.div>
	);
}

interface FormInputTextProps {
	value: string;
	fr_placeholder: string;
	en_placeholder: string;
	on_input: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
	max_length?: number;
}

export function FormInputText(props: FormInputTextProps) {
	const max_length = props.max_length ?? 144;
	const lang = useLang();

	const handleInput = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;

		if (target.value.length > max_length) {
			target.value = target.value.slice(0, max_length);
		}

		props.on_input(target.value);
	};

	return (
		<input
			type="text"
			value={props.value}
			placeholder={
				lang.current() === "fr"
					? props.fr_placeholder
					: props.en_placeholder
			}
			onInput={handleInput}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
			required={props.required}
			disabled={props.disabled}
			maxLength={props.max_length ?? 144}
		/>
	);
}

interface FormInputTelephoneProps {
	value: string;
	fr_placeholder: string;
	en_placeholder: string;
	on_input: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
}

export function FormInputTelephone(props: FormInputTelephoneProps) {
	const lang = useLang();
	return (
		<input
			type="tel"
			value={props.value}
			placeholder={
				lang.current() === "fr"
					? props.fr_placeholder
					: props.en_placeholder
			}
			onInput={(e) => props.on_input(e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
			required={props.required}
		/>
	);
}

interface FormTextAreaProps {
	value: string;
	fr_placeholder: string;
	en_placeholder: string;
	on_input: (value: string) => void;
	rows?: number;
	required?: boolean;
	disabled?: boolean;
	max_length?: number;
}

export function FormTextArea(props: FormTextAreaProps) {
	const max_length = props.max_length ?? 1024;
	const lang = useLang();
	const handleInput = (e: Event) => {
		const target = e.currentTarget as HTMLTextAreaElement;

		if (target.value.length > max_length) {
			target.value = target.value.slice(0, max_length);
		}

		props.on_input(target.value);
	};

	return (
		<textarea
			value={props.value}
			placeholder={
				lang.current() === "fr"
					? props.fr_placeholder
					: props.en_placeholder
			}
			onInput={handleInput}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
			rows={props.rows ?? 4}
			required={props.required}
			disabled={props.disabled}
			maxLength={props.max_length ?? 1024}
		/>
	);
}

interface FormInputDateProps {
	value: string;
	fr_placeholder: string;
	en_placeholder: string;
	on_input: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
}

export function FormInputDate(props: FormInputDateProps) {
	const lang = useLang();
	return (
		<input
			type="date"
			value={props.value}
			placeholder={
				lang.current() === "fr"
					? props.fr_placeholder
					: props.en_placeholder
			}
			onInput={(e) => props.on_input(e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
			required={props.required}
		/>
	);
}

interface FormCheckboxProps {
	value: boolean;
	label: JSXElement;
	on_input: (value: boolean) => void;
}

export function FormCheckbox(props: FormCheckboxProps) {
	return (
		<Motion.div
			initial={{ opacity: 0, x: -5 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.1 }}
			class="flex items-center gap-2"
		>
			<input
				type="checkbox"
				checked={props.value}
				onChange={(e) => props.on_input(e.currentTarget.checked)}
				class="rounded border-gray-300 text-gray-600 focus:ring-lapis-500"
			/>
			<label class="text-sm text-gray-700">{props.label}</label>
		</Motion.div>
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
			class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-lapis-500"
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
		<Motion.button
			hover={{ scale: 1.05 }}
			press={{ scale: 0.95 }}
			transition={{ duration: 0.1 }}
			type="button"
			onClick={props.cancel}
			class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
		>
			<Lang>
				<En>Cancel</En>
				<Fr>Annuler</Fr>
			</Lang>
		</Motion.button>
	);
}

interface FormSubmitProps {}
export function FormSubmitButton(props: FormSubmitProps) {
	return (
		<Motion.button
			hover={{ scale: 1.05 }}
			press={{ scale: 0.95 }}
			transition={{ duration: 0.1 }}
			type="submit"
			class="px-4 py-2 w-fit bg-forest-900 text-white rounded hover:bg-forest-500"
		>
			<Lang>
				<En>Save</En>
				<Fr>Sauvegarder</Fr>
			</Lang>
		</Motion.button>
	);
}

interface FormDeleteButtonProps {
	delete: () => void;
	no_confirm?: boolean;
}

export function FormDeleteButton(props: FormDeleteButtonProps) {
	return (
		<div class="self-end flex flex-row gap-4">
			<Motion.button
				hover={{ scale: 1.1 }}
				press={{ scale: 0.9 }}
				transition={{ duration: 0.1 }}
				title="Delete"
				onclick={() => {
					const ok =
						props.no_confirm ||
						confirm("Are you sure you want to delete this ?");
					if (ok) {
						props.delete();
					}
				}}
			>
				<DeleteIcon class="min-w-fit fill-forest-900" />
			</Motion.button>
		</div>
	);
}

interface FormVisibilityToggleProps {
	is_visible: boolean;
	toggle: () => void;
}

export function FormVisibilityToggle(props: FormVisibilityToggleProps) {
	return (
		<Motion
			hover={{ scale: 1.1 }}
			press={{ scale: 0.9 }}
			transition={{ duration: 0.1 }}
			title={props.is_visible ? "Hide item" : "Show item"}
			onClick={props.toggle}
		>
			<Presence exitBeforeEnter>
				<Show
					when={props.is_visible}
					fallback={
						<Motion
							initial={{ rotateY: -90 }}
							animate={{ rotateY: 0 }}
							exit={{ rotateY: 90 }}
							transition={{ duration: 0.1 }}
						>
							<EyeCloseIcon class="min-w-fit fill-forest-900" />
						</Motion>
					}
				>
					<Motion
						initial={{ rotateY: -90 }}
						animate={{ rotateY: 0 }}
						exit={{ rotateY: 90 }}
						transition={{ duration: 0.1 }}
					>
						<EyeOpenIcon class="min-w-fit fill-forest-900" />
					</Motion>
				</Show>
			</Presence>
		</Motion>
	);
}
