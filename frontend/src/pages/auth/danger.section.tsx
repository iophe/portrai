import DangerIcon from "@assets/icons/danger.svg?component-solid";
import api from "@utils/api";
import { db } from "@utils/db/db";
import { DB_JOB_SPECIFIC_RESUMES } from "@utils/db/resume.db";
import RecoverAccount from "./recover.section";

interface DangerZoneProps {}

export function DangerZone(props: DangerZoneProps) {
	return (
		<section class="w-full bg-white rounded p-6 shadow-sm">
			<header class="flex flex-row gap-4 border-b-2 border-forest-900 pb-2">
				<DangerIcon class="fill-forest-900" />
				<h2 class="text-sm text-gray-500 uppercase">Danger Zone</h2>
			</header>
			<article class="w-full mt-4 flex flex-col-reverse md:flex-row gap-4">
				<div class="mt-4 flex flex-col gap-4 grow">
					<p class="text-sm text-forest-700 items-start">
						Once you log out all recent resumes in history will be
						lost
					</p>
					<button
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
					</button>
					<p class="text-sm text-forest-700">
						Once you delete your account, it cannot be undone. This
						is permanent.
					</p>
					<button
						class="w-fit py-2  text-red-500 hover:text-red-600 font-medium"
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
				</div>
				<div class="grow">
					<RecoverAccount />
				</div>
			</article>
		</section>
	);
}
