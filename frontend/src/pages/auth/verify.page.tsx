import Footer from "@components/footer.default";
import Header from "@components/header.default";
import {
	createSignal,
	createEffect,
	Show,
	Switch,
	Match,
	onMount,
} from "solid-js";
import { A, useSearchParams } from "@solidjs/router";
import { useFault } from "@components/fault";
import api from "@utils/api";
import VerifiedIcon from "@assets/icons/verified.svg?component-solid";
import { En, Fr, Lang } from "@components/language";

interface VerifyPageProps {}

function VerifyPage(props: VerifyPageProps) {
	const [search_params] = useSearchParams();
	const [verification_status, set_verification_status] =
		createSignal("loading");
	const [email, set_email] = createSignal("");
	const [verification_code, set_verification_code] = createSignal("");
	const [resend_status, set_resend_status] = createSignal("idle");
	const [verification_method, set_verification_method] = createSignal("link");
	const fault = useFault();

	// Function to verify the email token
	async function verify_email_token(token: string, type: string = "signup") {
		try {
			const response = await api.post("/auth/signup/email/verify-email", {
				token,
				type,
			});

			set_verification_status("success");
			return response.data;
		} catch (error) {
			fault.minor({
				message: "Failed to verify email",
			});
			set_verification_status("failed");
		}
	}

	// Function to verify using the numerical code
	async function verify_email_code(e: Event) {
		e.preventDefault();

		if (!email() || !verification_code()) {
			fault.minor({
				message: "Please enter both email and verification code",
			});
			return;
		}

		set_verification_status("loading");

		try {
			const response = await api.post(
				"auth/signup/email/verify-email-code",
				{
					email: email(),
					code: verification_code(),
				}
			);

			set_verification_status("success");
			return response.data;
		} catch (error) {
			fault.minor({
				message: "Failed to verify email with code",
			});
			set_verification_status("failed");
		}
	}

	// Function to handle resending verification email
	async function handle_resend_verification(e: Event) {
		e.preventDefault();

		if (!email()) {
			fault.minor({
				message: "Please enter your email address",
			});
			return;
		}

		set_resend_status("sending");

		try {
			await api.post("/auth/signup/email/resend-verification", {
				email: email(),
			});

			set_resend_status("success");
		} catch (error) {
			fault.minor({
				message: "Failed to resend verification email",
			});
			set_resend_status("failed");
		}
	}

	// Check for token in URL params on component mount
	createEffect(() => {
		const token = search_params.token as string;
		const type = (search_params.type || "signup") as string;

		if (token) {
			verify_email_token(token, type);
		} else {
			set_verification_status("no_token");
		}
	});

	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 h-screen lg:max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-4 justify-start h-full overflow-y-auto items-center text-forest-900">
				<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
					<h1 class="text-2xl mb-6 text-forest-900 text-center">
						<Lang>
							<En>Email Verification</En>
							<Fr>Vérification de l'e-mail</Fr>
						</Lang>
					</h1>

					<Switch>
						<Match when={verification_status() === "loading"}>
							<div class="flex flex-col items-center justify-center py-8">
								<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-lapis-500 mb-4"></div>
								<p class="text-center">
									<Lang>
										<En>Verifying your email address...</En>
										<Fr>Vérification de votre adresse e-mail...</Fr>
									</Lang>
								</p>
							</div>
						</Match>

						<Match when={verification_status() === "success"}>
							<div class="flex flex-col items-center justify-center py-6">
								<div class="w-16 h-16 bg-lapis-50 rounded-full flex items-center justify-center mb-4">
									<VerifiedIcon class="min-w-fit fill-lapis-500" />
								</div>
								<h2 class="text-xl font-semibold mb-2 text-forest-800">
									<Lang>
										<En>Email Verified!</En>
										<Fr>E-mail vérifié !</Fr>
									</Lang>
								</h2>
								<p class="text-center mb-6">
									<Lang>
										<En>Your email has been successfully verified.</En>
										<Fr>Votre e-mail a été vérifié avec succès.</Fr>
									</Lang>
								</p>
								<A
									href="/signin"
									class="px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 smooth-transition"
								>
									<Lang>
										<En>Go to Login</En>
										<Fr>Aller à la connexion</Fr>
									</Lang>
								</A>
							</div>
						</Match>

						<Match when={verification_status() === "failed"}>
							<div class="flex flex-col items-center justify-center py-6">
								<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-8 w-8 text-red-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</div>
								<h2 class="text-xl font-semibold mb-2 text-forest-800">
									<Lang>
										<En>Verification Failed</En>
										<Fr>Échec de la vérification</Fr>
									</Lang>
								</h2>
								<p class="text-center mb-6">
									<Lang>
										<En>The verification link is invalid or has expired.</En>
										<Fr>Le lien de vérification est invalide ou a expiré.</Fr>
									</Lang>
								</p>

								<Show when={resend_status() !== "success"}>
									<form
										onSubmit={handle_resend_verification}
										class="w-full"
									>
										<fieldset class="mb-4">
											<label
												for="email"
												class="block text-forest-800 mb-2"
											>
												<Lang>
													<En>Your Email Address</En>
													<Fr>Votre adresse e-mail</Fr>
												</Lang>
											</label>
											<input
												type="email"
												id="email"
												value={email()}
												onInput={(e) =>
													set_email(e.target.value)
												}
												placeholder="Enter your email address"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													resend_status() ===
													"sending"
												}
											/>
										</fieldset>

										<button
											type="submit"
											class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={
												resend_status() === "sending"
											}
										>
											<Show
												when={
													resend_status() !==
													"sending"
												}
												fallback="Sending..."
											>
												<Lang>
													<En>Resend Verification Email</En>
													<Fr>Renvoyer l'e-mail de vérification</Fr>
												</Lang>
											</Show>
										</button>
									</form>
								</Show>

								<Show when={resend_status() === "success"}>
									<div class="text-center bg-lapis-50 p-4 rounded">
										<p class="mb-2">
											<Lang>
												<En>Verification email has been sent!</En>
												<Fr>L'e-mail de vérification a été envoyé !</Fr>
											</Lang>
										</p>
										<p>
											<Lang>
												<En>Please check your inbox (and spam folder) for the verification link.</En>
												<Fr>Veuillez vérifier votre boîte de réception (et dossier spam) pour le lien de vérification.</Fr>
											</Lang>
										</p>
									</div>
								</Show>
							</div>
						</Match>

						<Match when={verification_status() === "no_token"}>
							<div class="flex flex-col items-center justify-center py-6">
								<h2 class="text-xl font-semibold mb-4 text-forest-800">
									<Lang>
										<En>Email Verification</En>
										<Fr>Vérification de l'e-mail</Fr>
									</Lang>
								</h2>

								<div class="mb-6 w-full">
									<div class="flex border-b border-lapis-300">
										<button
											class={`py-2 px-4 ${verification_method() === "link" ? "border-b-2 border-lapis-500 text-forest-900" : "text-forest-700"}`}
											onClick={() =>
												set_verification_method("link")
											}
										>
											<Lang>
												<En>Resend Link</En>
												<Fr>Renvoyer le lien</Fr>
											</Lang>
										</button>
										<button
											class={`py-2 px-4 ${verification_method() === "code" ? "border-b-2 border-lapis-500 text-forest-900" : "text-forest-700"}`}
											onClick={() =>
												set_verification_method("code")
											}
										>
											<Lang>
												<En>Use Code</En>
												<Fr>Utiliser le code</Fr>
											</Lang>
										</button>
									</div>
								</div>

								<Show
									when={
										verification_method() === "link" &&
										resend_status() !== "success"
									}
								>
									<form
										onSubmit={handle_resend_verification}
										class="w-full"
									>
										<fieldset class="mb-4">
											<label
												for="email"
												class="block text-forest-800 mb-2"
											>
												<Lang>
													<En>Your Email Address</En>
													<Fr>Votre adresse e-mail</Fr>
												</Lang>
											</label>
											<input
												type="email"
												id="email"
												value={email()}
												onInput={(e) =>
													set_email(e.target.value)
												}
												placeholder="Enter your email address"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													resend_status() ===
													"sending"
												}
											/>
										</fieldset>

										<button
											type="submit"
											class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={
												resend_status() === "sending"
											}
										>
											<Show
												when={
													resend_status() !==
													"sending"
												}
												fallback="Sending..."
											>
												<Lang>
													<En>Send Verification Email</En>
													<Fr>Envoyer l'e-mail de vérification</Fr>
												</Lang>
											</Show>
										</button>
									</form>
								</Show>

								<Show when={verification_method() === "code"}>
									<form
										onSubmit={verify_email_code}
										class="w-full"
									>
										<fieldset class="mb-4">
											<label
												for="email-code"
												class="block text-forest-800 mb-2"
											>
												<Lang>
													<En>Your Email Address</En>
													<Fr>Votre adresse e-mail</Fr>
												</Lang>
											</label>
											<input
												type="email"
												id="email-code"
												value={email()}
												onInput={(e) =>
													set_email(e.target.value)
												}
												placeholder="Enter your email address"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													verification_status() ===
													"loading"
												}
											/>
										</fieldset>

										<fieldset class="mb-4">
											<label
												for="verification-code"
												class="block text-forest-800 mb-2"
											>
												<Lang>
													<En>Verification Code</En>
													<Fr>Code de vérification</Fr>
												</Lang>
											</label>
											<input
												type="text"
												id="verification-code"
												value={verification_code()}
												onInput={(e) =>
													set_verification_code(
														e.target.value
													)
												}
												placeholder="Enter 6-digit code from email"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													verification_status() ===
													"loading"
												}
												maxLength={6}
											/>
										</fieldset>

										<button
											type="submit"
											class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={
												verification_status() ===
												"loading"
											}
										>
											<Show
												when={
													verification_status() !==
													"loading"
												}
												fallback="Verifying..."
											>
												<Lang>
													<En>Verify Email with Code</En>
													<Fr>Vérifier l'e-mail avec le code</Fr>
												</Lang>
											</Show>
										</button>
									</form>
								</Show>

								<Show when={resend_status() === "success"}>
									<div class="text-center bg-lapis-50 p-4 rounded">
										<p class="mb-2">
											<Lang>
												<En>Verification email has been sent!</En>
												<Fr>L'e-mail de vérification a été envoyé !</Fr>
											</Lang>
										</p>
										<p>
											<Lang>
												<En>Please check your inbox (and spam folder) for the verification link or code.</En>
												<Fr>Veuillez vérifier votre boîte de réception (et dossier spam) pour le lien ou le code de vérification.</Fr>
											</Lang>
										</p>
									</div>
								</Show>
							</div>
						</Match>
					</Switch>
				</div>
			</section>

			<Footer />
		</main>
	);
}

export default VerifyPage;
