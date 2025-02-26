import { Motion, Presence } from "solid-motionone";
import Header from "../../components/header.default";
import {
	For,
	Show,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import { A } from "@solidjs/router";

interface LandingProps {}

const jobDescriptionSteps = [
	"We are seeking a Senior Software Engineer with 5+ years of experience in React...",
	"Strong background in cloud technologies and microservices...",
	"Experience with agile methodologies and team leadership...",
];

const features = [
	"Keyword optimization for ATS systems",
	"Skills matching with job requirements",
	"Industry-specific language adaptation",
];

export function JobMatchingSection() {
	const [analysing, setAnalysing] = createSignal(false);
	const [showing_preview, showPreview] = createSignal(false);

	function runAnimationCycle() {
		setAnalysing(true);

		setTimeout(() => {
			setAnalysing(false);
			showPreview(true);

			setTimeout(() => {
				showPreview(false);
				setTimeout(() => runAnimationCycle(), 1000);
			}, 4000);
		}, 2000);
	}

	onMount(() => {
		const timer = setTimeout(runAnimationCycle, 1000);

		onCleanup(() => {
			clearTimeout(timer);
		});
	});

	return (
		<section class="py-32 ">
			<article class="flex md:flex-row flex-col gap-8 items-center">
				<Motion.article
					initial={{ opacity: 0, x: -50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					class="flex flex-col gap-8"
				>
					<h2 class="text-4xl font-bold text-night-900">
						Perfect Match with
						<Motion.span
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							class="block alice-regular text-night-100"
						>
							AI-Powered Tailoring
						</Motion.span>
					</h2>

					<p class="text-xl text-gray-600">
						Simply paste the job description, and our AI will
						analyze key requirements to create a perfectly tailored
						resume that maximizes your chances of being hired.
					</p>

					<ul class="flex flex-col gap-4">
						<For each={features}>
							{(feature, index) => (
								<Motion.li
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.4 + index() * 0.1 }}
									class="flex items-center gap-4 text-lg group"
								>
									<span class="w-8 h-8 rounded-full bg-niring-night-100 flex items-center justify-center text-night-900 font-bold">
										✓
									</span>
									<span>{feature}</span>
								</Motion.li>
							)}
						</For>
					</ul>
				</Motion.article>

				<Motion.section
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
				>
					<figure class="">
						<section class="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
							<article class="">
								<section>
									<h3 class="text-sm font-medium text-gray-500 pb-2">
										Job Description
									</h3>
									<article class="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] relative overflow-hidden">
										<Motion.div
											animate={{
												backgroundColor: analysing()
													? "rgba(110, 235, 131, 0.1)"
													: "rgb(249, 250, 251)",
											}}
											transition={{ duration: 0.5 }}
											class="absolute inset-0"
										/>

										<ul class="relative z-10">
											<For each={jobDescriptionSteps}>
												{(step, index) => (
													<Motion.li
														initial={{
															opacity: 0,
															x: -20,
														}}
														animate={{
															opacity: 1,
															x: 0,
														}}
														transition={{
															delay:
																0.2 +
																index() * 0.1,
														}}
														class="flex items-start gap-3 pb-4"
													>
														<span class="w-4 h-4 rounded-full bg-niring-night-100 mt-1"></span>
														<p class="text-gray-600">
															{step}
														</p>
													</Motion.li>
												)}
											</For>
										</ul>
									</article>
								</section>

								<Show when={analysing()}>
									<Motion.section
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										class="flex items-center gap-4"
									>
										<span class="h-12 w-12 rounded-full bg-night-900 flex items-center justify-center animate-spin">
											<svg
												class="w-6 h-6 text-white"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												aria-label="Loading indicator"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 14l-7 7m0 0l-7-7m7 7V3"
												></path>
											</svg>
										</span>
										<article>
											<h4 class="font-medium">
												AI Analysis
											</h4>
											<p class="text-sm text-gray-500">
												Extracting key requirements...
											</p>
										</article>
									</Motion.section>
								</Show>

								<Show when={showing_preview()}>
									<Motion.section
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
									>
										<h3 class="text-sm font-medium text-gray-500 pb-2">
											Tailored Resume Preview
										</h3>
										<article class="p-4 bg-night-900 bg-opacity-5 rounded-lg border border-night-900 border-opacity-10">
											<ul class="flex flex-col gap-4">
												<Motion.li
													initial={{ width: 0 }}
													animate={{ width: "75%" }}
													transition={{
														duration: 0.5,
													}}
													class="h-4 bg-night-100 bg-opacity-20 rounded"
												/>
												<Motion.li
													initial={{ width: 0 }}
													animate={{ width: "50%" }}
													transition={{
														duration: 0.5,
														delay: 0.1,
													}}
													class="h-4 bg-night-100 bg-opacity-20 rounded"
												/>
												<Motion.li
													initial={{ width: 0 }}
													animate={{ width: "66%" }}
													transition={{
														duration: 0.5,
														delay: 0.2,
													}}
													class="h-4 bg-night-100 bg-opacity-20 rounded"
												/>
											</ul>
										</article>
									</Motion.section>
								</Show>
							</article>
						</section>
						<span class="absolute -bottom-2 md:-bottom-2 md:-right-2 w-full h-full border-2 border-night-900 rounded-xl"></span>
					</figure>
				</Motion.section>
			</article>
		</section>
	);
}

function Landing(props: LandingProps) {

	const skills = [
        'Product Strategy', 'Agile Methodologies', 
        'User Research', 'Data Analytics', 
        'Roadmap Planning', 'UX Design'
    ];

    const experiences = [
        {
            title: "Senior Product Manager",
            company: "TechInnovate Solutions, San Francisco",
            period: "Jan 2020 - Present",
            achievements: [
                "Led cross-functional team in developing AI-powered analytics platform",
                "Increased user engagement by 45% through strategic product improvements",
                "Implemented agile methodologies reducing development cycle by 30%"
            ]
        }
    ];

    const education = [
        {
            degree: "MBA in Technology Management",
            institution: "Stanford Graduate School of Business",
            period: "Sep 2015 - May 2017"
        }
    ];
	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 max-h-screen min-h-screen">
			<Header />

			<section class="container md:py-16 py-8 flex flex-col gap-64">
				<section class="flex lg:flex-row flex-col justify-between items-center gap-24">
					<article class="flex-1">
						<h2 class="md:text-6xl text-3xl font-bold leading-tight text-night-900">
							Create your dream resume
							<span class="block pt-2">
								with{" "}
								<span class="alice-regular text-night-100">
									AI precision
								</span>
							</span>
						</h2>

						<p class="text-xl text-gray-800 max-w-2xl">
							Generate professional resumes and cover letters
							tailored to your dream job in 4 simple steps
						</p>

						<ol class="flex flex-col gap-8 py-16 w-full max-w-2xl relative before:content-[''] before:absolute before:left-[10px] before:top-[28px] before:bottom-[28px] before:w-0.5 before:bg-night-100">
							<li class="flex items-start gap-4 md:gap-6">
								<span class="flex-shrink-0 w-5 h-5 rounded-full bg-night-100 z-10" />
								<p class="text-base md:text-lg pt-0.5">
									Describe yourself to your AI assistant
								</p>
							</li>
							<li class="flex items-start gap-4 md:gap-6">
								<span class="flex-shrink-0 w-5 h-5 rounded-full bg-night-100 z-10" />
								<p class="text-base md:text-lg pt-0.5">
									Insert the job offer of your dream
								</p>
							</li>
							<li class="flex items-start gap-4 md:gap-6">
								<span class="flex-shrink-0 w-5 h-5 rounded-full bg-night-100 z-10" />
								<p class="text-base md:text-lg pt-0.5">
									Choose the perfect template
								</p>
							</li>
							<li class="flex items-start gap-4 md:gap-6">
								<span class="flex-shrink-0 w-5 h-5 rounded-full bg-night-100 z-10" />
								<p class="text-base md:text-lg pt-0.5">
									Download a tailor made resume and cover
									letter
								</p>
							</li>
						</ol>

						<A
							href="/pricing"
							class="bg-night-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
						>
							Try it now
							<span class="group-hover:translate-x-2 transition-transform">
								→
							</span>
						</A>
					</article>

					<figure class="flex-1">
            <div class="relative aspect-square max-w-lg">
                <div class="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-6">
                    <div class="h-full overflow-auto">
                        <header class="text-center mb-6">
                            <h1 class="text-3xl font-bold text-gray-900">Alexandra Rodriguez</h1>
                            <p class="text-sm text-gray-600">
                                Senior Product Manager | alexandra.rodriguez@email.com | (415) 555-0123
                            </p>
                            <p class="text-xs text-gray-500">San Francisco, CA | LinkedIn: /in/alexandrarodriguez</p>
                        </header>

                        <section class="mb-5">
                            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
                                Professional Experience
                            </h2>
                            <For each={experiences}>
                                {(exp) => (
                                    <div class="mb-4">
                                        <div class="flex justify-between items-baseline">
                                            <h3 class="font-bold text-gray-800">{exp.title}</h3>
                                            <span class="text-xs text-gray-600">{exp.period}</span>
                                        </div>
                                        <p class="text-sm italic text-gray-700">{exp.company}</p>
                                        <ul class="list-disc pl-5 text-xs text-gray-700 space-y-1 mt-2">
                                            <For each={exp.achievements}>
                                                {(achievement) => (
                                                    <li>{achievement}</li>
                                                )}
                                            </For>
                                        </ul>
                                    </div>
                                )}
                            </For>
                        </section>

                        <section class="mb-5">
                            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
                                Education
                            </h2>
                            <For each={education}>
                                {(edu) => (
                                    <div>
                                        <div class="flex justify-between items-baseline">
                                            <h3 class="font-bold text-gray-800">{edu.degree}</h3>
                                            <span class="text-xs text-gray-600">{edu.period}</span>
                                        </div>
                                        <p class="text-sm italic text-gray-700">{edu.institution}</p>
                                    </div>
                                )}
                            </For>
                        </section>

                        <section>
                            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
                                Skills
                            </h2>
                            <div class="flex flex-wrap gap-2">
                                <For each={skills}>
                                    {(skill) => (
                                        <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                            {skill}
                                        </span>
                                    )}
                                </For>
                            </div>
                        </section>
                    </div>
                </div>
                <div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-night-900 rounded-2xl" />
            </div>
        </figure>
				</section>

				<JobMatchingSection />

				<section class="flex flex-col gap-16 items-center">
					<header class="text-center">
						<h2 class="text-4xl font-bold text-night-900">
							Maximize Your{" "}
							<span class="alice-regular text-night-100">
								Success Rate
							</span>
						</h2>
						<p class="text-xl text-gray-600">
							Our AI-powered tailoring system significantly
							increases your chances of landing interviews
						</p>
					</header>

					<ul class="flex flex-row gap-8">
						<li class="text-center">
							<strong class="text-4xl font-bold text-night-900">
								85%
							</strong>
							<p class="text-gray-600">
								Higher response rate from recruiters
							</p>
						</li>
						<li class="text-center">
							<strong class="text-4xl font-bold text-night-900">
								3x
							</strong>
							<p class="text-gray-600">
								More likely to get an interview
							</p>
						</li>
						<li class="text-center">
							<strong class="text-4xl font-bold text-night-900">
								92%
							</strong>
							<p class="text-gray-600">ATS pass-through rate</p>
						</li>
					</ul>
				</section>

				<section class="flex flex-col gap-16">
					<header class="text-center flex flex-col gap-4">
						<h2 class="text-4xl font-bold text-night-900">
							Create your{" "}
							<span class="alice-regular text-night-100">
								Professional profile
							</span>
						</h2>
						<h3 class="text-xl text-gray-600">
							Build your career story with our intelligent
							assistant
						</h3>
					</header>

					<form class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-lapis-50 p-10 border border-lapis-50">
						<h3 class="text-2xl font-bold pb-8 text-night-900">
							Professional Experience
						</h3>
						<fieldset class="flex flex-col gap-4">
							<label class="block">
								<span class="block text-sm font-medium text-gray-600">
									Position Title
								</span>
								<input
									type="text"
									disabled
									placeholder="e.g. Senior Developer"
									class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-night-100 focus:border-transparent transition-all"
								/>
							</label>
							<label class="block">
								<span class="block text-sm font-medium text-gray-600">
									Company
								</span>
								<input
									type="text"
									disabled
									placeholder="e.g. Tech Innovations Inc"
									class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-night-100 focus:border-transparent transition-all"
								/>
							</label>
							<label class="block">
								<span class="block text-sm font-medium text-gray-600">
									Time Period
								</span>
								<input
									type="text"
									disabled
									placeholder="e.g. Jan 2020 - Present"
									class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-night-100 focus:border-transparent transition-all"
								/>
							</label>
						</fieldset>
					</form>

					<section class="py-32 flex flex-col gap-16">
						<header class="text-center flex flex-col gap-8">
							<h2 class="text-4xl font-bold text-night-900">
								Premium{" "}
								<span class="alice-regular text-night-100 text-nowrap">
									ATS-friendly
								</span>{" "}
								templates
							</h2>
							<h3 class="text-xl text-gray-600">
								Stand out with our professionally designed
								templates
							</h3>
						</header>

						<ul class="flex flex-col md:flex-row gap-8">
							<For each={[1, 2, 3]}>
								{(template) => (
									<li class="bg-white rounded-xl shadow-lg shadow-lapis-50 p-8 border border-gray-100 group hover:shadow-xl transition-all">
										<figure class="aspect-[3/4] bg-gradient-to-br from-lapis-10 to-white rounded-lg pb-6 group-hover:shadow-md transition-all" />
										<h4 class="font-medium text-lg text-night-900">
											Modern Professional
										</h4>
										<p class="text-gray-600 pt-2">
											Clean and contemporary design for
											tech and creative roles
										</p>
									</li>
								)}
							</For>
						</ul>
					</section>
				</section>
			</section>
		</main>
	);
}

export default Landing;
