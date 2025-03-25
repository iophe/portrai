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
import { Motion, Presence } from "solid-motionone";
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
import { clear_cache, createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";

interface ResumeSettingsProps {
	offline?: boolean;
}

function ResumeSettings(props: ResumeSettingsProps) {
	const fault = useFault();
	const navigate = useNavigate();
	const [version_form_data, update_version_form_data] = createStore({
		current_version: "",
		selected_version: "",
		new_version: "",
	});
	const [profile_form_data, update_profile_form_data] = createStore<Profile>({
		linkedin: undefined,
		website: undefined,
		description: undefined,
	});
	const [versions, { mutate, refetch: refetch_version }] =
		createCachedResource(
			async () => {
				if (props.offline) return;
				try {
					const response = await api.get("/resume/versions");
					const result = response.data as UserResumeVersions;

					return result;
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
					return;
				}
			},
			{ cache_key: "ResumeSettings:/resume/versions" },
			(result) => {
				if (result) {
					update_version_form_data("current_version", result.version);
				}
			}
		);

	const [profile, { mutate: mutate_profile, refetch: refetch_profile }] =
		createCachedResource(
			async () => {
				try {
					const response = await api.get("/account/profile");
					const result = response.data.profile as Profile;

					return result;
				} catch (error) {
					fault.minor({
						message:
							((error as AxiosError).response?.data as any)
								.error ?? (error as AxiosError).message,
					});
					return;
				}
			},
			{ cache_key: "/account/profile" },
			(result) => {
				if (result) {
					update_profile_form_data(result);
				}
			}
		);
	const [editing_version, edit_version] = createSignal(false);
	const [adding_version, add_version] = createSignal(false);

	const [editing_profile, edit_profile] = createSignal(false);

	return (
		<Motion
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, easing: "ease-out" }}
		>
			<section class="flex flex-col gap-4">
				<Show when={!props.offline}>
					<Motion
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<section class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-4 relative overflow-hidden">
							<Motion
								initial={{ x: "-100%" }}
								animate={{ x: "0%" }}
								transition={{
									duration: 0.4,
									easing: "ease-out",
									delay: 0.3,
								}}
								style={{
									position: "absolute",
									left: "0",
									top: "0",
									width: "3px",
									height: "100%",
									"background-color": "var(--forest-200)",
								}}
							></Motion>
							<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
								<Motion
									initial={{ x: -5, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ duration: 0.3, delay: 0.2 }}
								>
									<div class="flex flex-row gap-4">
										<ArticleIcon class="fill-forest-900" />
										<h2 class="uppercase">
											My resume versions
										</h2>
									</div>
								</Motion>
							</header>
							<section class="flex flex-col gap-2">
								<Suspense fallback={<LoadingSpinner />}>
									<Show
										when={editing_version()}
										fallback={
											<Motion
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ duration: 0.2 }}
											>
												<div class="flex flex-row items-center justify-between">
													<span>
														Current version:{" "}
														<span class="text-forest-800">
															{
																versions()
																	?.version
															}
														</span>
													</span>
													<div class="flex flex-row gap-4">
														<Motion
															hover={{
																scale: 1.1,
															}}
															press={{
																scale: 0.95,
															}}
															transition={{
																duration: 0.1,
															}}
														>
															<button
																title="Edit"
																onclick={() => {
																	edit_version(
																		true
																	);
																}}
															>
																<EditIcon class="fill-forest-900" />
															</button>
														</Motion>
														<Motion
															hover={{
																scale: 1.1,
															}}
															press={{
																scale: 0.95,
															}}
															transition={{
																duration: 0.1,
															}}
														>
															<button
																title="delete"
																onclick={async () => {
																	if (
																		(versions()
																			?.all_versions
																			.length ??
																			0) <=
																		1
																	) {
																		fault.minor(
																			{
																				message:
																					"cannot delete this version, this is your only version",
																			}
																		);
																		return;
																	}

																	const ok =
																		confirm(
																			"Are you sure you want to delete this version?"
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
																			if (
																				(
																					error as AxiosError
																				)
																					.status ===
																				402
																			) {
																				navigate(
																					"/pricing"
																				);
																			}
																			if (
																				(
																					error as AxiosError
																				)
																					.status !==
																				401
																			)
																				fault.minor(
																					{
																						message:
																							(
																								(
																									error as AxiosError
																								)
																									.response
																									?.data as any
																							)
																								.error ??
																							(
																								error as AxiosError
																							)
																								.message,
																					}
																				);
																		}
																	}
																}}
															>
																<DeleteIcon class="fill-forest-900" />
															</button>
														</Motion>
													</div>
												</div>
											</Motion>
										}
									>
										<Motion
											initial={{ opacity: 0, y: 5 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.2 }}
										>
											<div class="flex flex-row items-center justify-between gap-4">
												<span class="flex flex-row grow gap-2 items-center ">
													<p class="text-nowrap">
														Rename to:
													</p>
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
																if (
																	(
																		error as AxiosError
																	).status ===
																	402
																) {
																	navigate(
																		"/pricing"
																	);
																}
																if (
																	(
																		error as AxiosError
																	).status !==
																	401
																)
																	fault.minor(
																		{
																			message:
																				(
																					(
																						error as AxiosError
																					)
																						.response
																						?.data as any
																				)
																					.error ??
																				(
																					error as AxiosError
																				)
																					.message,
																		}
																	);
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
												<Motion
													hover={{ scale: 1.1 }}
													press={{ scale: 0.95 }}
													transition={{
														duration: 0.1,
													}}
												>
													<button
														title="close"
														onclick={() => {
															edit_version(false);
														}}
													>
														<CloseIcon class="fill-forest-900" />
													</button>
												</Motion>
											</div>
										</Motion>
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
													clear_cache();
													refetch_version();
													refetch_profile();
												} catch (error) {
													if (
														(error as AxiosError)
															.status === 402
													) {
														navigate("/pricing");
													}
													if (
														(error as AxiosError)
															.status !== 401
													)
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
											choices={
												versions()?.all_versions ?? []
											}
											select_label="change version"
										/>
										<Motion
											hover={{ scale: 1.1 }}
											press={{ scale: 0.95 }}
											transition={{ duration: 0.1 }}
										>
											<button
												onClick={() => {
													add_version(true);
												}}
												title="add a new version"
											>
												<AddIcon class="fill-forest-900" />
											</button>
										</Motion>
									</div>
									<Presence>
										<Show when={adding_version()}>
											<Motion
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												transition={{ duration: 0.2 }}
											>
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
																version_form_data
																	.new_version
																	.length > 0
															}
														>
															<Motion
																hover={{
																	scale: 1.1,
																}}
																press={{
																	scale: 0.95,
																}}
																transition={{
																	duration: 0.1,
																}}
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
																			add_version(
																				false
																			);
																		} catch (error) {
																			if (
																				(
																					error as AxiosError
																				)
																					.status ===
																				402
																			) {
																				navigate(
																					"/pricing"
																				);
																			}
																			if (
																				(
																					error as AxiosError
																				)
																					.status !==
																				401
																			)
																				fault.minor(
																					{
																						message:
																							(
																								(
																									error as AxiosError
																								)
																									.response
																									?.data as any
																							)
																								.error ??
																							(
																								error as AxiosError
																							)
																								.message,
																					}
																				);
																		}
																	}}
																	title="add a new version"
																>
																	<AddIcon class="fill-forest-900" />
																</button>
															</Motion>
														</Show>
														<Motion
															hover={{
																scale: 1.1,
															}}
															press={{
																scale: 0.95,
															}}
															transition={{
																duration: 0.1,
															}}
														>
															<button
																title="close"
																onclick={() => {
																	add_version(
																		false
																	);
																}}
															>
																<CloseIcon class="fill-forest-900" />
															</button>
														</Motion>
													</div>
												</div>
											</Motion>
										</Show>
									</Presence>
								</Suspense>
							</section>
						</section>
					</Motion>
				</Show>

				<Motion
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<section class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-4 relative overflow-hidden">
						<Motion
							initial={{ x: "-100%" }}
							animate={{ x: "0%" }}
							transition={{
								duration: 0.4,
								easing: "ease-out",
								delay: 0.4,
							}}
							style={{
								position: "absolute",
								left: "0",
								top: "0",
								width: "3px",
								height: "100%",
								"background-color": "var(--lapis-200)",
							}}
						></Motion>
						<header class="flex justify-between items-center border-b-2 border-forest-900 pb-2">
							<Motion
								initial={{ x: -5, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.3, delay: 0.3 }}
							>
								<div class="flex flex-row gap-4">
									<AccountIcon class="fill-forest-900" />
									<h2 class="uppercase">My profile</h2>
								</div>
							</Motion>
							<Show
								when={editing_profile()}
								fallback={
									<Motion
										hover={{ scale: 1.1 }}
										press={{ scale: 0.95 }}
										transition={{ duration: 0.1 }}
									>
										<button
											disabled={editing_profile()}
											onclick={() => edit_profile(true)}
										>
											<EditIcon class="fill-forest-500" />
										</button>
									</Motion>
								}
							>
								<Motion
									hover={{ scale: 1.1 }}
									press={{ scale: 0.95 }}
									transition={{ duration: 0.1 }}
								>
									<button
										type="button"
										class="text-gray-500 hover:text-gray-600 text-sm font-medium smooth-transition"
										onclick={() => {
											edit_profile(false);
											// Reset form data
											update_profile_form_data({
												linkedin: profile()?.linkedin,
												website: profile()?.website,
												description:
													profile()?.description,
											});
										}}
									>
										<CancelIcon class="fill-forest-900" />
									</button>
								</Motion>
							</Show>
						</header>
						<Presence>
							<Show
								when={editing_profile()}
								fallback={
									<Motion
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3 }}
									>
										<div class="flex flex-col gap-4">
											<Motion
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													duration: 0.2,
													delay: 0.1,
												}}
											>
												<article class="flex flex-col gap-1">
													<h3 class="text-lg text-forest-700 font-medium">
														Self description
													</h3>
													<ItemText>
														{profile()
															?.description ||
															"Not specified"}
													</ItemText>
												</article>
											</Motion>

											<Motion
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													duration: 0.2,
													delay: 0.2,
												}}
											>
												<article class="flex flex-col gap-1">
													<h3 class="text-lg text-forest-700 font-medium">
														Linkedin
													</h3>
													<a
														class="text-forest-900"
														href={
															profile()
																?.linkedin ?? ""
														}
													>
														{profile()?.linkedin ||
															"Not specified"}
													</a>
												</article>
											</Motion>

											<Motion
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													duration: 0.2,
													delay: 0.3,
												}}
											>
												<article class="flex flex-col gap-1">
													<h3 class="text-lg text-forest-700 font-medium">
														Website
													</h3>
													<a
														class="text-forest-900"
														href={
															profile()
																?.website ?? ""
														}
													>
														{profile()?.website ||
															"Not specified"}
													</a>
												</article>
											</Motion>
										</div>
									</Motion>
								}
							>
								<Motion
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									transition={{ duration: 0.3 }}
								>
									<form
										class="flex flex-col gap-2"
										onSubmit={async (e) => {
											e.preventDefault();
											try {
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
												value={
													profile_form_data.description ??
													""
												}
												on_input={(value) => {
													update_profile_form_data(
														"description",
														value
													);
												}}
												placeholder="Write your description"
											/>
										</FormLabeledInput>
										<FormLabeledInput label="Linkedin">
											<FormInputText
												value={
													profile_form_data.linkedin ??
													""
												}
												on_input={(value) =>
													update_profile_form_data(
														"linkedin",
														value
													)
												}
												placeholder="Write your linkedin link"
											/>
										</FormLabeledInput>

										<FormLabeledInput label="Website">
											<FormInputText
												value={
													profile_form_data.website ??
													""
												}
												on_input={(value) =>
													update_profile_form_data(
														"website",
														value
													)
												}
												placeholder="Write your website link"
											/>
										</FormLabeledInput>

										<div class="self-end">
											<FormSubmitButton />
										</div>
									</form>
								</Motion>
							</Show>
						</Presence>
					</section>
				</Motion>
			</section>
		</Motion>
	);
}

export default ResumeSettings;
