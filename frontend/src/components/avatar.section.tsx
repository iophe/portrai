import {
	Component,
	For,
	Match,
	Show,
	Switch,
	createResource,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import AvatarIcon from "@assets/icons/avatar.svg?component-solid";
import api from "@utils/api";
import { useFault } from "@components/fault";
import { AxiosError } from "axios";
import LoadingSpinner from "@components/loading.spinner";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import { En, Fr, Lang, useLang } from "./language";

interface AvatarSectionProps {}

export interface CachedImage {
	img: string;
	date: Date;
	ttl: number;
}
export const CACHED_IMAGE_TTL = 24 * 60 * 60 * 1000;
export const CACHED_IMAGE_KEY = "/account/profile/avatar";

export function AvatarSection(props: AvatarSectionProps) {
	const fault = useFault();
	const [is_uploading, set_is_uploading] = createSignal(false);

	const [avatar, { refetch }] = createResource(async () => {
		const cached = window.localStorage.getItem(CACHED_IMAGE_KEY);
		if (cached) {
			const cached_data = JSON.parse(cached) as CachedImage;
			const cache_date = new Date(cached_data.date);
			const now = new Date();
			const elapsed_time = now.getTime() - cache_date.getTime();

			if (elapsed_time < cached_data.ttl) {
				// if the data is valid
				return cached_data.img;
			} else {
				window.localStorage.removeItem(CACHED_IMAGE_KEY);
			}
		}
		try {
			const res = await api.get("/account/profile/avatar", {
				responseType: "blob",
			});
			const url = URL.createObjectURL(res.data);
			const base64_url = (await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.readAsDataURL(res.data);
			})) as string;
			window.localStorage.setItem(
				CACHED_IMAGE_KEY,
				JSON.stringify({
					img: base64_url,
					date: new Date(),
					ttl: CACHED_IMAGE_TTL,
				} as CachedImage)
			);
			return base64_url;
		} catch (error) {}
	});

	onCleanup(() => {
		const url = avatar();
		if (url) {
			URL.revokeObjectURL(url);
		}
	});

	return (
		<Motion.section
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			class="w-full bg-white rounded p-6 shadow-sm"
		>
			<Motion.header
				initial={{ x: -5, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.15 }}
				class="flex flex-row gap-4 border-b-2 border-forest-900 pb-2"
			>
				<AvatarIcon class="min-w-fit fill-forest-900 w-6 h-6" />
				<h2 class="text-sm text-gray-500 uppercase">
				<Lang>
			  {[
				<En>Profile Picture</En>,
				<Fr>Photo de Profile</Fr>
			  ]}
			</Lang></h2>
			</Motion.header>

			<article class="flex flex-row items-center gap-4 pt-4">
				<Motion.figure
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.25, delay: 0.1 }}
					class="flex flex-col items-center"
				>
					<div
						class="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
						classList={{
							"bg-none": avatar() !== undefined,
							"bg-forest-50": !avatar(),
						}}
					>
						<Switch
							fallback={
								<Motion
									animate={{
										rotate: [0, 5, 0, -5, 0],
									}}
									transition={{
										duration: 0.5,
										delay: 0.3,
									}}
								>
									<AvatarIcon class="w-20 h-20 fill-forest-700" />
								</Motion>
							}
						>
							<Match when={avatar.loading}>
								<LoadingSpinner />
							</Match>
							<Match when={avatar()}>
								<Motion
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.2 }}
								>
									<img
										src={avatar()}
										alt="Profile Avatar"
										class="w-full h-full"
									/>
								</Motion>
							</Match>
						</Switch>
					</div>
				</Motion.figure>

				<Motion.aside
					initial={{ opacity: 0, x: 10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.25, delay: 0.15 }}
					class="flex-1 flex flex-col gap-2"
				>
					<p class="text-sm text-forest-700">
					<Lang>
			  {[
				<En>Upload a profile picture. Max file size 5MB.</En>,
				<Fr>Télécharger une photo de profile. Taille maximale 5MB.</Fr>
			  ]}
			</Lang>
						
					</p>
					<p class="text-xs text-gray-500">
					<Lang>
			  {[
				<En>Supported formats: JPG, PNG, WEBP.</En>,
				<Fr>Formats supportés: JPG, PNG, WEBP.</Fr>
			  ]}
			</Lang>
						
					</p>
					<Motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.15, delay: 0.2 }}
						hover={{ scale: 1.03 }}
						press={{ scale: 0.97 }}
						class="px-4 self-center"
					>
						<input
							id="avatar-upload"
							type="file"
							accept="image/*"
							class="hidden"
							onChange={async (e) => {
								const input = e.target as HTMLInputElement;
								if (!input.files?.length) return;

								const file = input.files[0];

								if (!file.type.startsWith("image/")) {
									fault.major({
										message:
											"Please upload an image file (JPG, PNG, or WEBP)",
									});
									return;
								}

								if (file.size > 5 * 1024 * 1024) {
									fault.major({
										message: "File size exceeds 5MB limit",
									});
									return;
								}

								const object_url = URL.createObjectURL(file);

								set_is_uploading(true);

								const form_data = new FormData();
								form_data.append("image", file);

								try {
									await api.post(
										"/account/profile/avatar/update",
										form_data
									);
									window.localStorage.removeItem(
										CACHED_IMAGE_KEY
									);
									refetch();
								} catch (error) {
									fault.minor({
										message:
											(
												(error as AxiosError).response
													?.data as any
											).error ??
											(error as AxiosError).message,
									});
								} finally {
									set_is_uploading(false);
									URL.revokeObjectURL(object_url);
								}
							}}
							disabled={is_uploading()}
							aria-label="Upload profile picture"
						/>
						<label
							for="avatar-upload"
							class="text-sm flex flex-row gap-4 items-center text-lapis-500 hover:text-lapis-300 cursor-pointer smooth-transition"
						>
					<Lang>
			  {[
				<En>Change</En>,
				<Fr>Changer</Fr>
			  ]}
			</Lang>
							<EditIcon class="min-w-fit fill-forest-900" />
							<Presence>
								<Show when={is_uploading()}>
									<Motion
										initial={{
											scale: 0,
											opacity: 0,
										}}
										animate={{
											scale: 1,
											opacity: 1,
										}}
										exit={{
											scale: 0,
											opacity: 0,
										}}
										transition={{
											duration: 0.2,
										}}
									>
										<LoadingSpinner />
									</Motion>
								</Show>
							</Presence>
						</label>
					</Motion.div>
				</Motion.aside>
			</article>
		</Motion.section>
	);
}
