import Footer from "@components/footer.default";
import Header from "@components/header.autherized";
import { En, Fr, Lang } from "@components/language";
import { createSignal, Show, For } from "solid-js";

interface AboutUsPageProps {}

function AboutUs(props: AboutUsPageProps) {
	const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");
	const [active_tab, set_active_tab] = createSignal("mission");
	const skills = [
		{
			eng: "Product Strategy",
			fr: "Stratégie Produit"
		},
		{
			eng: "Agile Methodologies",
			fr: "Méthodologies Agiles"
		},
		{
			eng: "User Research",
			fr: "Recherche Utilisateur"
		},
		{
			eng: "Data Analytics",
			fr: "Analyse de Données"
		},
		{
			eng: "Roadmap Planning",
			fr: "Planification de Feuille de Route"
		},
		{
			eng: "UX Design",
			fr: "Conception UX"
		},
	];

	const experiences = [
		{
			title: {
				eng: "Senior Product Manager",
				fr: "Chef de Produit Senior"
			},
			company: {
				eng: "TechInnovate Solutions, San Francisco",
				fr: "TechInnovate Solutions, San Francisco"
			},
			period: {
				eng: "Jan 2020 - Present",
				fr: "Jan 2020 - Présent"
			},
			achievements: [
				{
					eng: "Led cross-functional team in developing AI-powered analytics platform",
					fr: "Direction d'une équipe transversale dans le développement d'une plateforme d'analyse alimentée par l'IA"
				},
				{
					eng: "Increased user engagement by 45% through strategic product improvements",
					fr: "Augmentation de l'engagement des utilisateurs de 45% grâce à des améliorations stratégiques du produit"
				},
				{
					eng: "Implemented agile methodologies reducing development cycle by 30%",
					fr: "Implémentation de méthodologies agiles réduisant le cycle de développement de 30%"
				},
			],
		},
	];
	
	const education = [
		{
			degree: {
				eng: "MBA in Technology Management",
				fr: "MBA en Gestion des Technologies"
			},
			institution: {
				eng: "Stanford Graduate School of Business",
				fr: "École Supérieure de Commerce de Stanford"
			},
			period: {
				eng: "Sep 2015 - May 2017",
				fr: "Sept 2015 - Mai 2017"
			},
		},
	];
	
	const values = [
		{
			name: {
				eng: "Personalization",
				fr: "Personnalisation"
			},
			description: {
				eng: "We believe every job application should be uniquely tailored to highlight the perfect match between candidate and opportunity.",
				fr: "Nous pensons que chaque candidature devrait être adaptée de manière unique pour mettre en évidence la correspondance parfaite entre le candidat et l'opportunité."
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
			name: {
				eng: "Accessibility",
				fr: "Accessibilité"
			},
			description: {
				eng: "We're committed to making professional-quality career document creation accessible to everyone, regardless of writing skill or background.",
				fr: "Nous nous engageons à rendre la création de documents de carrière de qualité professionnelle accessible à tous, quelles que soient leurs compétences rédactionnelles ou leur origine."
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
					<path d="M12 2v20"></path>
					<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
				</svg>
			),
		},
		{
			name: {
				eng: "Ethical AI",
				fr: "IA Éthique"
			},
			description: {
				eng: "We develop our technology with a strong ethical framework, ensuring privacy, transparency, and equitable outcomes for all job seekers.",
				fr: "Nous développons notre technologie avec un cadre éthique solide, assurant la confidentialité, la transparence et des résultats équitables pour tous les chercheurs d'emploi."
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
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
			),
		},
		{
			name: {
				eng: "Career Empowerment",
				fr: "Autonomisation Professionnelle"
			},
			description: {
				eng: "We build tools that empower individuals to present their best professional selves and achieve their career goals.",
				fr: "Nous construisons des outils qui permettent aux individus de présenter leur meilleur profil professionnel et d'atteindre leurs objectifs de carrière."
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
					<polyline points="9 11 12 14 22 4"></polyline>
					<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
				</svg>
			),
		},
	];
	
	type TabId = "mission" | "story" | "values";
	
	const tabs = [
		{ 
			id: "mission" as TabId, 
			name: {
				eng: "Our Mission",
				fr: "Notre Mission"
			}
		},
		{ 
			id: "story" as TabId, 
			name: {
				eng: "Our Story",
				fr: "Notre Histoire"
			}
		},
		{ 
			id: "values" as TabId, 
			name: {
				eng: "Our Values",
				fr: "Nos Valeurs"
			}
		},
	];

	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen">
	<Header />

	<section class="w-full flex flex-col gap-8 py-8 grow">
		<header class="text-center mb-6">
			<h1 class="text-4xl font-bold text-forest-900 mb-3">
				<Lang>
					<En>About{" "}</En>
					<Fr>À propos de{" "}</Fr>
				</Lang>
				<span class="font-medium tracking-widest">
					PORTR
					<span class="alice-regular text-forest-900">
						AI
					</span>
				</span>
			</h1>
			<p class="text-lg text-gray-600 max-w-3xl mx-auto">
				<Lang>
					<En>Empowering job seekers with AI-driven resume and cover letter generation tailored specifically to job opportunities.</En>
					<Fr>Autonomiser les chercheurs d'emploi avec la génération de CV et de lettres de motivation basée sur l'IA, adaptée spécifiquement aux opportunités d'emploi.</Fr>
				</Lang>
			</p>
		</header>

		{/* Tabs Navigation */}
		<nav class="border-b border-gray-200 flex flex-wrap gap-2 lg:gap-0">
			<For each={tabs}>
				{(tab) => (
					<button
						onClick={() => set_active_tab(tab.id)}
						classList={{
							"px-6 py-3 font-medium text-sm lg:text-base":
								true,
							"border-b-2 border-forest-600 text-forest-600":
								active_tab() === tab.id,
							"text-gray-500 hover:text-forest-600 smooth-transition":
								active_tab() !== tab.id,
						}}
						aria-selected={active_tab() === tab.id}
					>
						<Lang>
							<En>{tab.name.eng}</En>
							<Fr>{tab.name.fr}</Fr>
						</Lang>
					</button>
				)}
			</For>
		</nav>

		{/* Tab Content */}
		<article class="py-6" aria-live="polite">
			{/* Mission Tab */}
			<Show when={active_tab() === "mission"}>
				<section class="grid lg:grid-cols-2 gap-12">
					<div class="flex flex-col gap-4">
						<h2 class="text-2xl font-bold text-forest-800">
							<Lang>
								<En>Our Mission</En>
								<Fr>Notre Mission</Fr>
							</Lang>
						</h2>
						<p class="text-gray-700">
							<Lang>
								<En>At Portrai, we're on a mission to revolutionize the job application process by creating AI tools that perfectly match candidates with opportunities. We believe everyone deserves compelling career documents that highlight their unique qualifications for each specific role they apply to.</En>
								<Fr>Chez Portrai, notre mission est de révolutionner le processus de candidature en créant des outils d'IA qui associent parfaitement les candidats aux opportunités. Nous croyons que tout le monde mérite des documents de carrière convaincants qui mettent en évidence leurs qualifications uniques pour chaque rôle spécifique auquel ils postulent.</Fr>
							</Lang>
						</p>
						<p class="text-gray-700">
							<Lang>
								<En>Our platform bridges the gap between generic resumes and what employers are actually looking for, making it simple for anyone to generate tailored resumes and cover letters that significantly improve their chances of landing interviews.</En>
								<Fr>Notre plateforme comble le fossé entre les CV génériques et ce que les employeurs recherchent réellement, permettant à chacun de générer facilement des CV et des lettres de motivation personnalisés qui améliorent considérablement leurs chances d'obtenir des entretiens.</Fr>
							</Lang>
						</p>
						<p class="text-gray-700">
							<Lang>
								<En>We're committed to leveling the playing field in the job market by giving all candidates access to sophisticated document optimization technology that understands what recruiters and hiring managers are seeking.</En>
								<Fr>Nous nous engageons à égaliser les chances sur le marché du travail en donnant à tous les candidats accès à une technologie sophistiquée d'optimisation de documents qui comprend ce que les recruteurs et les responsables du recrutement recherchent.</Fr>
							</Lang>
						</p>
					</div>

					<figure class="flex-1">
						<div class="relative aspect-square max-w-lg">
							<div class="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-6">
								<div class="h-full overflow-auto">
									<header class="text-center mb-6">
										<h1 class="text-3xl font-bold text-gray-900">
											Alexandra Rodriguez
										</h1>
										<p class="text-sm text-gray-600">
											<Lang>
												<En>Senior Product Manager</En>
												<Fr>Chef de Produit Senior</Fr>
											</Lang> | 
											alexandra.rodriguez@email.com | (415) 555-0123
										</p>
										<p class="text-xs text-gray-500">
											San Francisco, CA | LinkedIn: /in/alexandrarodriguez
										</p>
									</header>

									<section class="mb-5">
										<h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
											<Lang>
												<En>Professional Experience</En>
												<Fr>Expérience Professionnelle</Fr>
											</Lang>
										</h2>
										<For each={experiences}>
											{(exp) => (
												<div class="mb-4">
													<div class="flex justify-between items-baseline">
														<h3 class="font-bold text-gray-800">
															<Lang>
																<En>{exp.title.eng}</En>
																<Fr>{exp.title.fr}</Fr>
															</Lang>
														</h3>
														<span class="text-xs text-gray-600">
															<Lang>
																<En>{exp.period.eng}</En>
																<Fr>{exp.period.fr}</Fr>
															</Lang>
														</span>
													</div>
													<p class="text-sm italic text-gray-700">
														<Lang>
															<En>{exp.company.eng}</En>
															<Fr>{exp.company.fr}</Fr>
														</Lang>
													</p>
													<ul class="list-disc pl-5 text-xs text-gray-700 space-y-1 mt-2">
														<For each={exp.achievements}>
															{(achievement) => (
																<li>
																	<Lang>
																		<En>{achievement.eng}</En>
																		<Fr>{achievement.fr}</Fr>
																	</Lang>
																</li>
															)}
														</For>
													</ul>
												</div>
											)}
										</For>
									</section>

									<section class="mb-5">
										<h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
											<Lang>
												<En>Education</En>
												<Fr>Formation</Fr>
											</Lang>
										</h2>
										<For each={education}>
											{(edu) => (
												<div>
													<div class="flex justify-between items-baseline">
														<h3 class="font-bold text-gray-800">
															<Lang>
																<En>{edu.degree.eng}</En>
																<Fr>{edu.degree.fr}</Fr>
															</Lang>
														</h3>
														<span class="text-xs text-gray-600">
															<Lang>
																<En>{edu.period.eng}</En>
																<Fr>{edu.period.fr}</Fr>
															</Lang>
														</span>
													</div>
													<p class="text-sm italic text-gray-700">
														<Lang>
															<En>{edu.institution.eng}</En>
															<Fr>{edu.institution.fr}</Fr>
														</Lang>
													</p>
												</div>
											)}
										</For>
									</section>

									<section>
										<h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-3">
											<Lang>
												<En>Skills</En>
												<Fr>Compétences</Fr>
											</Lang>
										</h2>
										<div class="flex flex-wrap gap-2">
											<For each={skills}>
												{(skill) => (
													<span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
														<Lang>
															<En>{skill.eng}</En>
															<Fr>{skill.fr}</Fr>
														</Lang>
													</span>
												)}
											</For>
										</div>
									</section>
								</div>
							</div>
							<div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-forest-900 rounded-2xl" />
						</div>
					</figure>
				</section>
			</Show>

			{/* Story Tab */}
			<Show when={active_tab() === "story"}>
				<section class="grid lg:grid-cols-2 gap-12">
					<div class="flex flex-col gap-4">
						<h2 class="text-2xl font-bold text-forest-800">
							<Lang>
								<En>Our Story</En>
								<Fr>Notre Histoire</Fr>
							</Lang>
						</h2>
						<p class="text-gray-700">
							<Lang>
								<En>Portrai began in early 2023 when our founders, a group of AI researchers and career service professionals, recognized how challenging it was for job seekers to customize their applications for each position they applied to.</En>
								<Fr>Portrai a débuté au début de 2023 lorsque nos fondateurs, un groupe de chercheurs en IA et de professionnels des services de carrière, ont reconnu à quel point il était difficile pour les chercheurs d'emploi de personnaliser leurs candidatures pour chaque poste auquel ils postulaient.</Fr>
							</Lang>
						</p>
						<p class="text-gray-700">
							<Lang>
								<En>What started as a project to help friends and family with their job searches quickly evolved as we saw how our early AI prototypes could transform generic resumes into targeted applications that resonated with specific job descriptions.</En>
								<Fr>Ce qui a commencé comme un projet pour aider amis et famille dans leurs recherches d'emploi a rapidement évolué lorsque nous avons vu comment nos premiers prototypes d'IA pouvaient transformer des CV génériques en candidatures ciblées qui résonnaient avec des descriptions de poste spécifiques.</Fr>
							</Lang>
						</p>
						<p class="text-gray-700">
							<Lang>
								<En>After months of development and testing with early users who reported significant improvements in interview rates, we launched Portrai with a vision to make personalized, high-quality job application documents accessible to everyone.</En>
								<Fr>Après des mois de développement et de tests avec les premiers utilisateurs qui ont signalé des améliorations significatives dans les taux d'entretien, nous avons lancé Portrai avec la vision de rendre les documents de candidature personnalisés et de haute qualité accessibles à tous.</Fr>
							</Lang>
						</p>
						<p class="text-gray-700">
							<Lang>
								<En>Today, our platform helps thousands of job seekers worldwide land interviews by creating resumes and cover letters that speak directly to what employers are looking for in each unique role.</En>
								<Fr>Aujourd'hui, notre plateforme aide des milliers de chercheurs d'emploi dans le monde entier à obtenir des entretiens en créant des CV et des lettres de motivation qui répondent directement à ce que les employeurs recherchent dans chaque rôle unique.</Fr>
							</Lang>
						</p>
					</div>
				</section>
			</Show>

			{/* Values Tab */}
			<Show when={active_tab() === "values"}>
				<section class="flex flex-col gap-8">
					<h2 class="text-2xl font-bold text-forest-800">
						<Lang>
							<En>Our Values</En>
							<Fr>Nos Valeurs</Fr>
						</Lang>
					</h2>

					<div class="grid lg:grid-cols-2 gap-x-12 gap-y-8">
						<For each={values}>
							{(value) => (
								<article class="flex flex-col gap-3">
									<figure class="text-forest-600 mb-1">
										{value.icon}
									</figure>
									<h3 class="text-xl font-semibold text-forest-800">
										<Lang>
											<En>{value.name.eng}</En>
											<Fr>{value.name.fr}</Fr>
										</Lang>
									</h3>
									<p class="text-gray-700">
										<Lang>
											<En>{value.description.eng}</En>
											<Fr>{value.description.fr}</Fr>
										</Lang>
									</p>
								</article>
							)}
						</For>
					</div>
				</section>
			</Show>
		</article>

		{/* Call to Action */}
		<Show when={!is_authenticated}>
			<aside class="bg-forest-50 border border-forest-100 rounded-xl p-8 text-center mt-6">
				<h2 class="text-2xl font-bold text-forest-800 mb-3">
					<Lang>
						<En>Land Your Dream Job</En>
						<Fr>Décrochez le Job de Vos Rêves</Fr>
					</Lang>
				</h2>
				<p class="text-gray-700 max-w-2xl mx-auto mb-6">
					<Lang>
						<En>Whether you're actively job hunting, exploring new opportunities, or just want to keep your resume updated, our AI-powered platform helps you create tailored application documents that get results.</En>
						<Fr>Que vous soyez activement à la recherche d'un emploi, que vous exploriez de nouvelles opportunités ou que vous souhaitiez simplement tenir votre CV à jour, notre plateforme alimentée par l'IA vous aide à créer des documents de candidature personnalisés qui donnent des résultats.</Fr>
					</Lang>
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a
						href="/signup"
						class="px-6 py-3 bg-forest-700 text-white rounded-lg hover:bg-forest-800 smooth-transition"
					>
						<Lang>
							<En>Create Your Resume</En>
							<Fr>Créez Votre CV</Fr>
						</Lang>
					</a>
					<a
						href="/pricing"
						class="px-6 py-3 border border-forest-700 text-forest-700 rounded-lg hover:bg-forest-50 smooth-transition"
					>
						<Lang>
							<En>View Plans</En>
							<Fr>Voir les Forfaits</Fr>
						</Lang>
					</a>
				</div>
			</aside>
		</Show>
	</section>
	<Footer />
</main>
	);
}

export default AboutUs;
