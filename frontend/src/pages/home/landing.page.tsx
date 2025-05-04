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
		  title: () => (
			<Lang>
			  {[
				<En>Tell us about yourself</En>,
				<Fr>Parlez-nous de vous</Fr>
			  ]}
			</Lang>
		  ),
		  description: () => (
			<Lang>
			  {[
				<En>Share your professional experience, skills, and education with our AI assistant</En>,
				<Fr>Partagez votre expérience professionnelle, vos compétences et votre formation avec notre assistant IA</Fr>
			  ]}
			</Lang>
		  ),
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
		  description: () => (
			<Lang>
			  {[
				<En>Add the job offer you want to apply for - our AI will analyze key requirements</En>,
				<Fr>Ajoutez l'offre d'emploi à laquelle vous souhaitez postuler - notre IA analysera les exigences clés</Fr>
			  ]}
			</Lang>
		  ),
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
		  title: () => (
			<Lang>
			  {[
				<En>Select your template</En>,
				<Fr>Sélectionnez votre modèle</Fr>
			  ]}
			</Lang>
		  ),
		  description: () => (
			<Lang>
			  {[
				<En>Choose from our professionally designed, ATS-friendly templates</En>,
				<Fr>Choisissez parmi nos modèles professionnels compatibles avec les ATS</Fr>
			  ]}
			</Lang>
		  ),
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
		  title: () => (
			<Lang>
			  {[
				<En>Download your tailored documents</En>,
				<Fr>Téléchargez vos documents personnalisés</Fr>
			  ]}
			</Lang>
		  ),
		  description: () => (
			<Lang>
			  {[
				<En>Get your perfectly matched resume and cover letter ready to submit</En>,
				<Fr>Obtenez votre CV et lettre de motivation parfaitement adaptés, prêts à être soumis</Fr>
			  ]}
			</Lang>
		  ),
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
		  description: () => (
			<Lang>
			  {[
				<En>Higher response rate from recruiters</En>,
				<Fr>Taux de réponse plus élevé des recruteurs</Fr>
			  ]}
			</Lang>
		  ),
		},
		{
		  title: "3x",
		  description: () => (
			<Lang>
			  {[
				<En>More likely to get an interview</En>,
				<Fr>Plus de chances d'obtenir un entretien</Fr>
			  ]}
			</Lang>
		  ),
		},
		{
		  title: "97%",
		  description: () => (
			<Lang>
			  {[
				<En>ATS pass-through rate</En>,
				<Fr>Taux de passage des ATS</Fr>
			  ]}
			</Lang>
		  ),
		},
	  ];
	
	  const faq_items = [
		{
		  question: () => (
			<Lang>
			  {[
				<En>How does Portrai create tailored resumes?</En>,
				<Fr>Comment Portrai crée-t-il des CV personnalisés?</Fr>
			  ]}
			</Lang>
		  ),
		  answer: () => (
			<Lang>
			  {[
				<En>Portrai uses advanced AI to analyze job descriptions and identify key requirements, skills, and qualifications. It then creates a perfectly matched resume that highlights your relevant experience and skills for that specific job.</En>,
				<Fr>Portrai utilise une IA avancée pour analyser les descriptions de poste et identifier les exigences, compétences et qualifications clés. Il crée ensuite un CV parfaitement adapté qui met en valeur votre expérience et vos compétences pertinentes pour ce poste spécifique.</Fr>
			  ]}
			</Lang>
		  ),
		},
		{
		  question: () => (
			<Lang>
			  {[
				<En>Can I create multiple resumes?</En>,
				<Fr>Puis-je créer plusieurs CV?</Fr>
			  ]}
			</Lang>
		  ),
		  answer: () => (
			<Lang>
			  {[
				<En>Yes! Your subscription allows you to create unlimited resumes and cover letters during your 3-month period. We encourage creating tailored documents for each position you apply to.</En>,
				<Fr>Oui! Votre abonnement vous permet de créer un nombre illimité de CV et de lettres de motivation pendant votre période de 3 mois. Nous vous encourageons à créer des documents adaptés pour chaque poste auquel vous postulez.</Fr>
			  ]}
			</Lang>
		  ),
		},
		{
		  question: () => (
			<Lang>
			  {[
				<En>What if I need help using the platform?</En>,
				<Fr>Que faire si j'ai besoin d'aide pour utiliser la plateforme?</Fr>
			  ]}
			</Lang>
		  ),
		  answer: () => (
			<Lang>
			  {[
				<En>We offer comprehensive guides and email support to help you get the most out of Portrai. Our team is dedicated to helping you succeed in your job search.</En>,
				<Fr>Nous proposons des guides complets et un support par email pour vous aider à tirer le meilleur parti de Portrai. Notre équipe est dédiée à vous aider à réussir dans votre recherche d'emploi.</Fr>
			  ]}
			</Lang>
		  ),
		},
		{
		  question: () => (
			<Lang>
			  {[
				<En>Can I cancel my subscription?</En>,
				<Fr>Puis-je annuler mon abonnement?</Fr>
			  ]}
			</Lang>
		  ),
		  answer: () => (
			<Lang>
			  {[
				<En>Your plan is a one-time payment for 3 months of service, designed to cover a typical job search period. There's no need to cancel as it won't automatically renew.</En>,
				<Fr>Votre forfait est un paiement unique pour 3 mois de service, conçu pour couvrir une période typique de recherche d'emploi. Il n'est pas nécessaire d'annuler car il ne se renouvellera pas automatiquement.</Fr>
			  ]}
			</Lang>
		  ),
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
					{[
					<En>Your perfect resume for</En>,
					<Fr>Votre CV parfait pour</Fr>
					]}
				</Lang>
				<span class="block alice-regular text-forest-100">
					<Lang>
					{[
						<En>every job application</En>,
						<Fr>chaque candidature</Fr>
					]}
					</Lang>
				</span>
				</h1>

				<p class="text-xl text-gray-700">
				<Lang>
					{[
					<En>Portrai uses AI to instantly generate tailored resumes and cover letters that match exactly what employers are looking for.</En>,
					<Fr>Portrai utilise l'IA pour générer instantanément des CV et des lettres de motivation sur mesure qui correspondent exactement à ce que les employeurs recherchent.</Fr>
					]}
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
						{[
						<En>ATS-optimized for higher pass rates</En>,
						<Fr>Optimisé pour les ATS avec des taux de réussite plus élevés</Fr>
						]}
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
						{[
						<En>Perfectly matched to job requirements</En>,
						<Fr>Parfaitement adapté aux exigences du poste</Fr>
						]}
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
						{[
						<En>Professional templates that stand out</En>,
						<Fr>Des modèles professionnels qui se démarquent</Fr>
						]}
					</Lang>
					</span>
				</Motion.li>
				</ul>

				<div class="pt-4">
				<A
					href="#pricing"
					onClick={(e) => {
					e.preventDefault();
					const element = document.getElementById("pricing");
					element?.scrollIntoView({
						behavior: "smooth",
					});
					}}
					class="bg-forest-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
				>
					<Lang>
					{[
						<En>Start Creating Now</En>,
						<Fr>Commencer maintenant</Fr>
					]}
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
							{[
							<En>Professional Resume</En>,
							<Fr>CV Professionnel</Fr>
							]}
						</Lang>
						</h3>
						<p class="text-sm text-gray-600">
						<Lang>
							{[
							<En>Tailored for your dream job</En>,
							<Fr>Adapté pour l'emploi de vos rêves</Fr>
							]}
						</Lang>
						</p>
					</header>

					<article class="bg-gray-50 rounded-lg border border-gray-200 p-4">
						<h4 class="text-sm font-medium text-gray-500 pb-2">
						<Lang>
							{[
							<En>Job Description</En>,
							<Fr>Description du poste</Fr>
							]}
						</Lang>
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
						<Lang>
							{[
							<En>AI-Optimized Resume</En>,
							<Fr>CV optimisé par IA</Fr>
							]}
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
					{[
					<En>Why Job Seekers Choose</En>,
					<Fr>Pourquoi les chercheurs d'emploi choisissent</Fr>
					]}
				</Lang>{" "}
				<span class="alice-regular">Portrai</span>
				</h2>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				<Lang>
					{[
					<En>Generic resumes get overlooked. AI-tailored applications get interviews.</En>,
					<Fr>Les CV génériques sont ignorés. Les candidatures personnalisées par IA obtiennent des entretiens.</Fr>
					]}
				</Lang>
				</p>
			</header>

			<div class="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
				<article class="flex flex-col gap-4">
				<h3 class="text-2xl font-semibold text-forest-800">
					<Lang>
					{[
						<En>The Problem</En>,
						<Fr>Le problème</Fr>
					]}
					</Lang>
				</h3>
				<ul class="flex flex-col gap-4">
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
						✗
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Generic resumes fail to highlight relevant skills for specific jobs</En>,
							<Fr>Les CV génériques ne mettent pas en valeur les compétences pertinentes pour des emplois spécifiques</Fr>
						]}
						</Lang>
					</p>
					</li>
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
						✗
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Applicant Tracking Systems (ATS) filter out qualified candidates</En>,
							<Fr>Les systèmes de suivi des candidatures (ATS) filtrent les candidats qualifiés</Fr>
						]}
						</Lang>
					</p>
					</li>
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
						✗
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Creating tailored resumes manually is time-consuming</En>,
							<Fr>La création manuelle de CV personnalisés prend beaucoup de temps</Fr>
						]}
						</Lang>
					</p>
					</li>
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mt-1">
						✗
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Most job seekers don't know what employers are really looking for</En>,
							<Fr>La plupart des chercheurs d'emploi ne savent pas ce que les employeurs recherchent vraiment</Fr>
						]}
						</Lang>
					</p>
					</li>
				</ul>
				</article>

				<article class="flex flex-col gap-4">
				<h3 class="text-2xl font-semibold text-forest-800">
					<Lang>
					{[
						<En>The Portrai Solution</En>,
						<Fr>La solution Portrai</Fr>
					]}
					</Lang>
				</h3>
				<ul class="flex flex-col gap-4">
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
						✓
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>AI analysis matches your experience to specific job requirements</En>,
							<Fr>L'analyse par IA fait correspondre votre expérience aux exigences spécifiques du poste</Fr>
						]}
						</Lang>
					</p>
					</li>
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
						✓
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Keyword optimization ensures your resume passes ATS filters</En>,
							<Fr>L'optimisation des mots-clés garantit que votre CV passe les filtres ATS</Fr>
						]}
						</Lang>
					</p>
					</li>
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
						✓
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Generate perfectly tailored documents in minutes, not hours</En>,
							<Fr>Générez des documents parfaitement adaptés en quelques minutes, pas en heures</Fr>
						]}
						</Lang>
					</p>
					</li>
					<li class="flex items-start gap-3">
					<span class="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-900 font-bold text-sm mt-1">
						✓
					</span>
					<p class="text-gray-700">
						<Lang>
						{[
							<En>Industry-specific language that resonates with hiring managers</En>,
							<Fr>Un langage spécifique à l'industrie qui résonne avec les recruteurs</Fr>
						]}
						</Lang>
					</p>
					</li>
				</ul>
				</article>
			</div>
			</section>

			{/* Results Section */}
			<section class="w-full py-16 bg-forest-50 rounded-xl p-8">
			<header class="text-center mb-12">
				<h2 class="text-3xl font-bold text-forest-900 mb-4">
				<Lang>
					{[
					<En>Maximize Your</En>,
					<Fr>Maximisez votre</Fr>
					]}
				</Lang>{" "}
				<span class="alice-regular">
					<Lang>
					{[
						<En>Success Rate</En>,
						<Fr>Taux de réussite</Fr>
					]}
					</Lang>
				</span>
				</h2>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				<Lang>
					{[
					<En>AI-tailored applications significantly increase your interview chances</En>,
					<Fr>Les candidatures personnalisées par IA augmentent considérablement vos chances d'entretien</Fr>
					]}
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
						{advantage.description()}
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
					{[
					<En>Premium</En>,
					<Fr>Modèles</Fr>
					]}
				</Lang>{" "}
				<span class="alice-regular">
					<Lang>
					{[
						<En>ATS-friendly</En>,
						<Fr>professionnels</Fr>
					]}
					</Lang>
				</span>{" "}
				<Lang>
					{[
					<En>Templates</En>,
					<Fr>compatibles ATS</Fr>
					]}
				</Lang>
				</h2>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				<Lang>
					{[
					<En>Stand out with our professionally designed templates</En>,
					<Fr>Démarquez-vous avec nos modèles conçus professionnellement</Fr>
					]}
				</Lang>
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
						<Lang>
						{[
							<En>Executive Professional</En>,
							<Fr>Professionnel Exécutif</Fr>
						]}
						</Lang>
					</h3>
					<p class="text-gray-600 pt-2">
						<Lang>
						{[
							<En>Sophisticated layout for senior professionals and executives</En>,
							<Fr>Mise en page sophistiquée pour les professionnels seniors et les cadres</Fr>
						]}
						</Lang>
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
						<Lang>
						{[
							<En>Light</En>,
							<Fr>Léger</Fr>
						]}
						</Lang>
					</h3>
					<p class="text-gray-600 pt-2">
						<Lang>
						{[
							<En>Light and temperate design.</En>,
							<Fr>Design léger et tempéré.</Fr>
						]}
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
					{[
						<En>View all templates</En>,
						<Fr>Voir tous les modèles</Fr>
					]}
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
			<section
			id={"pricing"}
			class="w-full py-16 bg-white rounded-xl shadow-md border border-gray-100 p-8"
			>
			<header class="text-center mb-12">
				<h2 class="text-3xl font-bold text-forest-900 mb-4">
				<Lang>
					{[
					<En>Simple Pricing</En>,
					<Fr>Tarification simple</Fr>
					]}
				</Lang>
				</h2>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				<Lang>
					{[
					<En>Everything you need for your job search</En>,
					<Fr>Tout ce dont vous avez besoin pour votre recherche d'emploi</Fr>
					]}
				</Lang>
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
				<Lang>
					{[
					<En>Frequently Asked Questions</En>,
					<Fr>Questions fréquemment posées</Fr>
					]}
				</Lang>
				</h2>
			</header>

			<ul class="max-w-3xl mx-auto flex flex-col gap-6">
				<For each={faq_items}>
				{(item) => (
					<li class="border-b border-gray-200 pb-6">
					<h3 class="text-xl font-semibold text-forest-800 mb-3">
						{item.question()}
					</h3>
					<p class="text-gray-700">{item.answer()}</p>
					</li>
				)}
				</For>
			</ul>
			</section>

			{/* Call to Action */}
			<section class="w-full py-16 bg-forest-50 rounded-xl p-8 text-center">
			<h2 class="text-3xl font-bold text-forest-900 mb-4">
				<Lang>
				{[
					<En>Ready to Land Your Dream Job?</En>,
					<Fr>Prêt à décrocher l'emploi de vos rêves?</Fr>
				]}
				</Lang>
			</h2>
			<p class="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
				<Lang>
				{[
					<En>Stop sending generic resumes that get overlooked. Start creating perfectly tailored applications that get interviews.</En>,
					<Fr>Arrêtez d'envoyer des CV génériques qui sont ignorés. Commencez à créer des candidatures parfaitement adaptées qui décrochent des entretiens.</Fr>
				]}
				</Lang>
			</p>

			<A
				href="/signup"
				class="bg-forest-900 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group"
			>
				<Lang>
				{[
					<En>Create Your First Resume</En>,
					<Fr>Créez votre premier CV</Fr>
				]}
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

export default LandingPage;
