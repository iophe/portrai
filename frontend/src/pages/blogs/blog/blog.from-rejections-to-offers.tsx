// File path: /blog/from-rejections-to-offers.tsx
import { JSX } from "solid-js";
import Footer from "@components/footer.default";
import Header from "@components/header.autherized";
import { A } from "@solidjs/router";
import { En, Fr, Lang } from "@components/language";

export const metadata = {
	id: "from-rejections-to-offers",
	title: {
		eng: "How I Went From 60 Rejections to 5 Job Offers by Tailoring My Resume (And How You Can Too)",
		fr: "Comment je suis passé de 60 refus à 5 offres d'emploi en adaptant mon CV (et comment vous pouvez faire de même)"
	},
	slug: "from-rejections-to-offers",
	date: {
		eng: "March 25, 2025",
		fr: "25 mars 2025"
	},
	read_time: {
		eng: "8 min read",
		fr: "8 min de lecture"
	},
	excerpt: {
		eng: "Three months ago, I had a sad spreadsheet tracking 60+ rejections. Then I changed my approach to resume writing and everything turned around. Here's exactly what I did.",
		fr: "Il y a trois mois, j'avais un triste tableur qui comptabilisait plus de 60 refus. Puis j'ai changé mon approche de rédaction de CV et tout a changé. Voici exactement ce que j'ai fait."
	},
	category: {
		eng: "Resume Tips",
		fr: "Conseils pour CV"
	},
	tags: [
		{
			eng: "Resume Writing",
			fr: "Rédaction de CV"
		},
		{
			eng: "Job Search",
			fr: "Recherche d'emploi"
		},
		{
			eng: "Success Story",
			fr: "Histoire de réussite"
		}
	],
};

