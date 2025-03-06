import { Component, For, Show, createSignal, onMount } from "solid-js";
import AvatarIcon from "@assets/icons/avatar.svg?component-solid";

interface AvatarSectionProps {}

export function AvatarSection(props: AvatarSectionProps) {
	const [is_uploading, set_is_uploading] = createSignal(false);
	const [upload_error, set_upload_error] = createSignal<string | null>(null);

	return (
		<section class="w-full bg-white rounded p-6 shadow-sm">
			<header class="flex flex-row gap-4  border-b-2 border-forest-900 pb-2">
				<AvatarIcon class="fill-forest-900 w-6 h-6" />
				<h2 class="text-sm text-gray-500 uppercase">Profile Picture</h2>
			</header>
			<article class="flex items-center gap-4 pt-4">
				<figure class="flex flex-col items-center">
					<div class="w-24 h-24 rounded-full overflow-hidden bg-forest-50 flex items-center justify-center">
						<AvatarIcon class=" w-20 h-20 fill-forest-700" />
					</div>
					<div class="w-full mt-2">
						<label
							for="avatar-upload"
							class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer"
						>
							Change
						</label>
						<input
							id="avatar-upload"
							type="file"
							accept="image/*"
							class="hidden"
							onChange={(e) => {
								const input = e.target as HTMLInputElement;
								if (!input.files?.length) return;

								const file = input.files[0];

								if (!file.type.startsWith("image/")) {
									set_upload_error(
										"Please upload an image file (JPG, PNG, or GIF)"
									);
									return;
								}

								if (file.size > 5 * 1024 * 1024) {
									set_upload_error(
										"File size exceeds 5MB limit"
									);
									return;
								}

								set_upload_error(null);

								const object_url = URL.createObjectURL(file);

								set_is_uploading(true);

								// Upload handler inside the onChange event
								const upload_avatar_file = async (
									file: File
								) => {
									const form_data = new FormData();
									form_data.append("avatar", file);

									try {
										const response = await fetch(
											"/api/account_group/avatar/upload",
											{
												method: "POST",
												body: form_data,
											}
										);

										if (!response.ok) {
											const error_data =
												await response.json();
											throw new Error(
												error_data.error ||
													"Upload failed"
											);
										}

										const data = await response.json();
										return data.path;
									} catch (error) {
										console.error(
											"Avatar upload error:",
											error
										);
										throw error;
									}
								};

								upload_avatar_file(file)
									.then((avatar_url) => {
										const backend_avatar_url = `http://localhost:3000/api/v1${avatar_url}`;
										set_is_uploading(false);
									})
									.catch((error) => {
										set_is_uploading(false);
										set_upload_error(
											"Failed to upload image. Please try again."
										);
									});
							}}
							disabled={is_uploading()}
							aria-label="Upload profile picture"
						/>
					</div>
				</figure>
				<aside class="flex-1">
					<p class="text-sm text-forest-700">
						Upload a profile picture. Max file size 5MB.
					</p>
					<p class="text-xs text-gray-500">
						Supported formats: JPG, PNG, GIF
					</p>

					<Show when={is_uploading()}>
						<p class="text-sm text-blue-500">Uploading...</p>
					</Show>

					<Show when={upload_error()}>
						<p class="text-sm text-red-500">{upload_error()}</p>
					</Show>
				</aside>
			</article>
		</section>
	);
}
