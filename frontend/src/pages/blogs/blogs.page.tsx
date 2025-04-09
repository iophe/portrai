import Footer from "@components/footer.default";
import Header from "@components/header.autherized";
import { createResource, createSignal, For, Show } from "solid-js";
import { Motion } from "solid-motionone";
import { A } from "@solidjs/router";

import { metadata as rejections_to_offers_metadata } from "./blog/blog.from-rejections-to-offers";

interface BlogMetadata {
	id: string;
	title: string;
	slug: string;
	author?: string;
	date: string;
	read_time: string;
	excerpt: string;
	image?: string;
	category: string;
	tags: string[];
}

interface BlogCategory {
	id: string;
	name: string;
}

// Blog categories for the filter
const blog_categories: BlogCategory[] = [
	{ id: "all", name: "All Posts" },
	{ id: "resume-tips", name: "Resume Tips" },
	{ id: "cover-letters", name: "Cover Letters" },
	{ id: "job-search", name: "Job Search" },
	{ id: "success-stories", name: "Success Stories" },
	{ id: "career-advice", name: "Career Advice" },
];

const all_blog_metadata: BlogMetadata[] = [rejections_to_offers_metadata];

interface BlogPageProps {}

function BlogPage(props: BlogPageProps) {
	const [filter_category, set_filter_category] = createSignal({
		id: "all",
		name: "All Posts",
	});

	const [filtered_posts] = createResource(filter_category, (category) => {
		const result = all_blog_metadata.filter((post) => {
			if (category.id === "all") {
				return true;
			}
			return post.category.toLowerCase() === category.name.toLowerCase();
		});
		return result;
	});

	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col min-h-screen gap-4">
			<Header />

			<section class="w-full flex flex-col gap-16 py-8 md:max-w-5xl mx-auto grow">
				<article class="flex flex-col gap-16">
					{/* Blog Header */}
					<header class="text-center">
						<h1 class="text-4xl tracking-widest">
							PORTR
							<span class="alice-regular text-forest-900">
								AI
							</span>{" "}
							Blog
						</h1>
						<p class="text-xl text-gray-600 max-w-3xl mx-auto">
							Expert advice on resume writing, job searching, and
							career development
						</p>
					</header>

					{/* Search and Filter Bar */}
					<section class="w-full flex flex-col md:flex-row gap-6 justify-center items-center">
						<div class="flex flex-wrap gap-2 pb-2 w-full md:w-auto">
							<For each={blog_categories}>
								{(category) => (
									<button
										onClick={() =>
											set_filter_category(category)
										}
										classList={{
											"px-4 py-2 rounded text-sm transition-colors":
												true,
											"bg-forest-700 text-white":
												filter_category().id ===
												category.id,
											"bg-gray-100 text-gray-700 hover:bg-gray-200":
												filter_category().id !==
												category.id,
										}}
									>
										{category.name}
									</button>
								)}
							</For>
						</div>
					</section>

					{/* Blog Post Grid */}
					<section class="w-full">
						<Show
							when={filtered_posts()?.length ?? 0 > 0}
							fallback={
								<div class="text-center py-16">
									<p class="text-xl text-gray-600">
										No articles found matching your
										criteria.
									</p>
									<button
										onClick={() => {
											set_filter_category({
												id: "all",
												name: "All Posts",
											});
										}}
										class="mt-4 px-4 py-2 bg-lapis-50 text-forest-900 hover:text-white rounded-lg hover:bg-lapis-100 transition-colors"
									>
										Clear filters
									</button>
								</div>
							}
						>
							<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								<For each={filtered_posts()}>
									{(post) => (
										<Motion.li
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.4 }}
											class="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all h-full"
										>
											<A
												href={`/blogs/${post.slug}`}
												class="block h-full"
											>
												<figure
													class="bg-forest-50 overflow-hidden"
													classList={{
														"relative h-48":
															post.image !==
															undefined,
														"h-fit bg-lapis-100 p-4":
															post.image ===
															undefined,
													}}
												>
													<Show when={post.image}>
														<img
															src={post.image}
															alt={post.title}
															class="w-full h-full object-cover"
														/>
													</Show>
													<div
														classList={{
															"absolute top-4 left-4":
																post.image !==
																undefined,
														}}
													>
														<span class="px-3 py-1 bg-white text-forest-900 rounded text-xs font-medium">
															{post.category}
														</span>
													</div>
												</figure>

												<article class="p-6 flex flex-col gap-3 flex-grow">
													<header>
														<h2
															class="text-xl font-bold text-forest-900"
															classList={{
																"line-clamp-2":
																	post.image !==
																	undefined,
															}}
														>
															{post.title}
														</h2>
													</header>
													<p class="text-gray-600 line-clamp-3">
														{post.excerpt}
													</p>
													<footer class="mt-auto pt-4 flex justify-between items-center text-sm text-gray-500">
														<span>{post.date}</span>
														<span>
															{post.read_time}
														</span>
													</footer>
												</article>
											</A>
										</Motion.li>
									)}
								</For>
							</ul>
						</Show>
					</section>
				</article>
			</section>

			<Footer />
		</main>
	);
}

export default BlogPage;
