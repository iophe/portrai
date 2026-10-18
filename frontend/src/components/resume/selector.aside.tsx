import { Accessor, Setter, For, Show, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import ExperienceIcon from "@assets/icons/briefcase.svg?component-solid";
import EducationIcon from "@assets/icons/graduation.svg?component-solid";
import CertificateIcon from "@assets/icons/diploma.svg?component-solid";
import ProjectIcon from "@assets/icons/project.svg?component-solid";
import SkillIcon from "@assets/icons/skill.svg?component-solid";
import SettingsIcon from "@assets/icons/settings.svg?component-solid";
import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";

interface AsideSelectorProps {
	section: Accessor<string>;
	set_section: Setter<string>;
}

function AsideSelector(props: AsideSelectorProps) {
	const location = useLocation();
	const navigate = useNavigate();

	onMount(() => {
		if (
			location.query.section !== undefined &&
			navItems.find((n) => n.id === location.query.section)
		) {
			props.set_section(location.query.section as string);
		}
	});

	const navItems = [
		{
			id: "settings",
			label: "",
			icon: SettingsIcon,
			hideLabel: true,
		},
		{
			id: "experience",
			label: "Experiences",
			icon: ExperienceIcon,
		},
		{
			id: "education",
			label: "Educations",
			icon: EducationIcon,
		},
		{
			id: "certificate",
			label: "Certifications",
			icon: CertificateIcon,
		},
		{
			id: "project",
			label: "Projects",
			icon: ProjectIcon,
		},
		{
			id: "skill",
			label: "Skills",
			icon: SkillIcon,
		},
	];

	return (
		<aside class="flex gap-4 overflow-clip flex-wrap flex-row text-sm pb-2 border-b-2 border-forest-900">
			<For each={navItems}>
				{(item) => (
					<button
						onclick={() => {
							props.set_section(item.id);
							navigate(`?section=${item.id}`, { replace: true });
						}}
						class="overflow-clip flex flex-no-wrap gap-2 items-center rounded opacity-70 hover:opacity-100"
						classList={{
							"bg-forest-50 px-4 py-2 opacity-100":
								props.section() === item.id,
						}}
					>
						<Show when={!item.hideLabel}>
							<label
								class="hidden lg:block text-ellipsis overflow-clip"
								classList={{
									"text-forest-900":
										props.section() === item.id,
									"text-forest-700":
										props.section() !== item.id,
								}}
							>
								{item.label}
							</label>
						</Show>

						<item.icon
							class="min-w-fit"
							classList={{
								"fill-forest-900": props.section() === item.id,
								"fill-forest-700": props.section() !== item.id,
							}}
						/>

						<Show when={props.section() === item.id}>
							<Motion
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{
									duration: 0.3,
									easing: "ease-out",
								}}
								style={{
									position: "absolute",
									bottom: "-2px",
									left: "0",
									width: "100%",
									height: "2px",
									"background-color": "var(--forest-900)",
									"transform-origin": "left",
								}}
							></Motion>
						</Show>
					</button>
				)}
			</For>
		</aside>
	);
}

export default AsideSelector;
