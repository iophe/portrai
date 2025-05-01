import Footer from "@components/footer.default";
import Header from "@components/header.default";
import { createSignal, For, Show } from "solid-js";
import { Motion } from "solid-motionone";
import EXECUTING_RESUME from "@assets/templates/standard_executive.jpg";
import COLUMNS_EXECUTING_RESUME from "@assets/templates/columns_executive.jpg";
import { A } from "@solidjs/router";
import { PRICING_PLANS, PricingCard } from "@pages/pricing/pricing.page";
import { En, Fr, Lang, LangProvider, Test, useLang } from "@components/language";

interface LandingPageProps {}

function LandingPage(props: LandingPageProps) {
	const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");

	const job_description_steps = [
		"We are seeking a Senior Software Engineer with 5+ years of experience in React...",
		"Strong background in cloud technologies and microservices...",
		"Experience with agile methodologies and team leadership...",
	];

	const workflow_steps = [
		{
			title: "Tell us about yourself",
			description:
				"Share your professional experience, skills, and education with our AI assistant",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
					<circle cx="9" cy="7" r="4"></circle>
					<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
					<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
				</svg>
			),
		},
		{
			title: "Paste the job description",
			description:
				"Add the job offer you want to apply for - our AI will analyze key requirements",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
					<rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
				</svg>
			),
		},
		{
			title: "Select your template",
			description:
				"Choose from our professionally designed, ATS-friendly templates",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
				</svg>
			),
		},
		{
			title: "Download your tailored documents",
			description:
				"Get your perfectly matched resume and cover letter ready to submit",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
			),
		},
	];

	const advantages = [
		{
			title: "85%",
			description: "Higher response rate from recruiters",
		},
		{
			title: "3x",
			description: "More likely to get an interview",
		},
		{
			title: "97%",
			description: "ATS pass-through rate",
		},
	];

	const faq_items = [
		{
			question: "How does Portrai create tailored resumes?",
			answer: "Portrai uses advanced AI to analyze job descriptions and identify key requirements, skills, and qualifications. It then creates a perfectly matched resume that highlights your relevant experience and skills for that specific job.",
		},
		{
			question: "Can I create multiple resumes?",
			answer: "Yes! Your subscription allows you to create unlimited resumes and cover letters during your 3-month period. We encourage creating tailored documents for each position you apply to.",
		},
		{
			question: "What if I need help using the platform?",
			answer: "We offer comprehensive guides and email support to help you get the most out of Portrai. Our team is dedicated to helping you succeed in your job search.",
		},
		{
			question: "Can I cancel my subscription?",
			answer: "Your plan is a one-time payment for 3 months of service, designed to cover a typical job search period. There's no need to cancel as it won't automatically renew.",
		},
	];
	const lang = useLang();
	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4">
			<Header />

			<section class="w-full flex flex-col gap-16 py-8 items-start text-forest-900">
				{/* Hero Section */}

				<Motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					class="w-full flex lg:flex-row flex-col gap-12 items-center py-16"
				>
					<article class="lg:w-1/2 flex flex-col gap-6">
						<h1 class="text-4xl lg:text-5xl font-bold text-forest-900 leading-tight">
						<Lang>
							<En>Your perfect resume for</En>
							<Fr>Ton resume parfait pour</Fr>
						</Lang>
							<span class="block alice-regular text-forest-100">
								every job application
							</span>
						</h1>

						<p class="text-xl text-gray-700">
							Portrai uses AI to instantly generate tailored
							resumes and cover letters that match exactly what
							employers are looking for.
						</p>

						<ul class="flex flex-col gap-4 py-4">
							<Motion.li
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
								class="flex items-center gap-3 text-lg"
							>
								<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
									✓
								</span>
								<span>ATS-optimized for higher pass rates</span>
							</Motion.li>
							<Motion.li
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.3 }}
								class="flex items-center gap-3 text-lg"
							>
								<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
									✓
								</span>
								<span>
									Perfectly matched to job requirements
								</span>
							</Motion.li>
							<Motion.li
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4 }}
								class="flex items-center gap-3 text-lg"
							>
								<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
									✓
								</span>
								<span>
									Professional templates that stand out
								</span>
							</Motion.li>
						</ul>

						<div class="pt-4">
							<A
								href="#pricing"
								onClick={(e) => {
									e.preventDefault();
									const element =
										document.getElementById("pricing");
									element?.scrollIntoView({
										behavior: "smooth",
									});
								}}
								class="bg-forest-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
							>
								Start Creating Now
								<span class="group-hover:translate-x-2 transition-transform">
									→
								</span>
							</A>
						</div>
					</article>

					<figure class="lg:w-1/2">
						<div class="relative max-w-lg mx-auto">
							<div class="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
								<div class="flex flex-col gap-4">
									<header class="text-center mb-4">
										<h3 class="text-2xl font-bold text-gray-900">
											Professional Resume
										</h3>
										<p class="text-sm text-gray-600">
											Tailored for your dream job
										</p>
									</header>

									<article class="bg-gray-50 rounded-lg border border-gray-200 p-4">
										<h4 class="text-sm font-medium text-gray-500 pb-2">
											Job Description
										</h4>
										<ul class="flex flex-col gap-3">
											<For each={job_description_steps}>
												{(step) => (
													<li class="flex items-start gap-3">
														<span class="w-3 h-3 rounded-full bg-forest-100 mt-1"></span>
														<p class="text-gray-600 text-sm">
															{step}
														</p>
													</li>
												)}
											</For>
										</ul>
									</article>

									<article class="bg-forest-50 rounded-lg border border-forest-100 p-4">
										<h4 class="text-sm font-medium text-gray-500 pb-2">
											AI-Optimized Resume
										</h4>
										<ul class="flex flex-col gap-2">
											<li class="h-3 bg-forest-100 bg-opacity-20 rounded w-full"></li>
											<li class="h-3 bg-forest-100 bg-opacity-20 rounded w-3/4"></li>
											<li class="h-3 bg-forest-100 bg-opacity-20 rounded w-5/6"></li>
											<li class="h-3 bg-forest-100 bg-opacity-20 rounded w-2/3"></li>
										</ul>
									</article>
								</div>
							</div>
							<div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-forest-900 rounded-2xl"></div>
						</div>
					</figure>
				</Motion.section>

				{/* Problem-Solution Section */}
				<section class="w-full py-16 bg-gray-50 rounded-xl p-8">
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							Why Job Seekers Choose{" "}
							<span class="alice-regular">Portrai</span>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							Generic resumes get overlooked. AI-tailored
							applications get interviews.
						</p>
					</header>

					<div class="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
						<article class="flex flex-col gap-4">
							<h3 class="text-2xl font-semibold text-forest-800">
								The Problem
							</h3>
							<ul class="flex flex-col gap-4">
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										Generic resumes fail to highlight
										relevant skills for specific jobs
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										Applicant Tracking Systems (ATS) filter
										out qualified candidates
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										Creating tailored resumes manually is
										time-consuming
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										Most job seekers don't know what
										employers are really looking for
									</p>
								</li>
							</ul>
						</article>

						<article class="flex flex-col gap-4">
							<h3 class="text-2xl font-semibold text-forest-800">
								The Portrai Solution
							</h3>
							<ul class="flex flex-col gap-4">
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										AI analysis matches your experience to
										specific job requirements
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										Keyword optimization ensures your resume
										passes ATS filters
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										Generate perfectly tailored documents in
										minutes, not hours
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										Industry-specific language that
										resonates with hiring managers
									</p>
								</li>
							</ul>
						</article>
					</div>
				</section>

				{/* How It Works Section */}
				<section class="w-full py-16">
					<header class="text-center mb-16">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							How <span class="alice-regular">Portrai</span> Works
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							Create a perfectly tailored resume in four simple
							steps
						</p>
					</header>

					<div class="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
						<ol class="flex flex-col gap-12 relative before:content-[''] before:absolute before:left-[14px] before:top-[28px] before:bottom-[28px] before:w-0.5 before:bg-forest-100">
							<For each={workflow_steps}>
								{(step, index) => (
									<li class="flex items-start gap-4">
										<div class="flex-shrink-0 w-7 h-7 rounded-full bg-forest-100 text-forest-900 flex items-center justify-center z-10">
											{index() + 1}
										</div>
										<div class="flex flex-col gap-2">
											<h3 class="text-xl font-semibold flex items-center gap-3">
												<span class="text-forest-600">
													{step.icon}
												</span>
												{step.title}
											</h3>
											<p class="text-gray-600">
												{step.description}
											</p>
										</div>
									</li>
								)}
							</For>
						</ol>

						<figure class="flex flex-col gap-8">
							<article class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<h3 class="text-lg font-semibold text-forest-900 mb-4">
									AI-Powered Analysis
								</h3>
								<p class="text-gray-600 mb-4">
									Our AI assistant extracts key requirements
									from job descriptions and identifies the
									most relevant parts of your experience.
								</p>

								<div class="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
									<div class="flex items-start gap-3">
										<span class="w-4 h-4 rounded-full bg-forest-100 mt-1"></span>
										<div class="flex flex-col gap-1">
											<p class="text-sm text-gray-700">
												<strong>Job requires:</strong>{" "}
												Experience with React and Cloud
												Technologies
											</p>
											<p class="text-xs text-forest-700">
												→ Highlighting your 3 years of
												React development and AWS
												experience
											</p>
										</div>
									</div>

									<div class="flex items-start gap-3">
										<span class="w-4 h-4 rounded-full bg-forest-100 mt-1"></span>
										<div class="flex flex-col gap-1">
											<p class="text-sm text-gray-700">
												<strong>Job requires:</strong>{" "}
												Leadership in Agile environment
											</p>
											<p class="text-xs text-forest-700">
												→ Emphasizing your role leading
												sprints and mentoring junior
												developers
											</p>
										</div>
									</div>
								</div>
							</article>

							<article class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<h3 class="text-lg font-semibold text-forest-900 mb-4">
									Resume & Cover Letter Generation
								</h3>
								<p class="text-gray-600 mb-4">
									Portrai creates perfectly matched documents
									highlighting your relevant skills and
									experience in professional, ATS-friendly
									formats.
								</p>

								<div class="grid grid-cols-2 gap-4">
									<div class="flex flex-col gap-2 bg-forest-50 p-3 rounded-lg">
										<h4 class="text-sm font-medium text-forest-800">
											Resume
										</h4>
										<ul class="flex flex-col gap-1">
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-full"></li>
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-5/6"></li>
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-3/4"></li>
										</ul>
									</div>

									<div class="flex flex-col gap-2 bg-forest-50 p-3 rounded-lg">
										<h4 class="text-sm font-medium text-forest-800">
											Cover Letter
										</h4>
										<ul class="flex flex-col gap-1">
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-full"></li>
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-4/5"></li>
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-5/6"></li>
										</ul>
									</div>
								</div>
							</article>
						</figure>
					</div>
				</section>

				{/* Results Section */}
				<section class="w-full py-16 bg-forest-50 rounded-xl p-8">
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							Maximize Your{" "}
							<span class="alice-regular">Success Rate</span>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							AI-tailored applications significantly increase your
							interview chances
						</p>
					</header>

					<ul class="flex flex-col lg:flex-row justify-center gap-12 max-w-4xl mx-auto">
						<For each={advantages}>
							{(advantage) => (
								<li class="text-center flex-1">
									<strong class="text-4xl font-bold text-forest-900 block mb-2">
										{advantage.title}
									</strong>
									<p class="text-gray-700">
										{advantage.description}
									</p>
								</li>
							)}
						</For>
					</ul>
				</section>

				{/* Templates Section */}
				<section class="w-full py-16">
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							Premium{" "}
							<span class="alice-regular">ATS-friendly</span>{" "}
							Templates
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							Stand out with our professionally designed templates
						</p>
					</header>

					<figure class="max-w-4xl mx-auto">
						<div class="flex flex-col lg:flex-row justify-center gap-8">
							<article class="bg-white rounded-xl flex flex-col items-center gap-4 shadow-lg p-6 border border-gray-100 group hover:shadow-xl transition-all w-full lg:w-96">
								<div class="w-full aspect-[3/4]">
									<img
										src={EXECUTING_RESUME}
										alt="Executive template preview"
										class="object-cover w-full h-full rounded-lg"
									/>
								</div>
								<div class="text-center">
									<h3 class="font-medium text-lg text-forest-900">
										Executive Professional
									</h3>
									<p class="text-gray-600 pt-2">
										Sophisticated layout for senior
										professionals and executives
									</p>
								</div>
							</article>

							<article class="bg-white rounded-xl flex flex-col items-center gap-4 shadow-lg p-6 border border-gray-100 group hover:shadow-xl transition-all w-full lg:w-96">
								<div class="w-full aspect-[3/4]">
									<img
										src={COLUMNS_EXECUTING_RESUME}
										alt="Executive template preview"
										class="object-cover w-full h-full rounded-lg"
									/>
								</div>
								<div class="text-center">
									<h3 class="font-medium text-lg text-forest-900">
										Light
									</h3>
									<p class="text-gray-600 pt-2">
										Light and temperate design.
									</p>
								</div>
							</article>
						</div>

						<p class="text-center mt-8 text-gray-600">
							<A
								href="/templates"
								class="text-forest-700 font-medium hover:underline inline-flex items-center gap-2"
							>
								View all templates
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<line x1="5" y1="12" x2="19" y2="12"></line>
									<polyline points="12 5 19 12 12 19"></polyline>
								</svg>
							</A>
						</p>
					</figure>
				</section>

				{/* Pricing Section */}
				<section
					id={"pricing"}
					class="w-full py-16 bg-white rounded-xl shadow-md border border-gray-100 p-8"
				>
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							Simple Pricing
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							Everything you need for your job search
						</p>
					</header>

					<section
						class="w-full flex flex-col lg:flex-row justify-center items-center gap-8"
						aria-label="Pricing plans"
					>
						<For each={PRICING_PLANS}>
							{(plan) => <PricingCard {...plan} />}
						</For>
					</section>
				</section>

				{/* FAQ Section */}
				<section class="w-full py-16">
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							Frequently Asked Questions
						</h2>
					</header>

					<ul class="max-w-3xl mx-auto flex flex-col gap-6">
						<For each={faq_items}>
							{(item) => (
								<li class="border-b border-gray-200 pb-6">
									<h3 class="text-xl font-semibold text-forest-800 mb-3">
										{item.question}
									</h3>
									<p class="text-gray-700">{item.answer}</p>
								</li>
							)}
						</For>
					</ul>
				</section>

				{/* Call to Action */}
				<section class="w-full py-16 bg-forest-50 rounded-xl p-8 text-center">
					<h2 class="text-3xl font-bold text-forest-900 mb-4">
						Ready to Land Your Dream Job?
					</h2>
					<p class="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
						Stop sending generic resumes that get overlooked. Start
						creating perfectly tailored applications that get
						interviews.
					</p>

					<A
						href="/signup"
						class="bg-forest-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
					>
						Create Your First Resume
						<span class="group-hover:translate-x-2 transition-transform">
							→
						</span>
					</A>
				</section>
			</section>

			<Footer />
		</main>
	);
}

export default LandingPage;
