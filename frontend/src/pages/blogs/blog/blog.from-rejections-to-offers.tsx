// File path: /blog/from-rejections-to-offers.tsx
import { JSX } from "solid-js";
import Footer from "@components/footer.default";
import Header from "@components/header.default";
import { A } from "@solidjs/router";

export const metadata = {
	id: "from-rejections-to-offers",
	title: "How I Went From 60 Rejections to 5 Job Offers by Tailoring My Resume (And How You Can Too)",
	slug: "from-rejections-to-offers",
	date: "March 25, 2025",
	read_time: "8 min read",
	excerpt:
		"Three months ago, I had a sad spreadsheet tracking 60+ rejections. Then I changed my approach to resume writing and everything turned around. Here's exactly what I did.",
	category: "Resume Tips",
	tags: ["Resume Writing", "Job Search", "Success Story"],
};

export default function FromRejectionsToOffers(): JSX.Element {
	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4">
			<Header />

			<section class="w-full flex flex-col gap-8 py-8 max-w-3xl mx-auto">
				{/* Blog Post Header */}
				<header class="text-center">
					<div class="mb-3">
						<span class="px-4 py-2 bg-forest-50 text-forest-800 rounded text-sm font-medium">
							{metadata.category}
						</span>
					</div>
					<h1 class="text-3xl md:text-4xl font-bold text-forest-900 mb-4">
						{metadata.title}
					</h1>
					<div class="flex items-center justify-center gap-4 text-gray-600">
						<span>{metadata.date}</span>
						<span>•</span>
						<span>{metadata.read_time}</span>
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
						Look, I'm going to be real with you. Three months ago, I
						was that person with the sad Excel spreadsheet. You know
						the one: 60+ job applications sent, two lukewarm
						responses, zero interviews, and a growing collection of
						automated rejection emails. My personal favorite was the
						company that took six months to tell me they were
						"moving forward with other candidates." Really? I
						figured that out around month two, but thanks for the
						closure.
					</p>

					<p class="text-gray-700 my-4">
						My resume wasn't terrible. I had decent experience, no
						glaring typos, and a reasonably professional layout. But
						I was making the same critical mistake that countless
						job seekers make: sending essentially the same resume to
						every single job posting with minor tweaks.
					</p>

					<p class="text-gray-700 my-4">
						In retrospect, I was practically begging to be ignored.
					</p>

					<p class="text-gray-700 my-4">
						Then I discovered the game-changer that transformed my
						entire approach: properly tailoring my resume for each
						specific job. And no, I don't mean changing the company
						name and calling it a day (guilty as charged). I'm
						talking about a complete strategic overhaul of how I
						presented myself on paper.
					</p>

					<p class="text-gray-700 my-4">
						So grab your coffee and let me share what I learned the
						hard way, so you don't have to.
					</p>

					<h2 class="text-2xl font-bold text-forest-800 my-5">
						The Wake-Up Call: Why My "One Resume Fits All" Approach
						Was Failing Me
					</h2>

					<p class="text-gray-700 my-4">
						I used to think that hiring managers would somehow
						connect the dots between my experience and their needs.
						"Surely they can see how my project management skills
						would transfer perfectly to this role!" I'd think
						optimistically while hitting submit on yet another
						application.
					</p>

					<p class="text-gray-700 my-4">
						Turns out, most resumes get about six seconds of human
						attention—if they even make it past the dreaded
						Applicant Tracking System (ATS) robots. Six seconds!
						I've spent longer deciding which Netflix show to watch.
						In that tiny window, no hiring manager is going to play
						detective with your experience.
					</p>

					<p class="text-gray-700 my-4">
						What finally clicked for me was understanding that my
						resume had two major hurdles to clear:
					</p>

					<ol class="list-decimal pl-6 my-4">
						<li class="ml-6 list-decimal mb-2">
							Getting past the ATS software that filters out 75%
							of resumes before human eyes ever see them
						</li>
						<li class="ml-6 list-decimal mb-2">
							Immediately showing the overwhelmed human recruiter
							why I'm relevant in those precious few seconds
						</li>
					</ol>

					<p class="text-gray-700 my-4">
						And my generic resume was failing at both.
					</p>

					<h2 class="text-2xl font-bold text-forest-800 my-5">
						My New Approach: Treating Each Application Like a
						Matching Game
					</h2>

					<p class="text-gray-700 my-4">
						Once I accepted reality, I started approaching each job
						application as a matching exercise. The job description
						contains exactly what they want; my job was to show them
						I have exactly what they're looking for.
					</p>

					<h3 class="text-xl font-bold text-forest-700 my-4">
						Step 1: I Stopped Skimming Job Descriptions
					</h3>

					<p class="text-gray-700 my-4">
						Instead of the cursory glance I used to give job
						postings, I started actually analyzing them with the
						attention they deserved.
					</p>

					<p class="text-gray-700 my-4">
						I'd highlight every skill, requirement, and
						qualification mentioned. I noticed patterns—some
						requirements appeared multiple times or were listed
						first, signaling their importance. I'd pay special
						attention to unusual phrasing or industry-specific
						terminology that might be programmed into their ATS.
					</p>

					{/* More content would go here - abbreviated for this example */}

					<h2 class="text-2xl font-bold text-forest-800 my-5">
						The Bottom Line: Tailoring Works, But Make It Efficient
					</h2>

					<p class="text-gray-700 my-4">
						If there's one thing you take away from my experience,
						let it be this: tailoring your resume for each job is
						non-negotiable in today's job market, but you need a
						system to make it efficient.
					</p>

					<p class="text-gray-700 my-4">
						After landing my current role (which I love, by the
						way), I calculated that I spent about 45 minutes per
						application using my manual tailoring process. With
						Portrai, that dropped to about 15 minutes while
						achieving the same customization quality.
					</p>

					<p class="text-gray-700 my-4">
						Job searching is hard enough without making it harder on
						yourself. Give your applications the best chance of
						success by showing employers exactly why you're the
						perfect match for their specific needs.
					</p>

					<p class="text-gray-700 my-4">
						Ready to stop collecting rejections and start landing
						interviews? I can't recommend strongly enough giving
						Portrai a try. For less than the cost of a nice dinner
						out, you'll transform your job search from frustrating
						to fruitful. Your future self (and your mental health)
						will thank you.
					</p>
				</article>

				{/* Tags */}
				<section class="border-t border-gray-200 pt-6">
					<h2 class="text-sm font-medium text-gray-600 mb-3">
						Topics
					</h2>
					<ul class="flex flex-wrap gap-2">
						{metadata.tags.map((tag) => (
							<li>
								<span class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm">
									{tag}
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
						Back to All Articles
					</A>
				</div>
			</section>

			<Footer />
		</main>
	);
}
