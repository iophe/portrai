import { useFault } from "@components/fault";
import FormArticle from "./utils/form.article";
import {
	FormInputText,
	FormLabeledInput,
	FormSelect,
} from "./utils/form.input";
import { createStore } from "solid-js/store";
import AddIcon from "@assets/icons/add.svg?component-solid";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import DeleteIcon from "@assets/icons/delete.svg?component-solid";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import api from "@utils/api";
import { AxiosError } from "axios";
import LoadingSpinner from "@components/loading.spinner";

interface ResumeSettingsProps {}

function ResumeSettings(props: ResumeSettingsProps) {
	const fault = useFault();

	const [versions, { mutate, refetch }] = createResource(async () => {
		try {
			const response = await api.get("/resume/versions");
			const result = response.data as UserResumeVersions;
			setFormData("current_version", result.current_resume_version);
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
	const [form_data, setFormData] = createStore({
		current_version: "",
		selected_version: "",
		new_version: "",
	});
	return (
		<section>
			<section class="p-4 border border-lapis-50 rounded-lg flex flex-col gap-2">
				<Suspense fallback={<LoadingSpinner />}>
					<FormLabeledInput label="Version">
						<Show
							when={editing_version()}
							fallback={
								<div class="flex flex-row items-center justify-between">
									<span>
										Current version:{" "}
										<span class="text-night-800">
											{versions()?.current_resume_version}
										</span>
									</span>
									<div class="flex flex-row gap-4">
										<button
											title="Edit"
											onclick={() => {
												edit_version(true);
											}}
										>
											<EditIcon class="w-8 h-8 [&_path]:stroke-night-900" />
										</button>
										<button
											title="delete"
											onclick={async () => {
												if (
													(versions()?.all_versions
														.length ?? 0) <= 1
												) {
													fault.minor({
														message:
															"cannot delete this version, this is your only version",
													});
													return;
												}
												try {
													await api.post(
														"/resume/delete-version",
														{
															version:
																versions()
																	?.current_resume_version,
														}
													);
													refetch();
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
										>
											<DeleteIcon class="m-1 w-6 h-6 [&_path]:stroke-night-900" />
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
																?.current_resume_version,
														new_name:
															form_data.current_version,
													}
												);
												refetch();
											} catch (error) {
												fault.minor({
													message:
														(
															(
																error as AxiosError
															).response
																?.data as any
														).error ??
														(error as AxiosError)
															.message,
												});
											}
											edit_version(false);
										}}
									>
										<FormInputText
											value={form_data.current_version}
											on_input={(value) =>
												setFormData(
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
									<CloseIcon class="w-8 h-8 [&_path]:stroke-night-900" />
								</button>
							</div>
						</Show>
						<div class="flex flex-row gap-4 items-center justify-between">
							<FormSelect
								value={""}
								on_input={async (value) => {
									setFormData("selected_version", value);

									if (
										!form_data.selected_version ||
										form_data.selected_version ===
											form_data.current_version
									)
										return;
									try {
										await api.post(
											"/resume/change-version",
											{
												version:
													form_data.selected_version,
											}
										);
										refetch();
									} catch (error) {
										fault.minor({
											message:
												(
													(error as AxiosError)
														.response?.data as any
												).error ??
												(error as AxiosError).message,
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
								<AddIcon class="w-8 h-8 [&_path]:stroke-night-900" />
							</button>
						</div>
					</FormLabeledInput>
					<Show when={adding_version()}>
						<div class="flex flex-row items-center justify-between gap-4">
							<span class="flex flex-row grow gap-2 items-center">
								<p class="text-nowrap">Add a new version </p>

								<FormInputText
									value={form_data.new_version}
									on_input={(value) =>
										setFormData("new_version", value)
									}
									placeholder="version name eg. French resume"
								/>
							</span>
							<div class="flex flex-row gap-4">
								<Show when={form_data.new_version.length > 0}>
									<button
										onClick={async () => {
											try {
												await api.post(
													"/resume/add-version",
													{
														new_version:
															form_data.new_version,
													}
												);
												refetch();
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
														(error as AxiosError)
															.message,
												});
											}
										}}
										title="add a new version"
									>
										<AddIcon class="w-8 h-8 [&_path]:stroke-night-900" />
									</button>
								</Show>
								<button
									title="close"
									onclick={() => {
										add_version(false);
									}}
								>
									<CloseIcon class="w-8 h-8 [&_path]:stroke-night-900" />
								</button>
							</div>
						</div>
					</Show>
				</Suspense>
			</section>
		</section>
	);
}

export default ResumeSettings;
