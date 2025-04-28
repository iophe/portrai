import { Motion } from "solid-motionone";
import DangerIcon from "@assets/icons/danger.svg?component-solid";
import api from "@utils/api";
import { db } from "@utils/db/db";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import RecoverAccount from "./recover.section";

interface DangerZoneProps {}

export function DangerZone(props: DangerZoneProps) {
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
				<DangerIcon class="min-w-fit fill-forest-900" />
				<h2 class="text-sm text-gray-500 uppercase">Danger Zone</h2>
			</Motion.header>

			<article class="w-full mt-4 flex flex-col-reverse lg:flex-row gap-4">
				<Motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25, delay: 0.05 }}
					class="mt-4 flex flex-col gap-4 grow"
				>
					<Motion.p
						initial={{ opacity: 0, x: -5 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.2, delay: 0.1 }}
						class="text-sm text-forest-700 items-start"
					>
						Once you log out all recent resumes in history will be
						lost
					</Motion.p>

					<Motion.button
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.1 }}
						hover={{ scale: 1.03 }}
						press={{ scale: 0.97 }}
						class="w-fit py-2 px-4 text-snow-100 bg-lapis-400 hover:bg-lapis-200 rounded"
						onclick={async () => {
							if (confirm("Are you sure you want to log out ?")) {
								try {
									await api.post("/auth/logout");
									localStorage.clear();
									await DB_JOB_SPECIFIC_RESUMES.clear(db);
									window.location.reload();
								} catch (error) {
									console.error(error);
								}
							}
						}}
					>
						Log out
					</Motion.button>

					<Motion.p
						initial={{ opacity: 0, x: -5 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.2, delay: 0.2 }}
						class="text-sm text-forest-700"
					>
						Once you delete your account, it cannot be undone. This
						is permanent.
					</Motion.p>

					<button
						class="w-fit py-2 text-red-500 hover:text-red-600 font-medium"
						onclick={async () => {
							// Delete account handler directly in the onclick
							if (
								confirm(
									"Are you sure you want to delete your account? This action cannot be undone."
								)
							) {
								try {
									await api.post("/auth/delete");
									localStorage.clear();
									await DB_JOB_SPECIFIC_RESUMES.clear(db);
									window.location.reload();
								} catch (error) {
									console.error(error);
								}
							}
						}}
					>
						Delete Account
					</button>
				</Motion.div>

				<Motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25, delay: 0.1 }}
					class="grow"
				>
					<RecoverAccount />
				</Motion.div>
			</article>
		</Motion.section>
	);
}
