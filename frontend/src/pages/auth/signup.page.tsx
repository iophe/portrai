import { createStore } from "solid-js/store";
import Header from "../../components/header.default";
import { api } from "@utils/api";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { Pay } from "@utils/payment";
import Footer from "@components/footer.default";
import { Match, Switch } from "solid-js";

interface SignupPageProps {}

interface EmailSignupData {
	name: string;
	email: string;
	password: string;
	confirm_password: string;
}

function SignupPage(props: SignupPageProps) {
	const navigate = useNavigate();
	const location = useLocation();

	const [email_signup_data, set_email_signup_data] =
		createStore<EmailSignupData>({
			name: "",
			email: "",
			password: "",
			confirm_password: "",
		});
	const handle_input = (e: InputEvent) => {
		const { name, value } = e.target as HTMLInputElement;
		set_email_signup_data({ [name]: value });
	};
	return (
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section class="md:py-16 py-8 h-full flex flex-col gap-16 items-center">
				<section class="max-w-md w-full space-y-8 grow">
					<h2 class="text-center text-3xl text-forest-900">
						Create your account
					</h2>

					<button class="w-full flex justify-center py-2 px-4 border border-lapis-300 rounded shadow-sm bg-white text-sm font-medium text-lapis-700 hover:bg-lapis-50">
						Sign up with Google
					</button>

					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-lapis-300"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="px-2 bg-forest-50 text-forest-500">
								Or continue with
							</span>
						</div>
					</div>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							try {
								const response = await api.post(
									"/auth/signup/email",
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
								console.error("Signup error:", error);
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
									class="appearance-none rounded-none relative block w-full px-3 py-2 border border-lapis-300 placeholder-lapis-500 text-forest-900 focus:outline-none focus:ring-lapis-500 focus:border-lapis-500 focus:z-10 sm:text-sm"
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
									class="appearance-none rounded-none relative block w-full px-3 py-2 border border-lapis-300 placeholder-lapis-500 text-forest-900 focus:outline-none focus:ring-lapis-500 focus:border-lapis-500 focus:z-10 sm:text-sm"
									placeholder="Password"
								/>
							</div>
							<div>
								<label for="confirm_password" class="sr-only">
									Confirm password
								</label>
								<input
									id="confirm_password"
									name="confirm_password"
									type="password"
									required
									value={email_signup_data.confirm_password}
									onInput={handle_input}
									class="appearance-none rounded-none relative block w-full px-3 py-2 border border-lapis-300 placeholder-lapis-500 text-forest-900 rounded-b-md focus:outline-none focus:ring-lapis-500 focus:border-lapis-500 focus:z-10 sm:text-sm"
									placeholder="Confirm password"
								/>
							</div>
						</div>
						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-forest-600 hover:bg-forest-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500"
						>
							Create account
						</button>
					</form>

					<div class="flex justify-center">

						<Switch>
							<Match when={location.query.payment}>
								<A
									href={`/signin?payment=${location.query.payment}`}
									class="text-sm font-medium text-lapis-600 hover:text-lapis-500"
								>
							Already have an account? Sign in
								</A>
							</Match>
							<Match when={!location.query.payment}>
								<A
									href="/signin"
									class="text-sm font-medium text-lapis-600 hover:text-lapis-500"
								>
							Already have an account? Sign in
								</A>
							</Match>
						</Switch>
					</div>
				</section>
			</section>
			<Footer />
		</main>
	);
}

export default SignupPage;
