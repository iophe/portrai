import {
	Show,
	createResource,
	createSignal,
	onMount,
	For,
	Switch,
	Match,
} from "solid-js";
import { A } from "@solidjs/router";
import AccountIcon from "@assets/icons/account.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import CancelIcon from "@assets/icons/cancel.svg?component-solid";
import { createStore } from "solid-js/store";
import api from "@utils/api";
import { Motion, Presence } from "solid-motionone";
import {
	FormInputTelephone,
	FormInputText,
	FormLabeledInput,
	FormSubmitButton,
} from "@components/resume/utils/form.input";
import { createCachedResource } from "@utils/cache";
import {
	En,
	Fr,
	Lang,
	LangProvider,
	Test,
	useLang,
} from "@components/language";

interface AccountSectionProps {}

export function AccountSection(props: AccountSectionProps) {
	const [editing, edit_user] = createSignal(false);
	const [form_data, set_form_data] = createStore<User>({
		full_name: undefined,
		email: undefined,
		phone: undefined,
		location: undefined,
	});

	const [account, { refetch }] = createCachedResource(
		async () => {
			try {
				const res = await api.get("/account/user");
				const user = res.data.user as User;

				return user;
			} catch (error) {}
		},
		{ cache_key: "/account/user" },
		(user) => {
			set_form_data({
				full_name: user?.full_name || "",
				email: user?.email || "",
				phone: user?.phone || "",
				location: user?.location || "",
			});
		}
	);

	// Define field data for both display and form views
	const fieldDefinitions = [
		{
			id: "full_name",
			label: "Full Name",
			getValue: () => account()?.full_name,
			formValue: () => form_data.full_name ?? "",
			setter: (value: string) => set_form_data("full_name", value),
			en_placeholder: "Write your full name",
			fr_placeholder: "Écrivez votre nom complet",
			component: FormInputText,
		},
		{
			id: "email",
			label: "Email",
			getValue: () => account()?.email,
			formValue: () => form_data.email ?? "",
			setter: (value: string) => set_form_data("email", value),
			en_placeholder: "Write your email",
			fr_placeholder: "Écrivez votre adresse email",
			component: FormInputText,
		},
		{
			id: "phone",
			label: "Phone",
			getValue: () => account()?.phone,
			formValue: () => form_data.phone ?? "",
			setter: (value: string) => set_form_data("phone", value),
			en_placeholder: "Write your phone number",
			fr_placeholder: "Écrivez votre numéro de téléphone",
			component: FormInputTelephone,
		},
		{
			id: "location",
			label: "Location",
			getValue: () => account()?.location,
			formValue: () => form_data.location ?? "",
			setter: (value: string) => set_form_data("location", value),
			en_placeholder: "Write your location",
			fr_placeholder:
				"Écrivez votre lieu de résidence (exemple : Ville, Pays)",
			component: FormInputText,
		},
	];

	return (
		<Motion.section
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			class="w-full bg-white rounded p-6 shadow-sm flex flex-col gap-4"
		>
			<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
				<Motion.div
					initial={{ x: -5, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.15 }}
					class="flex flex-row gap-4"
				>
					<AccountIcon class="min-w-fit fill-forest-900" />
					<h2 class="uppercase">
						<Lang>
							<En>My Account</En>
							<Fr>Mon compte</Fr>
						</Lang>
					</h2>
				</Motion.div>

				<Switch>
					<Match when={editing()}>
						<Motion.button
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.15 }}
							press={{ scale: 0.95 }}
							type="button"
							class="text-gray-500 hover:text-gray-600 text-sm font-medium"
							onclick={() => {
								edit_user(false);
								// Reset form data
								set_form_data({
									full_name:
										account()?.full_name || undefined,
									email: account()?.email || undefined,
									phone: account()?.phone || undefined,
									location: account()?.location || undefined,
								});
							}}
							aria-label="Cancel editing"
						>
							<CancelIcon class="min-w-fit fill-forest-900" />
						</Motion.button>
					</Match>
					<Match when={!editing()}>
						<Motion.button
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.15 }}
							disabled={editing()}
							onclick={() => edit_user(true)}
							aria-label="Edit account information"
						>
							<EditIcon class="min-w-fit fill-forest-500" />
						</Motion.button>
					</Match>
				</Switch>
			</header>

			<Presence>
				<Switch>
					<Match when={!editing()}>
						<Motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							class="flex flex-col gap-4"
						>
							<For each={fieldDefinitions}>
								{(field, index) => (
									<Motion.article
										initial={{ opacity: 0, x: -5 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											duration: 0.15,
											delay: index() * 0.05, // Staggered animation using index()
										}}
										class="flex flex-col gap-1"
									>
										<h3 class="text-lg text-forest-700 font-medium">
											{field.label}
										</h3>
										<p class="text-forest-900">
											{field.getValue() ||
												"Not specified"}
										</p>
									</Motion.article>
								)}
							</For>
						</Motion.div>
					</Match>
					<Match when={editing()}>
						<Motion.form
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							class="flex flex-col gap-2"
							onSubmit={async (e) => {
								e.preventDefault();
								try {
									await api.post(
										"/account/user/update",
										form_data
									);
									edit_user(false);
									refetch();
								} catch (error) {}
							}}
						>
							<For each={fieldDefinitions}>
								{(field, index) => (
									<Motion
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.15,
											delay: index() * 0.05, // Using index() here
										}}
									>
										<FormLabeledInput label={field.label}>
											<field.component
												value={field.formValue()}
												on_input={field.setter}
												en_placeholder={
													field.en_placeholder
												}
												fr_placeholder={
													field.fr_placeholder
												}
											/>
										</FormLabeledInput>
									</Motion>
								)}
							</For>
							<div class="self-end">
								<FormSubmitButton />
							</div>
						</Motion.form>
					</Match>
				</Switch>
			</Presence>
		</Motion.section>
	);
}
