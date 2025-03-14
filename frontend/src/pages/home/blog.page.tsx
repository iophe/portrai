import Header from "@components/header.default";
import { Component, For, createSignal } from "solid-js";

// Interface pour les articles de blog
interface BlogPost {
	id: number;
	title: string;
	excerpt: string;
	author: string;
	date: string;
	readTime: number;
	tags: string[];
	imageUrl?: string;
}

// Composant Article de Blog
const BlogPostCard: Component<{ post: BlogPost }> = (props) => {
	return (
		<article class="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
			{props.post.imageUrl && (
				<img
					src={props.post.imageUrl}
					alt={props.post.title}
					class="w-full h-48 object-cover"
				/>
			)}
			<div class="p-6">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm text-gray-500">
						{props.post.date} • {props.post.readTime} min read
					</span>
					<div class="flex space-x-2">
						<For each={props.post.tags}>
							{(tag) => (
								<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
									{tag}
								</span>
							)}
						</For>
					</div>
				</div>
				<h2 class="text-xl font-bold text-gray-800 mb-2">
					{props.post.title}
				</h2>
				<p class="text-gray-600 mb-4">{props.post.excerpt}</p>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-500">
						By {props.post.author}
					</span>
					<button class="text-blue-600 hover:text-blue-800 transition-colors">
						Read More
					</button>
				</div>
			</div>
		</article>
	);
};

// Page de Blog Principale
const Blog: Component = () => {
	// Données des articles de blog
	const blogPosts: BlogPost[] = [
		{
			id: 1,
			title: "Mastering ATS: How to Get Your Resume Past the Robots",
			excerpt:
				"Discover the secrets to creating a resume that navigates Applicant Tracking Systems with ease and lands you more interviews.",
			author: "Jake Henderson",
			date: "March 15, 2024",
			readTime: 7,
			tags: ["Resume Tips", "Career Advice", "ATS"],
			imageUrl: "/images/ats-resume.jpg",
		},
		{
			id: 2,
			title: "Networking in the Digital Age: Building Connections That Matter",
			excerpt:
				"Learn how to leverage LinkedIn, virtual events, and professional platforms to expand your career network strategically.",
			author: "Sarah Thompson",
			date: "February 28, 2024",
			readTime: 6,
			tags: ["Networking", "Professional Development", "LinkedIn"],
			imageUrl: "/images/networking.jpg",
		},
		{
			id: 3,
			title: "Salary Negotiation Tactics: Know Your Worth",
			excerpt:
				"Practical strategies to confidently negotiate your salary and benefits in any job interview or performance review.",
			author: "Michael Rodriguez",
			date: "February 10, 2024",
			readTime: 5,
			tags: ["Salary", "Career Growth", "Negotiation"],
			imageUrl: "/images/salary-negotiation.jpg",
		},
		{
			id: 4,
			title: "Career Transitions: Successfully Changing Industries",
			excerpt:
				"A comprehensive guide to navigating career shifts, transferring skills, and positioning yourself in a new professional field.",
			author: "Emily Chen",
			date: "January 22, 2024",
			readTime: 8,
			tags: ["Career Change", "Professional Growth", "Skill Transfer"],
			imageUrl: "/images/career-transition.jpg",
		},
	];

	// États pour filtrage et pagination
	const [selectedTag, setSelectedTag] = createSignal<string | null>(null);
	const [currentPage, setCurrentPage] = createSignal(1);
	const postsPerPage = 6;

	// Récupérer les tags uniques
	const allTags = [...new Set(blogPosts.flatMap((post) => post.tags))];

	// Filtrer et paginer les articles
	const filteredPosts = () => {
		let posts = selectedTag()
			? blogPosts.filter((post) => post.tags.includes(selectedTag()!))
			: blogPosts;

		const startIndex = (currentPage() - 1) * postsPerPage;
		return posts.slice(startIndex, startIndex + postsPerPage);
	};

	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<div class="bg-gray-50 min-h-screen">
				<header class="bg-white shadow-md py-12">
					<div class="container mx-auto px-4 text-center">
						<h1 class="text-4xl font-bold text-gray-800 mb-4">
							Career Insights & Strategies
						</h1>
						<p class="text-gray-600 max-w-2xl mx-auto">
							Expert advice, actionable tips, and inspiring
							stories to help you navigate your professional
							journey.
						</p>
					</div>
				</header>

				<div class="container mx-auto px-4 py-8">
					{/* Filtres de tags */}
					<div class="flex flex-wrap justify-center gap-2 mb-8">
						<button
							class={`px-3 py-1 rounded-full text-sm transition-colors ${!selectedTag() ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
							onClick={() => setSelectedTag(null)}
						>
							All Posts
						</button>
						<For each={allTags}>
							{(tag) => (
								<button
									class={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag() === tag ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
									onClick={() => {
										setSelectedTag(tag);
										setCurrentPage(1);
									}}
								>
									{tag}
								</button>
							)}
						</For>
					</div>

					{/* Grille d'articles */}
					<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						<For each={filteredPosts()}>
							{(post) => <BlogPostCard post={post} />}
						</For>
					</div>

					{/* Pagination */}
					<div class="flex justify-center mt-8 space-x-2">
						<button
							class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
							disabled={currentPage() === 1}
							onClick={() => setCurrentPage((p) => p - 1)}
						>
							Previous
						</button>
						<button
							class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
							disabled={
								currentPage() * postsPerPage >= blogPosts.length
							}
							onClick={() => setCurrentPage((p) => p + 1)}
						>
							Next
						</button>
					</div>

					{/* Newsletter Signup */}
					<div class="bg-white shadow-md rounded-lg p-8 mt-12 text-center">
						<h2 class="text-2xl font-bold text-gray-800 mb-4">
							Stay Ahead in Your Career
						</h2>
						<p class="text-gray-600 mb-6">
							Subscribe to our newsletter for weekly career tips,
							job market insights, and professional development
							strategies.
						</p>
						<div class="max-w-md mx-auto flex">
							<input
								type="email"
								placeholder="Enter your email"
								class="flex-grow px-4 py-2 border rounded-l-lg"
							/>
							<button class="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition-colors">
								Subscribe
							</button>
						</div>
					</div>
				</div>

				<footer class="bg-gray-800 text-white py-8">
					<div class="container mx-auto px-4 text-center">
						<p>
							&copy; 2024 Career Insights Blog. All rights
							reserved.
						</p>
					</div>
				</footer>
			</div>
		</main>
	);
};

export default Blog;