export default function FromRejectionsToOffers(): JSX.Element {
	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4">
			<Header />

			<section class="w-full flex flex-col gap-8 py-8 max-w-3xl mx-auto">
				{/* Blog Post Header */}
				<header class="text-center">
					<div class="mb-3">
						<span class="px-4 py-2 bg-forest-50 text-forest-800 rounded text-sm font-medium">
							<Lang>
								<En>{metadata.category.eng}</En>
								<Fr>{metadata.category.fr}</Fr>
							</Lang>
						</span>
					</div>
					<h1 class="text-3xl lg:text-4xl font-bold text-forest-900 mb-4">
						<Lang>
							<En>{metadata.title.eng}</En>
							<Fr>{metadata.title.fr}</Fr>
						</Lang>
					</h1>
					<div class="flex items-center justify-center gap-4 text-gray-600">
						<span>
							<Lang>
								<En>{metadata.date.eng}</En>
								<Fr>{metadata.date.fr}</Fr>
							</Lang>
						</span>
						<span>•</span>
						<span>
							<Lang>
								<En>{metadata.read_time.eng}</En>
								<Fr>{metadata.read_time.fr}</Fr>
							</Lang>
						</span>
					</div>
				</header>

				{/* Author Info */}
				{/* <section class="flex items-center gap-4 border-b border-gray-200 pb-6">
          <div class="w-12 h-12 rounded bg-forest-100 flex items-center justify-center text-forest-800">
            {metadata.author.split(' ').map(name => name[0]).join('')}
          </div>
          <div>
            <h2 class="font-medium text-forest-900">{metadata.author}</h2>
            <p class="text-sm text-gray-600">Author</p>
          </div>
        </section> */}

				{/* Blog Content */}
				<article class="prose prose-lg max-w-none">
					<p class="text-gray-700 my-4">
						<Lang>
							<En>Look, I'm going to be real with you. Three months ago, I
							was that person with the sad Excel spreadsheet. You know
							the one: 60+ job applications sent, two lukewarm
							responses, zero interviews, and a growing collection of
							automated rejection emails. My personal favorite was the
							company that took six months to tell me they were
							"moving forward with other candidates." Really? I
							figured that out around month two, but thanks for the
							closure.</En>
							<Fr>Écoutez, je vais être honnête avec vous. Il y a trois mois, j'étais
							cette personne avec le triste tableur Excel. Vous savez,
							celui qui contient plus de 60 candidatures envoyées, deux réponses
							tièdes, zéro entretien, et une collection grandissante de
							courriels de refus automatisés. Mon préféré était celui de l'entreprise
							qui a mis six mois pour me dire qu'ils "poursuivaient avec d'autres candidats."
							Vraiment ? Je l'avais compris vers le deuxième mois, mais merci pour
							cette conclusion.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>My resume wasn't terrible. I had decent experience, no
							glaring typos, and a reasonably professional layout. But
							I was making the same critical mistake that countless
							job seekers make: sending essentially the same resume to
							every single job posting with minor tweaks.</En>
							<Fr>Mon CV n'était pas terrible. J'avais une expérience correcte, pas
							de fautes d'orthographe flagrantes, et une mise en page assez professionnelle.
							Mais je faisais la même erreur critique que d'innombrables
							chercheurs d'emploi : envoyer essentiellement le même CV pour
							chaque offre d'emploi avec des modifications mineures.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>In retrospect, I was practically begging to be ignored.</En>
							<Fr>Avec le recul, je suppliais pratiquement qu'on m'ignore.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>Then I discovered the game-changer that transformed my
							entire approach: properly tailoring my resume for each
							specific job. And no, I don't mean changing the company
							name and calling it a day (guilty as charged). I'm
							talking about a complete strategic overhaul of how I
							presented myself on paper.</En>
							<Fr>Puis j'ai découvert ce qui a transformé toute mon
							approche : adapter correctement mon CV pour chaque
							emploi spécifique. Et non, je ne parle pas de changer le nom de l'entreprise
							et de considérer que c'est suffisant (j'avoue l'avoir fait). Je
							parle d'une refonte stratégique complète de la façon dont je
							me présentais sur papier.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>So grab your coffee and let me share what I learned the
							hard way, so you don't have to.</En>
							<Fr>Alors prenez votre café et laissez-moi partager ce que j'ai appris
							à la dure, pour que vous n'ayez pas à le faire.</Fr>
						</Lang>
					</p>

					<h2 class="text-2xl font-bold text-forest-800 my-5">
						<Lang>
							<En>The Wake-Up Call: Why My "One Resume Fits All" Approach
							Was Failing Me</En>
							<Fr>Le signal d'alarme : Pourquoi mon approche "Un CV pour tous"
							me faisait échouer</Fr>
						</Lang>
					</h2>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>I used to think that hiring managers would somehow
							connect the dots between my experience and their needs.
							"Surely they can see how my project management skills
							would transfer perfectly to this role!" I'd think
							optimistically while hitting submit on yet another
							application.</En>
							<Fr>Je pensais que les recruteurs feraient d'une manière ou d'une autre
							le lien entre mon expérience et leurs besoins.
							"Ils peuvent sûrement voir comment mes compétences en gestion de projet
							se transféreraient parfaitement à ce rôle !" Je pensais
							avec optimisme en soumettant encore une autre
							candidature.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>Turns out, most resumes get about six seconds of human
							attention—if they even make it past the dreaded
							Applicant Tracking System (ATS) robots. Six seconds!
							I've spent longer deciding which Netflix show to watch.
							In that tiny window, no hiring manager is going to play
							detective with your experience.</En>
							<Fr>Il s'avère que la plupart des CV reçoivent environ six secondes d'attention humaine
							— s'ils passent même le redoutable
							système de suivi des candidatures (ATS). Six secondes !
							J'ai passé plus de temps à décider quel programme Netflix regarder.
							Dans cette infime fenêtre, aucun recruteur ne va jouer
							au détective avec votre expérience.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>What finally clicked for me was understanding that my
							resume had two major hurdles to clear:</En>
							<Fr>Ce qui a finalement fait tilt pour moi, c'est de comprendre que mon
							CV avait deux obstacles majeurs à franchir :</Fr>
						</Lang>
					</p>

					<ol class="list-decimal pl-6 my-4">
						<li class="ml-6 list-decimal mb-2">
							<Lang>
								<En>Getting past the ATS software that filters out 75%
								of resumes before human eyes ever see them</En>
								<Fr>Passer le logiciel ATS qui filtre 75%
								des CV avant que des yeux humains ne les voient</Fr>
							</Lang>
						</li>
						<li class="ml-6 list-decimal mb-2">
							<Lang>
								<En>Immediately showing the overwhelmed human recruiter
								why I'm relevant in those precious few seconds</En>
								<Fr>Montrer immédiatement au recruteur débordé
								pourquoi je suis pertinent dans ces précieuses secondes</Fr>
							</Lang>
						</li>
					</ol>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>And my generic resume was failing at both.</En>
							<Fr>Et mon CV générique échouait sur les deux plans.</Fr>
						</Lang>
					</p>

					<h2 class="text-2xl font-bold text-forest-800 my-5">
						<Lang>
							<En>My New Approach: Treating Each Application Like a
							Matching Game</En>
							<Fr>Ma nouvelle approche : Traiter chaque candidature comme un
							jeu de correspondance</Fr>
						</Lang>
					</h2>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>Once I accepted reality, I started approaching each job
							application as a matching exercise. The job description
							contains exactly what they want; my job was to show them
							I have exactly what they're looking for.</En>
							<Fr>Une fois que j'ai accepté la réalité, j'ai commencé à aborder chaque
							candidature comme un exercice de correspondance. La description du poste
							contient exactement ce qu'ils veulent ; mon travail était de leur montrer
							que j'ai exactement ce qu'ils recherchent.</Fr>
						</Lang>
					</p>

					<h3 class="text-xl font-bold text-forest-700 my-4">
						<Lang>
							<En>Step 1: I Stopped Skimming Job Descriptions</En>
							<Fr>Étape 1 : J'ai arrêté de survoler les descriptions de poste</Fr>
						</Lang>
					</h3>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>Instead of the cursory glance I used to give job
							postings, I started actually analyzing them with the
							attention they deserved.</En>
							<Fr>Au lieu du regard superficiel que je donnais aux offres
							d'emploi, j'ai commencé à les analyser vraiment avec
							l'attention qu'elles méritaient.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>I'd highlight every skill, requirement, and
							qualification mentioned. I noticed patterns—some
							requirements appeared multiple times or were listed
							first, signaling their importance. I'd pay special
							attention to unusual phrasing or industry-specific
							terminology that might be programmed into their ATS.</En>
							<Fr>Je surlignais chaque compétence, exigence et
							qualification mentionnée. J'ai remarqué des modèles—certaines
							exigences apparaissaient plusieurs fois ou étaient listées
							en premier, signalant leur importance. J'accordais une attention
							particulière aux formulations inhabituelles ou à la terminologie
							spécifique à l'industrie qui pouvait être programmée dans leur ATS.</Fr>
						</Lang>
					</p>

					{/* More content would go here - abbreviated for this example */}

					<h2 class="text-2xl font-bold text-forest-800 my-5">
						<Lang>
							<En>The Bottom Line: Tailoring Works, But Make It Efficient</En>
							<Fr>En résumé : La personnalisation fonctionne, mais rendez-la efficace</Fr>
						</Lang>
					</h2>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>If there's one thing you take away from my experience,
							let it be this: tailoring your resume for each job is
							non-negotiable in today's job market, but you need a
							system to make it efficient.</En>
							<Fr>S'il y a une chose à retenir de mon expérience,
							c'est celle-ci : adapter votre CV pour chaque emploi est
							non négociable sur le marché du travail actuel, mais vous avez besoin d'un
							système pour le faire efficacement.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>After landing my current role (which I love, by the
							way), I calculated that I spent about 45 minutes per
							application using my manual tailoring process. With
							Portrai, that dropped to about 15 minutes while
							achieving the same customization quality.</En>
							<Fr>Après avoir décroché mon poste actuel (que j'adore, soit
							dit en passant), j'ai calculé que je passais environ 45 minutes par
							candidature en utilisant mon processus d'adaptation manuel. Avec
							Portrai, ce temps est tombé à environ 15 minutes tout en
							obtenant la même qualité de personnalisation.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>Job searching is hard enough without making it harder on
							yourself. Give your applications the best chance of
							success by showing employers exactly why you're the
							perfect match for their specific needs.</En>
							<Fr>La recherche d'emploi est déjà assez difficile sans la rendre plus difficile pour
							vous-même. Donnez à vos candidatures les meilleures chances de
							succès en montrant aux employeurs exactement pourquoi vous êtes le
							candidat idéal pour leurs besoins spécifiques.</Fr>
						</Lang>
					</p>

					<p class="text-gray-700 my-4">
						<Lang>
							<En>Ready to stop collecting rejections and start landing
							interviews? I can't recommend strongly enough giving
							Portrai a try. For less than the cost of a nice dinner
							out, you'll transform your job search from frustrating
							to fruitful. Your future self (and your mental health)
							will thank you.</En>
							<Fr>Prêt à arrêter de collecter des refus et à commencer à décrocher
							des entretiens ? Je ne peux que vous recommander vivement d'essayer
							Portrai. Pour moins que le coût d'un bon dîner
							au restaurant, vous transformerez votre recherche d'emploi de frustrante
							à fructueuse. Votre futur vous (et votre santé mentale)
							vous remerciera.</Fr>
						</Lang>
					</p>
				</article>

				{/* Tags */}
				<section class="border-t border-gray-200 pt-6">
					<h2 class="text-sm font-medium text-gray-600 mb-3">
						<Lang>
							<En>Topics</En>
							<Fr>Sujets</Fr>
						</Lang>
					</h2>
					<ul class="flex flex-wrap gap-2">
						{metadata.tags.map((tag) => (
							<li>
								<span class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm">
									<Lang>
										<En>{tag.eng}</En>
										<Fr>{tag.fr}</Fr>
									</Lang>
								</span>
							</li>
						))}
					</ul>
				</section>

				{/* Back to Blog Link */}
				<div class="text-center pt-8">
					<A
						href="/blogs"
						class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
					>
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
							<line x1="19" y1="12" x2="5" y2="12"></line>
							<polyline points="12 19 5 12 12 5"></polyline>
						</svg>
						<Lang>
							<En>Back to All Articles</En>
							<Fr>Retour à tous les articles</Fr>
						</Lang>
					</A>
				</div>
			</section>

			<Footer />
		</main>
	);
}