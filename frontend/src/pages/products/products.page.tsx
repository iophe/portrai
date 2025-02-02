import Header from "../../components/header.default";

interface ProductsProps {}

function Products(props: ProductsProps) {
	return (
		<main class="p-4 flex flex-col gap-4 bg-gray-50 min-h-screen">
			<Header />
			<section class="flex flex-col gap-4 grow justify-center md:items-center text-gray-900">
				<h1 class="text-5xl text-end md:text-center grow self-center content-center">
					This is a template app for an amazing new products
				</h1>
				<h2 class="text-start md:text-center">Join the waiting list</h2>
				<input
					class="text-start md:text-center w-full md:w-fit md:px-4 border-b border-b-gray-700 pb-2 out"
					placeholder="Enter your email address"
				/>
				<div class="grow"></div>
			</section>
		</main>
	);
}

export default Products;
