import { useFault } from "@components/fault";
import Footer from "@components/footer.default";
import Header from "@components/header.autherized";
import { En, Fr, Lang } from "@components/language";
import { A } from "@solidjs/router";
import api from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";

interface SupportPageProps {}

function Support(props: SupportPageProps) {
	const fault = useFault();
	// State for the contact form
	const [form_data, set_form_data] = createStore({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const [is_submitting, set_is_submitting] = createSignal(false);
	const [submit_success, set_submit_success] = createSignal(false);

	// Handle form submission
	const handle_submit = async (e: Event) => {
		e.preventDefault();
		set_is_submitting(true);
		set_submit_success(false);
		try {
			await api.post("/mail/issue", form_data);

			set_submit_success(true);
			set_form_data({
				name: "",
				email: "",
				subject: "",
				message: "",
			});
		} catch (error) {
			if (
				(error as AxiosError).status !== 401 &&
				(error as AxiosError).status !== 402
			)
				fault.minor({
					message:
						"There was an error sending your message. Please try again.",
				});
		} finally {
			set_is_submitting(false);
		}
	};

	return (
		<main class="lg:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 min-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-8 py-8">
				<header class="text-center mb-4">
					<h1 class="text-3xl font-bold text-forest-900 mb-2">
						<Lang>
							<En>Customer Support</En>
							<Fr>Support Client</Fr>
						</Lang>
					</h1>
					<p class="text-lg text-gray-600 max-w-2xl mx-auto">
						<Lang>
							<En>
								We're here to help with any questions or issues
								you may have. Browse through our FAQs or contact
								us directly.
							</En>
							<Fr>
								Nous sommes là pour vous aider avec toutes vos
								questions ou problèmes. Parcourez nos FAQ ou
								contactez-nous directement.
							</Fr>
						</Lang>
					</p>
				</header>

				<div class="grid lg:grid-cols-2 gap-12 mt-4">
					{/* Left column - FAQs */}
					<section class="flex flex-col gap-6">
						<h2 class="text-2xl font-semibold text-forest-800">
							<Lang>
								<En>Frequently Asked Questions</En>
								<Fr>Questions Fréquemment Posées</Fr>
							</Lang>
						</h2>

						<dl class="space-y-6">
							<div class="border-b border-gray-200 pb-4">
								<dt class="text-lg font-medium text-forest-700 mb-2">
									<Lang>
										<En>How do I reset my password?</En>
										<Fr>
											Comment réinitialiser mon mot de
											passe ?
										</Fr>
									</Lang>
								</dt>
								<dd class="text-gray-600">
									<Lang>
										<En>
											You can reset your password by
											clicking on the "Forgot Password"
											link on the login page. We'll send a
											password reset link to your
											registered email address.
										</En>
										<Fr>
											Vous pouvez réinitialiser votre mot
											de passe en cliquant sur le lien
											"Mot de passe oublié" sur la page de
											connexion. Nous vous enverrons un
											lien de réinitialisation à votre
											adresse e-mail enregistrée.
										</Fr>
									</Lang>
								</dd>
							</div>

							<div class="border-b border-gray-200 pb-4">
								<dt class="text-lg font-medium text-forest-700 mb-2">
									<Lang>
										<En>
											What payment methods do you accept?
										</En>
										<Fr>
											Quels moyens de paiement
											acceptez-vous ?
										</Fr>
									</Lang>
								</dt>
								<dd class="text-gray-600">
									<Lang>
										<En>
											We accept all major credit cards
											(Visa, MasterCard, American
											Express), PayPal, and bank
											transfers. All payments are securely
											processed through Stripe.
										</En>
										<Fr>
											Nous acceptons toutes les
											principales cartes de crédit (Visa,
											MasterCard, American Express),
											PayPal et les virements bancaires.
											Tous les paiements sont traités en
											toute sécurité via Stripe.
										</Fr>
									</Lang>
								</dd>
							</div>

							<div class="pb-4">
								<dt class="text-lg font-medium text-forest-700 mb-2">
									<Lang>
										<En>How do I get technical support?</En>
										<Fr>
											Comment obtenir une assistance
											technique ?
										</Fr>
									</Lang>
								</dt>
								<dd class="text-gray-600">
									<Lang>
										<En>
											For technical issues, please fill
											out the contact form with details
											about your problem, or email us
											directly at
											portrai.contact@gmail.com.
										</En>
										<Fr>
											Pour les problèmes techniques,
											veuillez remplir le formulaire de
											contact avec les détails de votre
											problème, ou envoyez-nous un e-mail
											directement à
											portrai.contact@gmail.com.
										</Fr>
									</Lang>
								</dd>
							</div>
						</dl>
						<aside class="bg-gray-50 p-6 rounded-lg border border-gray-200">
							<h3 class="text-lg font-medium text-forest-700 mb-3">
								<Lang>
									<En>Our Policies</En>
									<Fr>Nos Politiques</Fr>
								</Lang>
							</h3>

							<div>
								<A href="/policies/term-of-services">
									<Lang>
										<En>Term of service</En>
										<Fr>Conditions d'utilisation</Fr>
									</Lang>
								</A>
							</div>
							<div>
								<A href="/policies/privacy">
									<Lang>
										<En>Privacy</En>
										<Fr>Confidentialité</Fr>
									</Lang>
								</A>
							</div>
						</aside>
					</section>

					{/* Right column - Contact form */}
					<section class="flex flex-col gap-6">
						<h2 class="text-2xl font-semibold text-forest-800">
							<Lang>
								<En>Contact Us</En>
								<Fr>Contactez-nous</Fr>
							</Lang>
						</h2>

						<Show
							when={!submit_success()}
							fallback={
								<article class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
									<figure class="text-green-500 mb-3">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="48"
											height="48"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
											<polyline points="22 4 12 14.01 9 11.01"></polyline>
										</svg>
									</figure>
									<h3 class="text-xl font-medium text-green-700 mb-2">
										<Lang>
											<En>Message Sent Successfully</En>
											<Fr>Message Envoyé avec Succès</Fr>
										</Lang>
									</h3>
									<p class="text-green-600 mb-4">
										<Lang>
											<En>
												Thank you for reaching out!
												We've received your message and
												will get back to you as soon as
												possible.
											</En>
											<Fr>
												Merci de nous avoir contactés !
												Nous avons bien reçu votre
												message et vous répondrons dès
												que possible.
											</Fr>
										</Lang>
									</p>
									<button
										onClick={() =>
											set_submit_success(false)
										}
										class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 smooth-transition"
									>
										<Lang>
											<En>Send Another Message</En>
											<Fr>Envoyer un autre message</Fr>
										</Lang>
									</button>
								</article>
							}
						>
							<form
								onSubmit={handle_submit}
								class="flex flex-col gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200"
							>
								<fieldset>
									<label
										for="name"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										<Lang>
											<En>Name</En>
											<Fr>Nom</Fr>
										</Lang>
									</label>
									<input
										id="name"
										type="text"
										required
										value={form_data.name}
										onInput={(e) =>
											set_form_data(
												"name",
												e.target.value
											)
										}
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
									/>
								</fieldset>

								<fieldset>
									<label
										for="email"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										<Lang>
											<En>Email</En>
											<Fr>E-mail</Fr>
										</Lang>
									</label>
									<input
										id="email"
										type="email"
										required
										value={form_data.email}
										onInput={(e) =>
											set_form_data(
												"email",
												e.target.value
											)
										}
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
									/>
								</fieldset>

								<fieldset>
									<label
										for="subject"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										<Lang>
											<En>Subject</En>
											<Fr>Sujet</Fr>
										</Lang>
									</label>
									<input
										id="subject"
										type="text"
										required
										value={form_data.subject}
										onInput={(e) =>
											set_form_data(
												"subject",
												e.target.value
											)
										}
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
									/>
								</fieldset>

								<fieldset>
									<label
										for="message"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										<Lang>
											<En>Message</En>
											<Fr>Message</Fr>
										</Lang>
									</label>
									<textarea
										id="message"
										required
										rows="5"
										value={form_data.message}
										onInput={(e) =>
											set_form_data(
												"message",
												e.target.value
											)
										}
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
									></textarea>
								</fieldset>

								<button
									type="submit"
									disabled={is_submitting()}
									class="px-6 py-3 bg-forest-700 text-white rounded-lg hover:bg-forest-800 smooth-transition disabled:bg-gray-400"
								>
									<Lang>
										<En>
											{is_submitting()
												? "Sending..."
												: "Send Message"}
										</En>
										<Fr>
											{is_submitting()
												? "Envoi en cours..."
												: "Envoyer le message"}
										</Fr>
									</Lang>
								</button>
							</form>
						</Show>

						<aside class="bg-gray-50 p-6 rounded-lg border border-gray-200">
							<h3 class="text-lg font-medium text-forest-700 mb-3">
								<Lang>
									<En>Other Ways to Reach Us</En>
									<Fr>Autres façons de nous contacter</Fr>
								</Lang>
							</h3>

							<address class="space-y-4 not-italic">
								<div class="flex items-start gap-3">
									<figure class="text-forest-600 mt-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
											<polyline points="22,6 12,13 2,6"></polyline>
										</svg>
									</figure>
									<div>
										<h4 class="font-medium">
											<Lang>
												<En>Email</En>
												<Fr>E-mail</Fr>
											</Lang>
										</h4>
										<p class="text-gray-600">
											<a href="mailto:portrai.contact@gmail.com">
												portrai.contact@gmail.com
											</a>
										</p>
									</div>
								</div>
							</address>
						</aside>
					</section>
				</div>
			</section>
			<Footer />
		</main>
	);
}

export default Support;
