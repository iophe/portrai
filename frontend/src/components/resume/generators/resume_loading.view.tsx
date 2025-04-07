import {
	createSignal,
	Show,
	onCleanup,
	onMount,
	For,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";

interface LoaderProps {
	is_visible: boolean;
	on_complete?: () => void;
}
export function ResumeLoader(props: LoaderProps) {
	const steps = [
		{ text: "Analyzing job description...", duration: 6000 },
		{ text: "Matching with your profile...", duration: 6000 },
		{ text: "Optimizing for ATS systems...", duration: 6000 },
		{ text: "Finalizing your resume...", duration: 6000 },
	];

	// Helper function to add randomness to durations
	function randomize_duration(base_duration: number) {
		const variance = base_duration * 0.2; // 20% variance
		return base_duration + (Math.random() * variance - variance / 2);
	}

	const [active_step, set_active_step] = createSignal(0);
	const [progress, set_progress] = createSignal(0);
	const [timers, set_timers] = createSignal<number[]>([]);

	// Start animation on mount if visible
	onMount(function () {
		if (props.is_visible) {
			start_animation();
		}
	});

	// Clean up timers when component unmounts
	onCleanup(function () {
		clear_all_timers();
	});

	function clear_all_timers() {
		timers().forEach(function (timer) {
			window.clearTimeout(timer);
		});
		set_timers([]);
	}

	function start_animation() {
		clear_all_timers();
		set_active_step(0);
		set_progress(0);

		const new_timers: number[] = [];
		let total_delay = 0;

		// Set timers for each step transition
		steps.forEach(function (step, index) {
			// Randomize the step duration but ensure minimum duration
			const randomized_duration = Math.max(
				4500,
				randomize_duration(step.duration)
			);

			// Start this step after previous steps finish
			if (index > 0) {
				// Add a small random delay between steps
				const step_transition_delay = Math.random() * 300 + 100; // 100-400ms random delay
				total_delay += step_transition_delay;

				const step_start_timer = window.setTimeout(function () {
					set_active_step(index);
					set_progress(0);
				}, total_delay);
				new_timers.push(step_start_timer);
			}

			// Determine max progress for this step
			// Last step should never reach 100%
			const max_progress =
				index === steps.length - 1
					? 92 + Math.round(Math.random() * 16 - 8)
					: 100;

			// Use fixed number of updates with small random variation to ensure smooth animation
			const num_updates = 15 + Math.round(Math.random() * 10); // More updates for smoother animation
			const progress_per_update = max_progress / num_updates;

			for (let i = 1; i <= num_updates; i++) {
				// Calculate progress for this update
				const current_progress = Math.min(
					Math.round(i * progress_per_update),
					max_progress
				);

				// Calculate delay with small random variation
				const base_delay =
					total_delay + randomized_duration * (i / num_updates);
				const small_jitter = Math.random() * 200 - 100; // +/- 100ms small jitter

				const progress_timer = window.setTimeout(function () {
					set_progress(current_progress);
				}, base_delay + small_jitter);

				new_timers.push(progress_timer);
			}

			total_delay += randomized_duration;
		});

		// Set completion timer
		const completion_timer = window.setTimeout(function () {
			if (props.on_complete) props.on_complete();
		}, total_delay + 800); // Slightly longer delay before completion
		new_timers.push(completion_timer);

		set_timers(new_timers);
	}

	return (
		<Motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{
				opacity: props.is_visible ? 1 : 0,
				y: props.is_visible ? 0 : 20,
			}}
			transition={{ duration: 0.4, easing: "ease-out" }}
			class="shadow-md  bg-white p-4"
		>
			<header class="mb-4 text-center">
				<h3 class="text-lg font-semibold text-forest-800">
					Creating Your Resume
				</h3>
				<p class="text-sm text-gray-500">
					Please wait while we optimize your resume
				</p>
			</header>

			<section class="space-y-6">
				<For each={steps}>
					{function (step, index) {
						return (
							<article class="space-y-2">
								<header class="flex justify-between items-center">
									<p class="text-sm font-medium">
										<Show
											when={index() <= active_step()}
											fallback={
												<span class="text-gray-400 opacity-50">
													{step.text}
												</span>
											}
										>
											<span class="text-forest-800 opacity-100">
												{step.text}
											</span>
										</Show>
									</p>
									<span class="text-xs font-medium">
										<Show
											when={index() < active_step()}
											fallback={
												<Show
													when={
														index() ===
														active_step()
													}
													fallback={
														<span class="text-gray-400 opacity-50">
															0%
														</span>
													}
												>
													<span class="text-forest-600 opacity-100">
														{progress()}%
													</span>
												</Show>
											}
										>
											<span class="text-forest-600 opacity-100">
												100%
											</span>
										</Show>
									</span>
								</header>

								<figure class="h-2 bg-gray-100 rounded-full overflow-hidden">
									<Motion.div
										initial={{ width: "0%" }}
										animate={{
											width:
												index() < active_step()
													? "100%"
													: index() === active_step()
														? `${progress()}%`
														: "0%",
										}}
										transition={{ duration: 0.2 }}
										class="h-full rounded-full bg-gradient-to-r from-forest-500 to-forest-600"
									/>
								</figure>
							</article>
						);
					}}
				</For>
			</section>

			<footer class="mt-6 flex justify-center">
				<figure class="flex flex-col items-center">
					<div class="relative">
						<svg
							class="animate-spin -ml-1 mr-2 h-8 w-8 text-forest-600"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
					<figcaption class="text-xs text-gray-500 mt-2">
						This may take a moment
					</figcaption>
				</figure>
			</footer>
		</Motion.section>
	);
}
