import { createStore } from "solid-js/store";
import Header from "../../components/header.default";
import { api } from "@utils/api";
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import { Pay } from "@utils/payment";
import { Match, onMount, Switch } from "solid-js";
import Footer from "@components/footer.default";
import { useFault } from "@components/fault";
import { AxiosError } from "axios";
import { En, Fr, Lang } from "@components/language";

interface SigninPageProps {}

interface EmailSigninData {
	email: string;
	password: string;
}

function SigninPage(props: SigninPageProps) {
	const location = useLocation();
	const fault = useFault();
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

	onMount(() => {
		if (localStorage.getItem("IS_AUTHENTICATED")) {
			if (!location.query.payment) {
				navigate("/", { replace: true });
			}
		}
	});
	onMount(() => {
		// Create and load the Google script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	});

	onMount(() => {
		// Add global callback function
		window.handleGoogleSignin = async (response: any) => {
			try {
				// Send the ID token to your backend
				await api.post("/auth/signin/google", {
					id_token: response.credential,
				});

				localStorage.setItem("IS_AUTHENTICATED", "true");

				if (location.query.payment) {
					if (
						location.query.payment !=
						import.meta.env.VITE_DEFAULT_PLAN
					) {
						Pay({ plan: location.query.payment as string });
					}
				} else {
					navigate("/", { replace: true });
				}
			} catch (error) {
				console.error("Google sign-in error:", error);
				fault.major({ message: "Google sign-in error" });
			}
		};

		// Create and load the Google script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	});

	return (
		<main class="lg:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section class="lg:py-16 py-8 h-full flex flex-col gap-16 items-center">
				<section class="max-w-md w-full space-y-8 grow">
					<h2 class="text-center text-3xl text-forest-900">
						<Lang>
							<En>Sign in to your account</En>
							<Fr>Connectez-vous à votre compte</Fr>
						</Lang>
					</h2>

					<div class="flex flex-col items-center w-full">
						<div
							id="g_id_onload"
							data-client_id={
								import.meta.env.VITE_GOOGLE_CLIENT_ID ??
								"379453756631-48ig2rjv0qp8juto3jpcc2j6d9ro9k09.apps.googleusercontent.com"
							}
							data-context="signin"
							data-ux_mode="popup"
							data-callback="handleGoogleSignin"
							data-auto_prompt="false"
							data-width="100%"
							class="w-full"
						></div>

						<div
							class="g_id_signin w-full"
							data-type="standard"
							data-shape="rectangular"
							data-theme="outline"
							data-text="signin_with"
							data-size="large"
							data-width="100%"
							data-logo_alignment="left"
						></div>
					</div>

					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-lapis-300"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="px-2 bg-forest-50 text-forest-500">
								<Lang>
									<En>Or continue with</En>
									<Fr>Ou continuer avec</Fr>
								</Lang>
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
									if (
										location.query.payment !=
										import.meta.env.VITE_DEFAULT_PLAN
									) {
										Pay({
											plan: location.query
												.payment as string,
										});
									}
								} else {
									navigate("/", { replace: true });
								}
							} catch (error) {
								console.error("Signin error:", error);
								const msg =
									((
										(error as AxiosError).response
											?.data as any
									).error as string) ?? "";
								if (msg.includes("Email not confirmed")) {
									fault.major({
										message:
											"Please confirm your email address",
									});
									navigate("/verify-account");
									return;
								}
								fault.major({
									message:
										"Invalid password or email address",
								});
							}
						}}
						class="mt-8 space-y-6"
					>
						<div class="rounded shadow-sm -space-y-px">
							<div>
								<label for="email" class="sr-only">
									<Lang>
										<En>Email address</En>
										<Fr>Adresse e-mail</Fr>
									</Lang>
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
									<Lang>
										<En>Password</En>
										<Fr>Mot de passe</Fr>
									</Lang>
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
						</div>

						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-forest-600 hover:bg-forest-400 smooth-transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500"
						>
							<Lang>
								<En>Sign in</En>
								<Fr>Se connecter</Fr>
							</Lang>
						</button>
					</form>

					<div class="flex items-center justify-between">
						<A
							href="/forgot-password"
							class="text-sm font-medium text-lapis-600 hover:text-lapis-500 smooth-transition"
						>
							<Lang>
								<En>Forgot your password?</En>
								<Fr>Mot de passe oublié ?</Fr>
							</Lang>
						</A>
						<Switch>
							<Match when={location.query.payment}>
								<A
									href={`/signup?payment=${location.query.payment}`}
									class="text-sm font-medium text-lapis-600 hover:text-lapis-500 smooth-transition"
								>
									<Lang>
										<En>No account? Sign up</En>
										<Fr>Pas de compte ? Inscrivez-vous</Fr>
									</Lang>
								</A>
							</Match>
							<Match when={!location.query.payment}>
								<A
									href="/signup"
									class="text-sm font-medium text-lapis-600 hover:text-lapis-500 smooth-transition"
								>
									<Lang>
										<En>No account? Sign up</En>
										<Fr>Pas de compte ? Inscrivez-vous</Fr>
									</Lang>
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

export default SigninPage;
