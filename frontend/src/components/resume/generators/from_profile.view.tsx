import { createSignal, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { useFault } from "@components/fault";
import api from "@utils/api";
import LoadingSpinner from "@components/loading.spinner";
import { En, Fr, Lang, useLang } from "@components/language";

interface GenerateResumeFromProfileProps {
	template_name: string;
	on_generated: (data: GenerateResumeFromProfileData) => void;
	start_loading: () => void;
	end_loading: () => void;
	activate: () => void;
}

export function GenerateResumeFromProfile(
	props: GenerateResumeFromProfileProps
) {
	const [is_generating, set_is_generating] = createSignal(false);
	const fault = useFault();
	const lang = useLang();

	return (
		<section class="w-full flex justify-center p-4">
			<Motion
				hover={{ scale: 1.03 }}
				press={{ scale: 0.97 }}
				transition={{ duration: 0.1 }}
			>
				<button
					class="bg-lapis-200 px-4 py-2 rounded text-snow-100 font-semibold flex flex-row gap-2"
					onClick={async () => {
						set_is_generating(true);
						props.start_loading();
						props.activate();
						try {
							const response = await api.post(
								"/generate/from-profile/" +
									props.template_name +
									"/" +
									lang.current()
							);
							const result =
								response.data as GenerateResumeFromProfileData;
							props.on_generated(result);
						} catch (error) {
							fault.major({
								message:
									"Failed to build your resume from profile",
							});
						} finally {
							set_is_generating(false);
							props.end_loading();
						}
					}}
					disabled={is_generating()}
				>
					<Lang>
						<En>Generate Resume From Profile</En>
						<Fr>Générer un CV à partir du profile</Fr>
					</Lang>

					<Show when={is_generating()}>
						<LoadingSpinner white />
					</Show>
				</button>
			</Motion>
		</section>
	);
}
