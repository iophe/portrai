import { createStore } from "solid-js/store";
import Header from "../../components/header.default";
import { api } from "@utils/api";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { Pay } from "@utils/payment";
import Footer from "@components/footer.default";
import { createEffect, Match, onMount, Switch } from "solid-js";
import { useFault } from "@components/fault";

interface SignupPageProps {}

interface EmailSignupData {
	name: string;
	email: string;
	password: string;
	confirm_password: string;
	terms_accepted: boolean;
}

declare global {
	interface Window {
		handleGoogleSignup: (response: any) => void;
		handleGoogleSignin: (response: any) => void;
		google: any;
	}
}

function SignupPage(props: SignupPageProps) {
	const fault = useFault();
	const navigate = useNavigate();
	const location = useLocation();

	const [email_signup_data, set_email_signup_data] =
		createStore<EmailSignupData>({
			name: "",
			email: "",
			password: "",
			confirm_password: "",
			terms_accepted: false,
		});

	const handle_input = (e: InputEvent) => {
		const target = e.target as HTMLInputElement;
		const value =
			target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;
		set_email_signup_data({ [name]: value });
	};

	onMount(() => {
		// Create and load the Google script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	});

	// const generate_nonce = () => {
	// 	const array = new Uint8Array(16);
	// 	window.crypto.getRandomValues(array);
	// 	return Array.from(array, (byte) =>
	// 		("0" + (byte & 0xff).toString(16)).slice(-2)
	// 	).join("");
	// };

	// const nonce = generate_nonce();

	onMount(() => {
		// Add global callback function
		window.handleGoogleSignup = async (response: any) => {
			try {
				// Check if terms have been accepted
				if (!email_signup_data.terms_accepted) {
					fault.minor({
						message:
							"You must accept the Terms of Service to continue.",
					});
					return;
				}

				await api.post("/auth/signup/google", {
					id_token: response.credential,
					terms_accepted: email_signup_data.terms_accepted,
				});

				localStorage.setItem("IS_AUTHENTICATED", "true");

				if (location.query.payment) {
					if (
						location.query.payment !=
						import.meta.env.VITE_DEFAULT_PLAN
					) {
						Pay({ plan: location.query.payment as string });
					} else {
						navigate("/", { replace: true });
					}
				} else if (location.query.redirectTo) {
					navigate("/" + location.query.redirectTo, {
						replace: true,
					});
				} else {
					navigate("/", { replace: true });
				}
			} catch (error) {
				console.error("Google sign-in error:", error);
				fault.major({ message: "Could not sign up with Google" });
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
		<main class="md:px-48 px-8 mx-auto justify-items-center  p-4 flex flex-col gap-4 h-screen max-h-screen">
			<Header />
			<section class="md:py-16 py-8 h-full flex flex-col gap-16 items-center">
				<section class="max-w-md w-full space-y-8 grow">
					<h2 class="text-center text-3xl text-forest-900">
						Create your account
					</h2>

					<div class="flex flex-col items-center w-full">
						<div
							id="g_id_onload"
							data-client_id={
								import.meta.env.VITE_GOOGLE_CLIENT_ID
							}
							data-context="signup"
							data-ux_mode="popup"
							data-callback="handleGoogleSignup"
							data-auto_prompt="false"
							class="w-full"
						></div>

						<div
							class="g_id_signin w-full"
							data-type="standard"
							data-shape="rectangular"
							data-theme="outline"
							data-text="signup_with"
							data-size="large"
							data-logo_alignment="left"
						></div>
					</div>

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

							// Validate terms acceptance
							if (!email_signup_data.terms_accepted) {
								fault.minor({
									message:
										"You must accept the Terms of Service to continue.",
								});
								return;
							}

							try {
								const response = await api.post(
									"/auth/signup/email",
									email_signup_data
								);
								localStorage.setItem(
									"IS_AUTHENTICATED",
									"true"
								);
								navigate("/verify-account", { replace: true });
							} catch (error) {
								console.error("Signup error:", error);
								fault.major({ message: "Could not sign up" });
							}
						}}
						class="mt-8 space-y-6"
					>
						<fieldset class="rounded shadow-sm -space-y-px">
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
									class="appearance-none rounded-none relative block w-full px-3 py-2 border border-lapis-300 placeholder-lapis-500 text-forest-900 rounded-t-md focus:outline-none focus:ring-lapis-500 focus:border-lapis-500 focus:z-10 sm:text-sm"
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
						</fieldset>

						<fieldset class="flex items-start">
							<div class="flex items-center h-5">
								<input
									id="terms_accepted"
									name="terms_accepted"
									type="checkbox"
									checked={email_signup_data.terms_accepted}
									onInput={handle_input}
									required
									class="h-4 w-4 text-forest-600 focus:ring-forest-500 border-lapis-300 rounded"
									aria-describedby="terms-description"
								/>
							</div>
							<div class="ml-3 text-sm">
								<label
									for="terms_accepted"
									class="font-medium text-lapis-600"
									id="terms-description"
								>
									I agree to the{" "}
									<A
										href="/policies/term-of-services"
										class="text-forest-700 hover:text-forest-600 smooth-transition"
									>
										Terms of Service
									</A>{" "}
									and{" "}
									<A
										href="/policies/privacy"
										class="text-forest-700 hover:text-forest-600 smooth-transition"
									>
										Privacy Policy
									</A>
								</label>
							</div>
						</fieldset>

						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-forest-600 hover:bg-forest-400 smooth-transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500"
						>
							Create account
						</button>
					</form>

					<div class="flex justify-center">
						<Switch>
							<Match when={location.query.payment}>
								<A
									href={`/signin?payment=${location.query.payment}`}
									class="text-sm font-medium text-lapis-600 hover:text-lapis-500 smooth-transition"
								>
									Already have an account? Sign in
								</A>
							</Match>
							<Match when={!location.query.payment}>
								<A
									href="/signin"
									class="text-sm font-medium text-lapis-600 hover:text-lapis-500 smooth-transition"
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
