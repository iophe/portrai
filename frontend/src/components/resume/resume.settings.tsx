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
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import api from "@utils/api";
import { AxiosError } from "axios";
import LoadingSpinner from "@components/loading.spinner";
import { ItemText } from "./utils/item.content";
import { clear_cache, createCachedResource } from "@utils/cache";
import { useNavigate } from "@solidjs/router";
import { ProcessMajorError } from "@utils/api";
import { En, Fr, Lang } from "@components/language";

interface ResumeSettingsProps {
	offline?: boolean;
	on_refetch: () => void;
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
	const [versions, { mutate, refetch: refetch_version_inner }] =
		createCachedResource(
			async () => {
				if (props.offline) return;
				try {
					const response = await api.get("/resume/versions");
					const result = response.data as UserResumeVersions;

					return result;
				} catch (error) {
					ProcessMajorError(error, navigate, fault);
					return;
				}
			},
			{ cache_key: "ResumeSettings:/resume/versions" },
			(result) => {
				if (result) {
					update_version_form_data(
						"current_version",
						result.current_version
					);
				}
			}
		);
	function refetch_version() {
		refetch_version_inner();
		props.on_refetch();
	}
	const [
		profile,
		{ mutate: mutate_profile, refetch: refetch_profile_inner },
	] = createCachedResource(
		async () => {
			try {
				const response = await api.get("/account/profile");
				const result = response.data.profile as Profile;

				return result;
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
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
	function refetch_profile() {
		refetch_profile_inner();
		props.on_refetch();
	}
	const [editing_version, edit_version] = createSignal(false);
	const [adding_version, add_version] = createSignal(false);

	const [editing_profile, edit_profile] = createSignal(false);

	return (
		<Motion.section
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, easing: "ease-out" }}
			class="flex flex-col gap-4 pb-4"
		>
			<Motion.section
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
				class="p-4 border bg-white border-lapis-50 rounded-lg flex flex-col gap-4 relative overflow-hidden"
			>
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
					<Motion.div
						initial={{ x: -5, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						class="flex flex-row gap-4"
					>
						<AccountIcon class="min-w-fit fill-forest-900" />
						<h2 class="uppercase">						<Lang>
						{[
							<En>My profile</En>,
							<Fr>Mon profil</Fr>
						]}
					</Lang> </h2>
					</Motion.div>
					<Show
						when={editing_profile()}
						fallback={
							<Motion.button
								hover={{ scale: 1.1 }}
								press={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
								disabled={editing_profile()}
								onclick={() => edit_profile(true)}
							>
								<EditIcon class="min-w-fit fill-forest-500" />
							</Motion.button>
						}
					>
						<Motion.button
							hover={{ scale: 1.1 }}
							press={{ scale: 0.95 }}
							transition={{ duration: 0.1 }}
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
							<CancelIcon class="min-w-fit fill-forest-900" />
						</Motion.button>
					</Show>
				</header>
				<Presence>
					<Show
						when={editing_profile()}
						fallback={
							<Motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
								class="flex flex-col gap-4"
							>
								<Motion.article
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.2,
										delay: 0.1,
									}}
									class="flex flex-col gap-1"
								>
									<h3 class="text-lg text-forest-700 font-medium">
									<Lang>
									{[
										<En>Self description</En>,
										<Fr>Auto description</Fr>
									]}
								</Lang> 
									</h3>
									<ItemText>
										<Show
											when={profile()?.description}
											fallback="Not specified"
										>
											{profile()?.description}
										</Show>
									</ItemText>
								</Motion.article>

								<Motion.article
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.2,
										delay: 0.2,
									}}
									class="flex flex-col gap-1"
								>
									<h3 class="text-lg text-forest-700 font-medium">
										Linkedin
									</h3>
									<a
										class="text-forest-900"
										href={profile()?.linkedin ?? ""}
									>
										{profile()?.linkedin || "Not specified"}
									</a>
								</Motion.article>

								<Motion.article
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.2,
										delay: 0.3,
									}}
									class="flex flex-col gap-1"
								>
									<h3 class="text-lg text-forest-700 font-medium">
									<Lang>
									{[
										<En>Website</En>,
										<Fr>Site internet</Fr>
									]}
								</Lang> 
									</h3>
									<a
										class="text-forest-900"
										href={profile()?.website ?? ""}
									>
										{profile()?.website || "Not specified"}
									</a>
								</Motion.article>
							</Motion.div>
						}
					>
						<Motion.form
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.3 }}
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
									value={profile_form_data.description ?? ""}
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
									value={profile_form_data.linkedin ?? ""}
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
									value={profile_form_data.website ?? ""}
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
						</Motion.form>
					</Show>
				</Presence>
			</Motion.section>

			<Show when={!props.offline}>
				<Motion.article
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					class="p-5 border border-lapis-50 rounded-lg flex flex-col gap-4 relative overflow-hidden bg-white shadow-sm"
				>
					{/* Accent line */}
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
							width: "4px",
							height: "100%",
							"background-color": "var(--forest-300)",
						}}
					></Motion>

					{/* Header with improved visual hierarchy */}
					<header class="flex justify-between items-center border-b-2 border-forest-900 pb-3">
						<Motion.hgroup
							initial={{ x: -5, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.2 }}
							class="flex flex-row gap-4 items-center"
						>
							<ArticleIcon class="min-w-fit fill-forest-600" />
							<div class="flex flex-col">
								<h2 class="font-semibold text-forest-900 text-lg">
								<Lang>
									{[
										<En>Resume Versions</En>,
										<Fr>Versions du CV</Fr>
									]}
								</Lang> 
								</h2>
								<p class="text-sm text-forest-600">
								<Lang>
									{[
										<En>Create targeted resumes for different opportunities</En>,
										<Fr>Créez des CV ciblés pour différentes opportunités</Fr>
									]}
								</Lang> 
								</p>
							</div>
						</Motion.hgroup>
					</header>

					{/* Value proposition */}
					<aside class="text-sm text-lapis-500 flex items-center gap-2">
						<HelpIcon class="min-w-fit fill-lapis-400" />
						<p>
						<Lang>
									{[
										<En>Customize different versions of your resume for specific industries, positions, or languages</En>,
										<Fr>Personnalisez différentes versions de votre CV pour des secteurs, des postes ou des langues spécifiques.</Fr>
									]}
								</Lang> 
						</p>
					</aside>

					{/* Main content with improved visual cues */}
					<section class="flex flex-col gap-4">
						<Suspense fallback={<LoadingSpinner />}>
							{/* Version display/edit mode */}
							<Show
								when={editing_version()}
								fallback={
									<Motion.article
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.2 }}
										class="flex flex-row items-center justify-between rounded-md"
									>
										<hgroup class="flex flex-col">
											<h3 class="text-sm text-forest-600">
											<Lang>
												{[
													<En>Active Resume</En>,
													<Fr>CV actif</Fr>
												]}
											</Lang> 
											</h3>
											<strong class="text-forest-900 text-lg">
												{versions()?.current_version ||
													"Default"}
											</strong>
										</hgroup>
										<nav class="flex flex-row gap-4">
											<Motion.button
												hover={{
													scale: 1.05,
												}}
												press={{
													scale: 0.98,
												}}
												transition={{
													duration: 0.1,
												}}
												class=""
												title="Edit version name"
												onclick={() => {
													edit_version(true);
												}}
											>
												<EditIcon class="min-w-fit fill-forest-700" />
											</Motion.button>
											<Motion.button
												hover={{
													scale: 1.05,
												}}
												press={{
													scale: 0.98,
												}}
												transition={{
													duration: 0.1,
												}}
												title="Delete this version"
												onclick={async () => {
													if (
														(versions()
															?.all_versions
															.length ?? 0) <= 1
													) {
														fault.minor({
															message:
																"Cannot delete this version, this is your only version",
														});
														return;
													}

													const ok = confirm(
														"Are you sure you want to delete this version?"
													);
													if (ok) {
														try {
															await api.post(
																"/resume/delete-version",
																{
																	version:
																		versions()
																			?.current_version,
																}
															);
															refetch_version();
															refetch_profile();
														} catch (error) {
															ProcessMajorError(
																error,
																navigate,
																fault
															);
														}
													}
												}}
											>
												<DeleteIcon class="min-w-fit fill-forest-700" />
											</Motion.button>
										</nav>
									</Motion.article>
								}
							>
								{/* Rename version mode */}
								<Motion.article
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									class="flex flex-row items-center justify-between gap-4 rounded-md"
								>
									<label class="flex flex-col grow gap-2 justify-start">
										<span class="text-forest-700 font-medium">
											<Lang>
												{[
													<En>Rename to:</En>,
													<Fr>Renommer en:</Fr>
												]}
											</Lang> 
										</span>
										<div class="flex flex-row items-center gap-4">
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
																		?.current_version,
																new_name:
																	version_form_data.current_version,
															}
														);
														refetch_version();
														refetch_profile();
													} catch (error) {
														ProcessMajorError(
															error,
															navigate,
															fault
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
													placeholder="Enter new version name"
												/>
											</form>

											<Motion.button
												hover={{
													scale: 1.05,
												}}
												press={{
													scale: 0.98,
												}}
												transition={{
													duration: 0.1,
												}}
												title="Cancel renaming"
												onclick={() => {
													edit_version(false);
												}}
											>
												<CloseIcon class="min-w-fit fill-forest-700" />
											</Motion.button>
										</div>
									</label>
								</Motion.article>
							</Show>

							{/* Version switcher with improved UI */}
							<fieldset class="flex flex-col gap-2 mt-1 border-0">
								<legend class="text-sm text-forest-600 mb-1">
								<Lang>
												{[
													<En>Switch between versions</En>,
													<Fr>Basculer entre les versions</Fr>
												]}
											</Lang> 
									
								</legend>
								<menu class="flex gap-2 flex-wrap mt-1 p-0 items-center">
									<For each={versions()?.all_versions}>
										{(version) => (
											<li
												class="text-xs px-2 py-1 rounded"
												classList={{
													"bg-forest-50 text-forest-800":
														versions()
															?.current_version ===
														version,
													"bg-gray-100 text-gray-600":
														versions()
															?.current_version !==
														version,
												}}
											>
												<button
													title={`change version to ${version}`}
													class="w-full"
													onclick={async () => {
														try {
															await api.post(
																"/resume/change-version",
																{
																	version:
																		version,
																}
															);
															clear_cache();
															refetch_version();
															refetch_profile();
														} catch (error) {
															ProcessMajorError(
																error,
																navigate,
																fault
															);
														}
													}}
												>
													{version}
												</button>
											</li>
										)}
									</For>
									<Motion.button
										hover={{ scale: 1.05 }}
										press={{ scale: 0.98 }}
										transition={{ duration: 0.1 }}
										onClick={() => {
											add_version(true);
										}}
										title="Create a new version"
									>
										<AddIcon class="min-w-fit fill-forest-800 " />
									</Motion.button>
								</menu>
							</fieldset>

							<Presence>
								<Show when={adding_version()}>
									<Motion.article
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.2 }}
										class="flex flex-col gap-4 mt-2 p-4 border border-forest-100 rounded-md "
									>
										<header class="flex items-center gap-2">
											<h3 class="font-medium text-forest-700">
											<Lang>
												{[
													<En>Create New Resume Version</En>,
													<Fr>Créer une nouvelle version de CV</Fr>
												]}
											</Lang> 
												
											</h3>
											<HelpIcon class="min-w-fit fill-lapis-400" />
											<p class="text-xs text-lapis-500">
											<Lang>
												{[
													<En>Each version keeps its own content and settings</En>,
													<Fr>Chaque version conserve son propre contenu et ses propres paramètres</Fr>
												]}
											</Lang> 
											</p>
										</header>
										<p class="text-sm text-forest-600">
										<Lang>
												{[
													<En>Create targeted versions fordifferent opportunities (e.g.,"Teaching Position", "French Resume")</En>,
													<Fr>Créez des versions ciblées pour différentes opportunités (par exemple, « Poste d'enseignant », « CV français »)</Fr>
												]}
											</Lang> 
										</p>
										<footer class="flex flex-row items-center justify-between gap-4">
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
												placeholder="Enter version name"
											/>
											<nav class="flex flex-row gap-2">
												<Show
													when={
														version_form_data
															.new_version
															.length > 0
													}
												>
													<Motion.button
														hover={{
															scale: 1.05,
														}}
														press={{
															scale: 0.98,
														}}
														transition={{
															duration: 0.1,
														}}
														class="bg-forest-500 hover:bg-forest-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium"
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
																ProcessMajorError(
																	error,
																	navigate,
																	fault
																);
															}
														}}
													>
																									<Lang>
												{[
													<En>Create Version</En>,
													<Fr>Créer une nouvelle version</Fr>
												]}
											</Lang> 
													</Motion.button>
												</Show>
												<Motion.button
													hover={{
														scale: 1.05,
													}}
													press={{
														scale: 0.98,
													}}
													transition={{
														duration: 0.1,
													}}
													class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm"
													title="Cancel"
													onclick={() => {
														add_version(false);
													}}
												>
													<Lang>
												{[
													<En>Cancel</En>,
													<Fr>Annuler</Fr>
												]}
											</Lang> 
													
												</Motion.button>
											</nav>
										</footer>
									</Motion.article>
								</Show>
							</Presence>

							{/* Usage tips section */}
							<Show
								when={!adding_version() && !editing_version()}
							>
								<footer class="mt-2 border-t border-forest-100 pt-3">
									<h4 class="text-sm font-medium text-forest-700 mb-2">
									<Lang>
												{[
													<En>Resume Version Ideas:</En>,
													<Fr>Idées de versions de CV:</Fr>
												]}
											</Lang> 
										
									</h4>
									<ul class="flex gap-2 flex-wrap">
										<li class="bg-lapis-50 text-lapis-800 px-3 py-1 rounded-md text-xs">
										<Lang>
												{[
													<En>Industry-specific</En>,
													<Fr>Spécialisé pour une industrie</Fr>
												]}
											</Lang>
										</li>
										<li class="bg-lapis-50 text-lapis-800 px-3 py-1 rounded-md text-xs">
										<Lang>
												{[
													<En>Industry-specific</En>,
													<Fr>Spécialisé pour une industrie</Fr>
												]}
											</Lang>
										</li>
										<li class="bg-lapis-50 text-lapis-800 px-3 py-1 rounded-md text-xs">
										<Lang>
												{[
													<En>Role-focused</En>,
													<Fr>Spécialisé pour une emploi</Fr>
												]}
											</Lang>
										</li>
										<li class="bg-lapis-50 text-lapis-800 px-3 py-1 rounded-md text-xs">
										<Lang>
												{[
													<En>Skill-focused</En>,
													<Fr>Spécialisé pour des compétences</Fr>
												]}
											</Lang>
										</li>
									</ul>
								</footer>
							</Show>
						</Suspense>
					</section>
				</Motion.article>
			</Show>
		</Motion.section>
	);
}

export default ResumeSettings;
