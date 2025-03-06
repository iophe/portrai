import { createStore } from "solid-js/store";
import Header from "../../components/header.default";
import { api } from "@utils/api";
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import { Pay } from "@utils/payment";
import { Match, Switch } from "solid-js";

interface SigninPageProps {}

interface EmailSigninData {
	email: string;
	password: string;
}

function SigninPage(props: SigninPageProps) {
	const location = useLocation();

	const navigate = useNavigate();
	const [email_signup_data, set_email_signup_data] =
		createStore<EmailSigninData>({
			email: "",
			password: "",
		});
	const handle_input = (e: InputEvent) => {
		const { name, value } = e.target as HTMLInputElement;
		set_email_signup_data({ [name]: value });
	};
	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section class="md:py-16 py-8 flex flex-col gap-16 items-center">
				<section class="max-w-md w-full space-y-8 grow">
					<h2 class="text-center text-3xl text-forest-900">
						Sign in to your account
					</h2>

					<button class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
						Sign in with Google
					</button>

					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-gray-300"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="px-2 bg-gray-50 text-gray-500">
								Or continue with
							</span>
						</div>
					</div>

					<form
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								const response = await api.post(
									"/auth/signin/email",
									email_signup_data
								);
								localStorage.setItem(
									"IS_AUTHENTICATED",
									"true"
								);
								if (location.query.payment) {
									Pay({
										plan: location.query.payment as string,
									});
								} else {
									navigate("/", { replace: true });
								}
							} catch (error) {
								console.error("Signin error:", error);
							}
						}}
						class="mt-8 space-y-6"
					>
						<div class="rounded shadow-sm -space-y-px">
							<div>
								<label for="email" class="sr-only">
									Email address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={email_signup_data.email}
									onInput={handle_input}
									class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-forest-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
									placeholder="Email address"
								/>
							</div>
							<div>
								<label for="password" class="sr-only">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									value={email_signup_data.password}
									onInput={handle_input}
									class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-forest-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
									placeholder="Password"
								/>
							</div>
						</div>

						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							Sign in
						</button>
					</form>

					<div class="flex items-center justify-between">
						<A
							href="/forgot-password"
							class="text-sm font-medium text-gray-600 hover:text-gray-500"
						>
							Forgot your password?
						</A>
						<Switch>
							<Match when={location.query.payment}>
								<A
									href={`/signup?payment=${location.query.payment}`}
									class="text-sm font-medium text-gray-600 hover:text-gray-500"
								>
									No account? Sign up
								</A>
							</Match>
							<Match when={!location.query.payment}>
								<A
									href="/signup"
									class="text-sm font-medium text-gray-600 hover:text-gray-500"
								>
									No account? Sign up
								</A>
							</Match>
						</Switch>
					</div>
				</section>
			</section>
		</main>
	);
}

export default SigninPage;
