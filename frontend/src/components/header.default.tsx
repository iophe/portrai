import { Component, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "@utils/api";

const Header: Component = () => {
	const handleLogout = async () => {
		try {
			await api.post("/auth/logout");
			localStorage.clear();
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteAccount = async () => {
		try {
			await api.post("/auth/delete");
			localStorage.clear();
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<header class="flex md:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-night-900">AI</span>
				</h1>
			</A>
			<div class="flex flex-row gap-8 items-center">
				<A
					href="/pricing"
					class="tracking-widest"
					activeClass="text-night-600"
				>
					<h2>Blog</h2>
				</A>
				<A
					href="/pricing"
					class="tracking-widest"
					activeClass="text-night-600"
				>
					<h2>Pricing</h2>
				</A>
				<A
					href="/signin"
					class="tracking-widest bg-night-800 text-snow-100 py-2 px-4 rounded"
					activeClass="text-night-600"
				>
					<h2 class="text-nowrap">Get Started</h2>
				</A>
			</div>
		</header>
	);
	return (
		<header class="bg-white shadow-sm">
			<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 justify-between items-center">
					{/* Left side - Navigation links */}
					<div class="flex gap-4">
						<A
							href="/"
							class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
							activeClass="text-blue-600"
						>
							Home
						</A>
						<A
							href="/products"
							class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
							activeClass="text-blue-600"
						>
							Products
						</A>
						<A
							href="/pricing"
							class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
							activeClass="text-blue-600"
						>
							Pricing
						</A>
						<Show when={localStorage.getItem("IS_AUTHENTICATED")}>
							<A
								href="/resume"
								class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
								activeClass="text-blue-600"
							>
								Resume
							</A>
						</Show>
					</div>

					{/* Right side - Auth buttons */}
					<div class="flex gap-4">
						<Show
							when={localStorage.getItem("IS_AUTHENTICATED")}
							fallback={
								<>
									<A
										href="/signin"
										class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
									>
										Sign In
									</A>
									<A
										href="/signup"
										class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md"
									>
										Sign Up
									</A>
								</>
							}
						>
							<button
								onclick={handleLogout}
								class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
							>
								Log Out
							</button>
							<button
								onclick={handleDeleteAccount}
								class="text-red-600 hover:text-red-700 px-3 py-2 rounded-md"
							>
								Delete Account
							</button>
						</Show>
					</div>
				</div>
			</nav>
		</header>
	);
};

export default Header;
