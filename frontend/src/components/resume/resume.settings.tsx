import { useFault } from "@components/fault";
import FormArticle from "./utils/form.article";
import {
	FormInputText,
	FormLabeledInput,
	FormSelect,
	FormSubmitButton,
	FormTextArea,
} from "./utils/form.input";
import { createStore } from "solid-js/store";
import AddIcon from "@assets/icons/add.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import AccountIcon from "@assets/icons/account.svg?component-solid";
import ArticleIcon from "@assets/icons/article.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import CancelIcon from "@assets/icons/cancel.svg?component-solid";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import api from "@utils/api";
import { AxiosError } from "axios";
import LoadingSpinner from "@components/loading.spinner";
import { ItemText } from "./utils/item.content";

interface ResumeSettingsProps {
	offline?: boolean;
}

function ResumeSettings(props: ResumeSettingsProps) {
	const fault = useFault();

	const [versions, { mutate, refetch:refetch_version }] = createResource(async () => {
		if (props.offline) return;
		try {
			const response = await api.get("/resume/versions");
			const result = response.data as UserResumeVersions;

			update_version_form_data("current_version", result.version);
			return result;
		} catch (error) {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
			return;
		}
	});

	const [profile, { mutate: mutate_profile, refetch: refetch_profile }] =
		createResource(async () => {
			try {
				const response = await api.get("/account/profile");
				const result = response.data.profile as Profile;

				update_profile_form_data(result);
				return result;
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
				return;
			}
		});
	const [editing_version, edit_version] = createSignal(false);
	const [adding_version, add_version] = createSignal(false);
	const [version_form_data, update_version_form_data] = createStore({
		current_version: "",
		selected_version: "",
		new_version: "",
	});
	const [editing_profile, edit_profile] = createSignal(false);
	const [profile_form_data, update_profile_form_data] = createStore<Profile>({
		linkedin: profile()?.linkedin || undefined,
		website: profile()?.website || undefined,
		description: profile()?.description || undefined,
	});
	return (
		<section class="flex flex-col gap-4">
			<Show when={!props.offline}>
				<section class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-4">
					<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
						<div class="flex flex-row gap-4">
							<ArticleIcon class="fill-forest-900" />
							<h2 class="uppercase">My resume versions</h2>
						</div>
					</header>
					<section class="flex flex-col gap-2">
						<Suspense fallback={<LoadingSpinner />}>
							<Show
								when={editing_version()}
								fallback={
									<div class="flex flex-row items-center justify-between">
										<span>
											Current version:{" "}
											<span class="text-forest-800">
												{versions()?.version}
											</span>
										</span>
										<div class="flex flex-row gap-4">
											<button
												title="Edit"
												onclick={() => {
													edit_version(true);
												}}
											>
												<EditIcon class="fill-forest-900" />
											</button>
											<button
												title="delete"
												onclick={async () => {
													if (
														(versions()
															?.all_versions
															.length ?? 0) <= 1
													) {
														fault.minor({
															message:
																"cannot delete this version, this is your only version",
														});
														return;
													}

													const ok = confirm(
														"Are you sure you want to delete  this version ?"
													);
													if (ok) {
														try {
															await api.post(
																"/resume/delete-version",
																{
																	version:
																		versions()
																			?.version,
																}
															);
															refetch_version();
															refetch_profile();
														} catch (error) {
															fault.minor({
																message:
																	(
																		(
																			error as AxiosError
																		)
																			.response
																			?.data as any
																	).error ??
																	(
																		error as AxiosError
																	).message,
															});
														}
													}
												}}
											>
												<DeleteIcon class="fill-forest-900" />
											</button>
										</div>
									</div>
								}
							>
								<div class="flex flex-row items-center justify-between gap-4">
									<span class="flex flex-row grow gap-2 items-center ">
										<p class="text-nowrap">Rename to:</p>
										<form
											class="w-full"
											onSubmit={async (e) => {
												e.preventDefault();
												try {
													await api.post(
														"/resume/rename-version",
														{
															old_name:
																versions()
																	?.version,
															new_name:
																version_form_data.current_version,
														}
													);
													refetch_version();
													refetch_profile();
												} catch (error) {
													fault.minor({
														message:
															(
																(
																	error as AxiosError
																).response
																	?.data as any
															).error ??
															(
																error as AxiosError
															).message,
													});
												}
												edit_version(false);
											}}
										>
											<FormInputText
												value={
													version_form_data.current_version
												}
												on_input={(value) =>
													update_version_form_data(
														"current_version",
														value
													)
												}
												placeholder="Rename this version"
											/>
										</form>
									</span>
									<button
										title="close"
										onclick={() => {
											edit_version(false);
										}}
									>
										<CloseIcon class="fill-forest-900" />
									</button>
								</div>
							</Show>
							<div class="flex flex-row gap-4 items-center justify-between">
								<FormSelect
									value={""}
									on_input={async (value) => {
										update_version_form_data(
											"selected_version",
											value
										);

										if (
											!version_form_data.selected_version ||
											version_form_data.selected_version ===
												version_form_data.current_version
										)
											return;
										try {
											await api.post(
												"/resume/change-version",
												{
													version:
														version_form_data.selected_version,
												}
											);
											refetch_version();
											refetch_profile();
										} catch (error) {
											fault.minor({
												message:
													(
														(error as AxiosError)
															.response
															?.data as any
													).error ??
													(error as AxiosError)
														.message,
											});
										}
									}}
									choices={versions()?.all_versions ?? []}
									select_label="change version"
								/>
								<button
									onClick={() => {
										add_version(true);
									}}
									title="add a new version"
								>
									<AddIcon class="fill-forest-900" />
								</button>
							</div>
							<Show when={adding_version()}>
								<div class="flex flex-row items-center justify-between gap-4">
									<span class="flex flex-row grow gap-2 items-center">
										<p class="text-nowrap">
											Add a new version{" "}
										</p>

										<FormInputText
											value={
												version_form_data.new_version
											}
											on_input={(value) =>
												update_version_form_data(
													"new_version",
													value
												)
											}
											placeholder="version name eg. French resume"
										/>
									</span>
									<div class="flex flex-row gap-4">
										<Show
											when={
												version_form_data.new_version
													.length > 0
											}
										>
											<button
												onClick={async () => {
													try {
														await api.post(
															"/resume/add-version",
															{
																new_version:
																	version_form_data.new_version,
															}
														);
														refetch_version();
														refetch_profile();
														add_version(false);
													} catch (error) {
														fault.minor({
															message:
																(
																	(
																		error as AxiosError
																	).response
																		?.data as any
																).error ??
																(
																	error as AxiosError
																).message,
														});
													}
												}}
												title="add a new version"
											>
												<AddIcon class="fill-forest-900" />
											</button>
										</Show>
										<button
											title="close"
											onclick={() => {
												add_version(false);
											}}
										>
											<CloseIcon class="fill-forest-900" />
										</button>
									</div>
								</div>
							</Show>
						</Suspense>
					</section>
				</section>
			</Show>

			<section class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-4">
				<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
					<div class="flex flex-row gap-4">
						<AccountIcon class="fill-forest-900" />
						<h2 class="uppercase">My profile</h2>
					</div>

					<Show
						when={editing_profile()}
						fallback={
							<button
								disabled={editing_profile()}
								onclick={() => edit_profile(true)}
							>
								<EditIcon class="fill-forest-500" />
							</button>
						}
					>
						<button
							type="button"
							class="text-gray-500 hover:text-gray-600 text-sm font-medium"
							onclick={() => {
								edit_profile(false);
								// Reset form data
								update_profile_form_data({
									linkedin: profile()?.linkedin,
									website: profile()?.website,
									description: profile()?.description,
								});
							}}
						>
							<CancelIcon class="fill-forest-900" />
						</button>
					</Show>
				</header>
				<Show
					when={editing_profile()}
					fallback={
						<div class="flex flex-col gap-4">
							<article class="flex flex-col gap-1">
								<h3 class="text-lg text-forest-700 font-medium">
									Self description
								</h3>
								<ItemText>
									{profile()?.description || "Not specified"}
								</ItemText>
							</article>
							<article class="flex flex-col gap-1">
								<h3 class="text-lg text-forest-700 font-medium">
									Linkedin
								</h3>
								<a
									class="text-forest-900"
									href={profile()?.linkedin ?? ""}
								>
									{profile()?.linkedin || "Not specified"}
								</a>
							</article>

							<article class="flex flex-col gap-1">
								<h3 class="text-lg text-forest-700 font-medium">
									Website
								</h3>
								<a
									class="text-forest-900"
									href={profile()?.website ?? ""}
								>
									{profile()?.website || "Not specified"}
								</a>
							</article>
						</div>
					}
				>
					<form
						class=" flex flex-col gap-2"
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								console.log(profile_form_data.description);
								
								await api.post(
									"/account/profile/update",
									profile_form_data
								);
								edit_profile(false);
								refetch_profile();
							} catch (error) {}
						}}
					>
						<FormLabeledInput label="Description">
							<FormTextArea
								value={profile_form_data.description ?? ""}
								on_input={(value) => {
									update_profile_form_data(
										"description",
										value
									)
								}}
								placeholder="Write your description"
							/>
						</FormLabeledInput>
						<FormLabeledInput label="Linkedin">
							<FormInputText
								value={profile_form_data.linkedin ?? ""}
								on_input={(value) =>
									update_profile_form_data("linkedin", value)
								}
								placeholder="Write your linkedin link"
							/>
						</FormLabeledInput>

						<FormLabeledInput label="Website">
							<FormInputText
								value={profile_form_data.website ?? ""}
								on_input={(value) =>
									update_profile_form_data("website", value)
								}
								placeholder="Write your website link"
							/>
						</FormLabeledInput>

						<div class="self-end">
							<FormSubmitButton />
						</div>
					</form>
				</Show>
			</section>
		</section>
	);
}

export default ResumeSettings;
