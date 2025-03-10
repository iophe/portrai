import { Show, createResource, createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import AccountIcon from "@assets/icons/account.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import CancelIcon from "@assets/icons/cancel.svg?component-solid";
import { createStore } from "solid-js/store";
import api from "@utils/api";
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

	return (
		<section class="w-full bg-white rounded p-6 shadow-sm flex flex-col gap-4">
			<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
				<div class="flex flex-row gap-4">
					<AccountIcon class="fill-forest-900" />
					<h2 class="uppercase">My Account</h2>
				</div>

				<Show
					when={editing()}
					fallback={
						<button
							disabled={editing()}
							onclick={() => edit_user(true)}
						>
							<EditIcon class="fill-forest-500" />
						</button>
					}
				>
					<button
						type="button"
						class="text-gray-500 hover:text-gray-600 text-sm font-medium"
						onclick={() => {
							edit_user(false);
							// Reset form data
							set_form_data({
								full_name: account()?.full_name || undefined,
								email: account()?.email || undefined,
								phone: account()?.phone || undefined,
								location: account()?.location || undefined,
							});
						}}
					>
						<CancelIcon class="fill-forest-900" />
					</button>
				</Show>
			</header>

			<Show
				when={editing()}
				fallback={
					<div class="flex flex-col gap-4">
						<article class="flex flex-col gap-1">
							<h3 class="text-lg text-forest-700 font-medium">
								Full Name
							</h3>
							<p class="text-forest-900">
								{account()?.full_name || "Not specified"}
							</p>
						</article>

						<article class="flex flex-col gap-1">
							<h3 class="text-lg text-forest-700 font-medium">
								Email
							</h3>
							<p class="text-forest-900">
								{account()?.email || "Not specified"}
							</p>
						</article>

						<article class="flex flex-col gap-1">
							<h3 class="text-lg text-forest-700 font-medium">
								Phone
							</h3>
							<p class="text-forest-900">
								{account()?.phone || "Not specified"}
							</p>
						</article>

						<article class="flex flex-col gap-1">
							<h3 class="text-lg text-forest-700 font-medium">
								Location
							</h3>
							<p class="text-forest-900">
								{account()?.location || "Not specified"}
							</p>
						</article>
					</div>
				}
			>
				<form
					class=" flex flex-col gap-2"
					onSubmit={async (e) => {
						e.preventDefault();
						try {
							await api.post("/account/user/update", form_data);
							edit_user(false);
							refetch();
						} catch (error) {}
					}}
				>
					<FormLabeledInput label="Full Name">
						<FormInputText
							value={form_data.full_name ?? ""}
							on_input={(value) =>
								set_form_data("full_name", value)
							}
							placeholder="Write your full name"
						/>
					</FormLabeledInput>

					<FormLabeledInput label="Email">
						<FormInputText
							value={form_data.email ?? ""}
							on_input={(value) => set_form_data("email", value)}
							placeholder="Write your email"
						/>
					</FormLabeledInput>
					<FormLabeledInput label="Phone">
						<FormInputTelephone
							value={form_data.phone ?? ""}
							on_input={(value) => set_form_data("phone", value)}
							placeholder="Write your phone number"
						/>
					</FormLabeledInput>

					<FormLabeledInput label="Location">
						<FormInputText
							value={form_data.location ?? ""}
							on_input={(value) =>
								set_form_data("location", value)
							}
							placeholder="Write your location"
						/>
					</FormLabeledInput>
					<div class="self-end">
						<FormSubmitButton />
					</div>
				</form>
			</Show>
		</section>
	);
}
