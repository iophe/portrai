import Footer from "@components/footer.default";
import Header from "@components/header.default";
import { createSignal, For, Show } from "solid-js";
import { Motion } from "solid-motionone";
import EXECUTING_RESUME from "@assets/templates/standard_executive.jpg";
import { A } from "@solidjs/router";
import { En, Fr, Lang } from "@components/language";

interface ProductPageProps {}

function ProductPage(props: ProductPageProps) {
	const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");

	const job_description_steps = [
		{
			eng: "We are seeking a Senior Software Engineer with 5+ years of experience in React...",
			fr: "Nous recherchons un Ingénieur Logiciel Senior avec plus de 5 ans d'expérience en React...",
		},
		{
			eng: "Strong background in cloud technologies and microservices...",
			fr: "Solide expérience en technologies cloud et microservices...",
		},
		{
			eng: "Experience with agile methodologies and team leadership...",
			fr: "Expérience avec les méthodologies agiles et le leadership d'équipe...",
		},
	];

	const workflow_steps = [
		{
			title: {
				eng: "Tell us about yourself",
				fr: "Parlez-nous de vous",
			},
			description: {
				eng: "Share your professional experience, skills, and education with our AI assistant",
				fr: "Partagez votre expérience professionnelle, vos compétences et votre formation avec notre assistant IA",
			},
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
			title: {
				eng: "Paste the job description",
				fr: "Collez la description du poste",
			},
			description: {
				eng: "Add the job offer you want to apply for - our AI will analyze key requirements",
				fr: "Ajoutez l'offre d'emploi à laquelle vous souhaitez postuler - notre IA analysera les exigences clés",
			},
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
			title: {
				eng: "Select your template",
				fr: "Sélectionnez votre modèle",
			},
			description: {
				eng: "Choose from our professionally designed, ATS-friendly templates",
				fr: "Choisissez parmi nos modèles professionnels, compatibles avec les ATS",
			},
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
			title: {
				eng: "Download your tailored documents",
				fr: "Téléchargez vos documents personnalisés",
			},
			description: {
				eng: "Get your perfectly matched resume and cover letter ready to submit",
				fr: "Obtenez votre CV et lettre de motivation parfaitement adaptés, prêts à être soumis",
			},
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
			description: {
				eng: "Higher response rate from recruiters",
				fr: "Taux de réponse plus élevé des recruteurs",
			},
		},
		{
			title: "3x",
			description: {
				eng: "More likely to get an interview",
				fr: "Plus de chances d'obtenir un entretien",
			},
		},
		{
			title: "97%",
			description: {
				eng: "ATS pass-through rate",
				fr: "Taux de passage des systèmes ATS",
			},
		},
	];

	const faq_items = [
		{
			question: {
				eng: "How does Portrai create tailored resumes?",
				fr: "Comment Portrai crée-t-il des CV personnalisés ?",
			},
			answer: {
				eng: "Portrai uses advanced AI to analyze job descriptions and identify key requirements, skills, and qualifications. It then creates a perfectly matched resume that highlights your relevant experience and skills for that specific job.",
				fr: "Portrai utilise une IA avancée pour analyser les descriptions de poste et identifier les exigences, compétences et qualifications clés. Il crée ensuite un CV parfaitement adapté qui met en valeur votre expérience et vos compétences pertinentes pour ce poste spécifique.",
			},
		},
		{
			question: {
				eng: "Can I create multiple resumes?",
				fr: "Puis-je créer plusieurs CV ?",
			},
			answer: {
				eng: "Yes! Your subscription allows you to create unlimited resumes and cover letters during your 3-month period. We encourage creating tailored documents for each position you apply to.",
				fr: "Oui ! Votre abonnement vous permet de créer un nombre illimité de CV et de lettres de motivation pendant votre période de 3 mois. Nous vous encourageons à créer des documents personnalisés pour chaque poste auquel vous postulez.",
			},
		},
		{
			question: {
				eng: "What if I need help using the platform?",
				fr: "Que faire si j'ai besoin d'aide pour utiliser la plateforme ?",
			},
			answer: {
				eng: "We offer comprehensive guides and email support to help you get the most out of Portrai. Our team is dedicated to helping you succeed in your job search.",
				fr: "Nous proposons des guides complets et un support par e-mail pour vous aider à tirer le meilleur parti de Portrai. Notre équipe est dédiée à vous aider à réussir dans votre recherche d'emploi.",
			},
		},
		{
			question: {
				eng: "Can I cancel my subscription?",
				fr: "Puis-je annuler mon abonnement ?",
			},
			answer: {
				eng: "Your plan is a one-time payment for 3 months of service, designed to cover a typical job search period. There's no need to cancel as it won't automatically renew.",
				fr: "Votre forfait est un paiement unique pour 3 mois de service, conçu pour couvrir une période typique de recherche d'emploi. Il n'est pas nécessaire d'annuler car il ne se renouvellera pas automatiquement.",
			},
		},
	];

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
								<Fr>Votre CV parfait pour</Fr>
							</Lang>
							<span class="block alice-regular text-forest-100">
								<Lang>
									<En>every job application</En>
									<Fr>chaque candidature</Fr>
								</Lang>
							</span>
						</h1>

						<p class="text-xl text-gray-700">
							<Lang>
								<En>
									Portrai uses AI to instantly generate
									tailored resumes and cover letters that
									match exactly what employers are looking
									for.
								</En>
								<Fr>
									Portrai utilise l'IA pour générer
									instantanément des CV et des lettres de
									motivation personnalisés qui correspondent
									exactement à ce que les employeurs
									recherchent.
								</Fr>
							</Lang>
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
								<span>
									<Lang>
										<En>
											ATS-optimized for higher pass rates
										</En>
										<Fr>
											Optimisé pour les ATS pour de
											meilleurs taux de réussite
										</Fr>
									</Lang>
								</span>
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
									<Lang>
										<En>
											Perfectly matched to job
											requirements
										</En>
										<Fr>
											Parfaitement adapté aux exigences du
											poste
										</Fr>
									</Lang>
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
									<Lang>
										<En>
											Professional templates that stand
											out
										</En>
										<Fr>
											Des modèles professionnels qui se
											démarquent
										</Fr>
									</Lang>
								</span>
							</Motion.li>
						</ul>

						<div class="pt-4">
							<A
								href="/signup?redirectTo=pricing"
								class="bg-forest-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
							>
								<Lang>
									<En>Start Creating Now</En>
									<Fr>Commencer maintenant</Fr>
								</Lang>
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
											<Lang>
												<En>Professional Resume</En>
												<Fr>CV Professionnel</Fr>
											</Lang>
										</h3>
										<p class="text-sm text-gray-600">
											<Lang>
												<En>
													Tailored for your dream job
												</En>
												<Fr>
													Adapté pour l'emploi de vos
													rêves
												</Fr>
											</Lang>
										</p>
									</header>

									<article class="bg-gray-50 rounded-lg border border-gray-200 p-4">
										<h4 class="text-sm font-medium text-gray-500 pb-2">
											<Lang>
												<En>Job Description</En>
												<Fr>Description du poste</Fr>
											</Lang>
										</h4>
										<ul class="flex flex-col gap-3">
											<For each={job_description_steps}>
												{(step) => (
													<li class="flex items-start gap-3">
														<span class="w-3 h-3 rounded-full bg-forest-100 mt-1"></span>
														<p class="text-gray-600 text-sm">
															<Lang>
																<En>
																	{step.eng}
																</En>
																<Fr>
																	{step.fr}
																</Fr>
															</Lang>
														</p>
													</li>
												)}
											</For>
										</ul>
									</article>

									<article class="bg-forest-50 rounded-lg border border-forest-100 p-4">
										<h4 class="text-sm font-medium text-gray-500 pb-2">
											<Lang>
												<En>AI-Optimized Resume</En>
												<Fr>CV optimisé par l'IA</Fr>
											</Lang>
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
							<Lang>
								<En>Why Job Seekers Choose </En>
								<Fr>
									Pourquoi les chercheurs d'emploi choisissent{" "}
								</Fr>
							</Lang>
							<span class="alice-regular">Portrai</span>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							<Lang>
								<En>
									Generic resumes get overlooked. AI-tailored
									applications get interviews.
								</En>
								<Fr>
									Les CV génériques sont ignorés. Les
									candidatures personnalisées par l'IA
									obtiennent des entretiens.
								</Fr>
							</Lang>
						</p>
					</header>

					<div class="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
						<article class="flex flex-col gap-4">
							<h3 class="text-2xl font-semibold text-forest-800">
								<Lang>
									<En>The Problem</En>
									<Fr>Le problème</Fr>
								</Lang>
							</h3>
							<ul class="flex flex-col gap-4">
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Generic resumes fail to
												highlight relevant skills for
												specific jobs
											</En>
											<Fr>
												Les CV génériques ne parviennent
												pas à mettre en évidence les
												compétences pertinentes pour des
												emplois spécifiques
											</Fr>
										</Lang>
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Applicant Tracking Systems (ATS)
												filter out qualified candidates
											</En>
											<Fr>
												Les systèmes de suivi des
												candidatures (ATS) filtrent les
												candidats qualifiés
											</Fr>
										</Lang>
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Creating tailored resumes
												manually is time-consuming
											</En>
											<Fr>
												Créer manuellement des CV
												personnalisés prend beaucoup de
												temps
											</Fr>
										</Lang>
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
										✗
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Most job seekers don't know what
												employers are really looking for
											</En>
											<Fr>
												La plupart des chercheurs
												d'emploi ne savent pas ce que
												les employeurs recherchent
												vraiment
											</Fr>
										</Lang>
									</p>
								</li>
							</ul>
						</article>

						<article class="flex flex-col gap-4">
							<h3 class="text-2xl font-semibold text-forest-800">
								<Lang>
									<En>The Portrai Solution</En>
									<Fr>La solution Portrai</Fr>
								</Lang>
							</h3>
							<ul class="flex flex-col gap-4">
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												AI analysis matches your
												experience to specific job
												requirements
											</En>
											<Fr>
												L'analyse par IA fait
												correspondre votre expérience
												aux exigences spécifiques du
												poste
											</Fr>
										</Lang>
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Keyword optimization ensures
												your resume passes ATS filters
											</En>
											<Fr>
												L'optimisation des mots-clés
												garantit que votre CV passe les
												filtres ATS
											</Fr>
										</Lang>
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Generate perfectly tailored
												documents in minutes, not hours
											</En>
											<Fr>
												Générez des documents
												parfaitement adaptés en quelques
												minutes, pas en heures
											</Fr>
										</Lang>
									</p>
								</li>
								<li class="flex items-start gap-3">
									<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
										✓
									</span>
									<p class="text-gray-700">
										<Lang>
											<En>
												Industry-specific language that
												resonates with hiring managers
											</En>
											<Fr>
												Un langage spécifique à
												l'industrie qui résonne avec les
												recruteurs
											</Fr>
										</Lang>
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
							<Lang>
								<En>How </En>
								<Fr>Comment </Fr>
							</Lang>
							<span class="alice-regular">Portrai</span>
							<Lang>
								<En> Works</En>
								<Fr> fonctionne</Fr>
							</Lang>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							<Lang>
								<En>
									Create a perfectly tailored resume in four
									simple steps
								</En>
								<Fr>
									Créez un CV parfaitement adapté en quatre
									étapes simples
								</Fr>
							</Lang>
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
												<Lang>
													<En>{step.title.eng}</En>
													<Fr>{step.title.fr}</Fr>
												</Lang>
											</h3>
											<p class="text-gray-600">
												<Lang>
													<En>
														{step.description.eng}
													</En>
													<Fr>
														{step.description.fr}
													</Fr>
												</Lang>
											</p>
										</div>
									</li>
								)}
							</For>
						</ol>

						<figure class="flex flex-col gap-8">
							<article class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<h3 class="text-lg font-semibold text-forest-900 mb-4">
									<Lang>
										<En>AI-Powered Analysis</En>
										<Fr>Analyse alimentée par l'IA</Fr>
									</Lang>
								</h3>
								<p class="text-gray-600 mb-4">
									<Lang>
										<En>
											Our AI assistant extracts key
											requirements from job descriptions
											and identifies the most relevant
											parts of your experience.
										</En>
										<Fr>
											Notre assistant IA extrait les
											exigences clés des descriptions de
											poste et identifie les parties les
											plus pertinentes de votre
											expérience.
										</Fr>
									</Lang>
								</p>

								<div class="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
									<div class="flex items-start gap-3">
										<span class="w-4 h-4 rounded-full bg-forest-100 mt-1"></span>
										<div class="flex flex-col gap-1">
											<p class="text-sm text-gray-700">
												<Lang>
													<En>
														<strong>
															Job requires:
														</strong>{" "}
														Experience with React
														and Cloud Technologies
													</En>
													<Fr>
														<strong>
															Le poste requiert :
														</strong>{" "}
														Expérience avec React et
														technologies Cloud
													</Fr>
												</Lang>
											</p>
											<p class="text-xs text-forest-700">
												<Lang>
													<En>
														→ Highlighting your 3
														years of React
														development and AWS
														experience
													</En>
													<Fr>
														→ Mise en valeur de vos
														3 années d'expérience en
														développement React et
														AWS
													</Fr>
												</Lang>
											</p>
										</div>
									</div>

									<div class="flex items-start gap-3">
										<span class="w-4 h-4 rounded-full bg-forest-100 mt-1"></span>
										<div class="flex flex-col gap-1">
											<p class="text-sm text-gray-700">
												<Lang>
													<En>
														<strong>
															Job requires:
														</strong>{" "}
														Leadership in Agile
														environment
													</En>
													<Fr>
														<strong>
															Le poste requiert :
														</strong>{" "}
														Leadership dans un
														environnement Agile
													</Fr>
												</Lang>
											</p>
											<p class="text-xs text-forest-700">
												<Lang>
													<En>
														→ Emphasizing your role
														leading sprints and
														mentoring junior
														developers
													</En>
													<Fr>
														→ Mise en valeur de
														votre rôle dans la
														conduite des sprints et
														le mentorat des
														développeurs juniors
													</Fr>
												</Lang>
											</p>
										</div>
									</div>
								</div>
							</article>

							<article class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<h3 class="text-lg font-semibold text-forest-900 mb-4">
									<Lang>
										<En>
											Resume & Cover Letter Generation
										</En>
										<Fr>
											Génération de CV et de lettre de
											motivation
										</Fr>
									</Lang>
								</h3>
								<p class="text-gray-600 mb-4">
									<Lang>
										<En>
											Portrai creates perfectly matched
											documents highlighting your relevant
											skills and experience in
											professional, ATS-friendly formats.
										</En>
										<Fr>
											Portrai crée des documents
											parfaitement adaptés mettant en
											valeur vos compétences et
											expériences pertinentes dans des
											formats professionnels, compatibles
											avec les ATS.
										</Fr>
									</Lang>
								</p>

								<div class="grid grid-cols-2 gap-4">
									<div class="flex flex-col gap-2 bg-forest-50 p-3 rounded-lg">
										<h4 class="text-sm font-medium text-forest-800">
											<Lang>
												<En>Resume</En>
												<Fr>CV</Fr>
											</Lang>
										</h4>
										<ul class="flex flex-col gap-1">
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-full"></li>
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-5/6"></li>
											<li class="h-2 bg-forest-100 bg-opacity-30 rounded w-3/4"></li>
										</ul>
									</div>

									<div class="flex flex-col gap-2 bg-forest-50 p-3 rounded-lg">
										<h4 class="text-sm font-medium text-forest-800">
											<Lang>
												<En>Cover Letter</En>
												<Fr>Lettre de motivation</Fr>
											</Lang>
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
							<Lang>
								<En>Maximize Your </En>
								<Fr>Maximisez votre </Fr>
							</Lang>
							<span class="alice-regular">
								<Lang>
									<En>Success Rate</En>
									<Fr>Taux de réussite</Fr>
								</Lang>
							</span>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							<Lang>
								<En>
									AI-tailored applications significantly
									increase your interview chances
								</En>
								<Fr>
									Les candidatures personnalisées par l'IA
									augmentent considérablement vos chances
									d'entretien
								</Fr>
							</Lang>
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
										<Lang>
											<En>{advantage.description.eng}</En>
											<Fr>{advantage.description.fr}</Fr>
										</Lang>
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
							<Lang>
								<En>Premium </En>
								<Fr>Modèles </Fr>
							</Lang>
							<span class="alice-regular">
								<Lang>
									<En>ATS-friendly</En>
									<Fr>compatibles ATS</Fr>
								</Lang>
							</span>
							<Lang>
								<En> Templates</En>
								<Fr> premium</Fr>
							</Lang>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							<Lang>
								<En>
									Stand out with our professionally designed
									templates
								</En>
								<Fr>
									Démarquez-vous avec nos modèles conçus
									professionnellement
								</Fr>
							</Lang>
						</p>
					</header>

					<figure class="max-w-4xl mx-auto">
						<div class="flex flex-wrap justify-center gap-8">
							<article class="bg-white rounded-xl flex flex-col items-center gap-4 shadow-lg p-6 border border-gray-100 group hover:shadow-xl transition-all w-full lg:w-96">
								<div class="w-full aspect-[3/4]">
									<img
										src={EXECUTING_RESUME}
										alt="<Lang><En>Executive template preview</En><Fr>Aperçu du modèle Cadre</Fr></Lang>"
										class="object-cover w-full h-full rounded-lg"
									/>
								</div>
								<div class="text-center">
									<h3 class="font-medium text-lg text-forest-900">
										<Lang>
											<En>Executive Professional</En>
											<Fr>Professionnel Cadre</Fr>
										</Lang>
									</h3>
									<p class="text-gray-600 pt-2">
										<Lang>
											<En>
												Sophisticated layout for senior
												professionals and executives
											</En>
											<Fr>
												Mise en page sophistiquée pour
												professionnels seniors et cadres
											</Fr>
										</Lang>
									</p>
								</div>
							</article>
						</div>

						<p class="text-center mt-8 text-gray-600">
							<A
								href="/templates"
								class="text-forest-700 font-medium hover:underline inline-flex items-center gap-2"
							>
								<Lang>
									<En>View all templates</En>
									<Fr>Voir tous les modèles</Fr>
								</Lang>
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
				<section class="w-full py-16 bg-white rounded-xl shadow-md border border-gray-100 p-8">
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							<Lang>
								<En>Simple Pricing</En>
								<Fr>Tarification simple</Fr>
							</Lang>
						</h2>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							<Lang>
								<En>Everything you need for your job search</En>
								<Fr>
									Tout ce dont vous avez besoin pour votre
									recherche d'emploi
								</Fr>
							</Lang>
						</p>
					</header>

					<article class="max-w-md mx-auto rounded-xl shadow-lg border border-forest-100 overflow-hidden">
						<header class="bg-forest-50 p-6 text-center">
							<h3 class="text-2xl font-semibold text-forest-900">
								<Lang>
									<En>3-Month Access Plan</En>
									<Fr>Forfait d'accès de 3 mois</Fr>
								</Lang>
							</h3>
							<p class="mt-4">
								<span class="text-base font-medium text-gray-500">
									<Lang>
										<En>Only </En>
										<Fr>Seulement </Fr>
									</Lang>
								</span>
								<strong class="text-4xl font-extrabold text-forest-900">
									20€
								</strong>
							</p>
						</header>

						<div class="p-6 bg-white">
							<ul class="flex flex-col gap-4 mb-8">
								<li class="flex items-center gap-3">
									<span class="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
										✓
									</span>
									<span class="text-gray-700">
										<Lang>
											<En>Unlimited resume creation</En>
											<Fr>Création illimitée de CV</Fr>
										</Lang>
									</span>
								</li>
								<li class="flex items-center gap-3">
									<span class="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
										✓
									</span>
									<span class="text-gray-700">
										<Lang>
											<En>AI-powered resume tailoring</En>
											<Fr>
												Personnalisation de CV par IA
											</Fr>
										</Lang>
									</span>
								</li>
								<li class="flex items-center gap-3">
									<span class="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
										✓
									</span>
									<span class="text-gray-700">
										<Lang>
											<En>AI-powered cover letters</En>
											<Fr>
												Lettres de motivation générées
												par IA
											</Fr>
										</Lang>
									</span>
								</li>
								<li class="flex items-center gap-3">
									<span class="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm">
										✓
									</span>
									<span class="text-gray-700">
										<Lang>
											<En>
												Premium ATS-friendly templates
											</En>
											<Fr>
												Modèles premium compatibles ATS
											</Fr>
										</Lang>
									</span>
								</li>
							</ul>

							<A
								href="/pricing"
								class="w-full block bg-forest-700 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-forest-800 transition-all"
							>
								<Lang>
									<En>Get Started</En>
									<Fr>Commencer</Fr>
								</Lang>
							</A>
						</div>
					</article>
				</section>

				{/* FAQ Section */}
				<section class="w-full py-16">
					<header class="text-center mb-12">
						<h2 class="text-3xl font-bold text-forest-900 mb-4">
							<Lang>
								<En>Frequently Asked Questions</En>
								<Fr>Questions fréquemment posées</Fr>
							</Lang>
						</h2>
					</header>

					<ul class="max-w-3xl mx-auto flex flex-col gap-6">
						<For each={faq_items}>
							{(item) => (
								<li class="border-b border-gray-200 pb-6">
									<h3 class="text-xl font-semibold text-forest-800 mb-3">
										<Lang>
											<En>{item.question.eng}</En>
											<Fr>{item.question.fr}</Fr>
										</Lang>
									</h3>
									<p class="text-gray-700">
										<Lang>
											<En>{item.answer.eng}</En>
											<Fr>{item.answer.fr}</Fr>
										</Lang>
									</p>
								</li>
							)}
						</For>
					</ul>
				</section>

				{/* Call to Action */}
				<section class="w-full py-16 bg-forest-50 rounded-xl p-8 text-center">
					<h2 class="text-3xl font-bold text-forest-900 mb-4">
						<Lang>
							<En>Ready to Land Your Dream Job?</En>
							<Fr>Prêt à décrocher l'emploi de vos rêves ?</Fr>
						</Lang>
					</h2>
					<p class="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
						<Lang>
							<En>
								Stop sending generic resumes that get
								overlooked. Start creating perfectly tailored
								applications that get interviews.
							</En>
							<Fr>
								Arrêtez d'envoyer des CV génériques qui sont
								ignorés. Commencez à créer des candidatures
								parfaitement adaptées qui vous permettent
								d'obtenir des entretiens.
							</Fr>
						</Lang>
					</p>

					<A
						href="/signup"
						class="bg-forest-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
					>
						<Lang>
							<En>Create Your First Resume</En>
							<Fr>Créez votre premier CV</Fr>
						</Lang>
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

export default ProductPage;
