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
			placeholder: "Write your full name",
			component: FormInputText,
		},
		{
			id: "email",
			label: "Email",
			getValue: () => account()?.email,
			formValue: () => form_data.email ?? "",
			setter: (value: string) => set_form_data("email", value),
			placeholder: "Write your email",
			component: FormInputText,
		},
		{
			id: "phone",
			label: "Phone",
			getValue: () => account()?.phone,
			formValue: () => form_data.phone ?? "",
			setter: (value: string) => set_form_data("phone", value),
			placeholder: "Write your phone number",
			component: FormInputTelephone,
		},
		{
			id: "location",
			label: "Location",
			getValue: () => account()?.location,
			formValue: () => form_data.location ?? "",
			setter: (value: string) => set_form_data("location", value),
			placeholder: "Write your location",
			component: FormInputText,
		},
	];

	return (
		<Motion
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<section class="w-full bg-white rounded p-6 shadow-sm flex flex-col gap-4">
				<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
					<Motion
						initial={{ x: -5, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.15 }}
					>
						<div class="flex flex-row gap-4">
							<AccountIcon class="fill-forest-900" />
							<h2 class="uppercase">My Account</h2>
						</div>
					</Motion>

					<Switch>
						<Match when={editing()}>
							<Motion
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.15 }}
								press={{ scale: 0.95 }}
							>
								<button
									type="button"
									class="text-gray-500 hover:text-gray-600 text-sm font-medium smooth-transition"
									onclick={() => {
										edit_user(false);
										// Reset form data
										set_form_data({
											full_name:
												account()?.full_name ||
												undefined,
											email:
												account()?.email || undefined,
											phone:
												account()?.phone || undefined,
											location:
												account()?.location ||
												undefined,
										});
									}}
									aria-label="Cancel editing"
								>
									<CancelIcon class="fill-forest-900" />
								</button>
							</Motion>
						</Match>
						<Match when={!editing()}>
							<Motion
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.15 }}
							>
								<button
									disabled={editing()}
									onclick={() => edit_user(true)}
									aria-label="Edit account information"
								>
									<EditIcon class="fill-forest-500" />
								</button>
							</Motion>
						</Match>
					</Switch>
				</header>

				<Presence>
					<Switch>
						<Match when={!editing()}>
							<Motion
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<div class="flex flex-col gap-4">
									<For each={fieldDefinitions}>
										{(field, index) => (
											<Motion
												initial={{ opacity: 0, x: -5 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{
													duration: 0.15,
													delay: index() * 0.05, // Staggered animation using index()
												}}
											>
												<article class="flex flex-col gap-1">
													<h3 class="text-lg text-forest-700 font-medium">
														{field.label}
													</h3>
													<p class="text-forest-900">
														{field.getValue() ||
															"Not specified"}
													</p>
												</article>
											</Motion>
										)}
									</For>
								</div>
							</Motion>
						</Match>
						<Match when={editing()}>
							<Motion
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
							>
								<form
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
												<FormLabeledInput
													label={field.label}
												>
													<field.component
														value={field.formValue()}
														on_input={field.setter}
														placeholder={
															field.placeholder
														}
													/>
												</FormLabeledInput>
											</Motion>
										)}
									</For>
									<div class="self-end">
										<FormSubmitButton />
									</div>
								</form>
							</Motion>
						</Match>
					</Switch>
				</Presence>
			</section>
		</Motion>
	);
}
