import Footer from "@components/footer.default";
import Header from "@components/header.default";
import { createSignal, createEffect, Show, Switch, Match } from "solid-js";
import { A, useSearchParams } from "@solidjs/router";
import { useFault } from "@components/fault";
import api from "@utils/api";

interface RecoverPasswordProps {}

function RecoverPasswordPage(props: RecoverPasswordProps) {
	const [search_params] = useSearchParams();
	const [recovery_status, set_recovery_status] = createSignal("idle");
	const [email, set_email] = createSignal("");
	const [recovery_code, set_recovery_code] = createSignal("");
	const [password, set_password] = createSignal("");
	const [confirm_password, set_confirm_password] = createSignal("");
	const [resend_status, set_resend_status] = createSignal("idle");
	const [recovery_method, set_recovery_method] = createSignal("request");
	const fault = useFault();

	// Function to request password recovery email
	async function request_recovery(e: Event) {
		e.preventDefault();

		if (!email()) {
			fault.minor({
				message: "Please enter your email address",
			});
			return;
		}

		set_recovery_status("sending");

		try {
			await api.post("/auth/recover/password", {
				email: email(),
				redirect_to: window.location.origin + "/recover-password",
			});

			set_recovery_status("requested");
		} catch (error) {
			fault.minor({
				message: "Failed to send recovery email",
			});
			set_recovery_status("failed");
		}
	}

	// Function to resend recovery email
	async function resend_recovery(e: Event) {
		e.preventDefault();

		if (!email()) {
			fault.minor({
				message: "Please enter your email address",
			});
			return;
		}

		set_resend_status("sending");

		try {
			await api.post("/auth/recover/password/resend", {
				email: email(),
				redirect_to: window.location.origin + "/recover-password",
			});

			set_resend_status("success");
		} catch (error) {
			fault.minor({
				message: "Failed to resend recovery email",
			});
			set_resend_status("failed");
		}
	}

	// Function to reset password with token from URL
	async function reset_password_with_token(token: string) {
		try {
			if (!password()) {
				fault.minor({
					message: "Please enter a new password",
				});
				return;
			}

			if (password() !== confirm_password()) {
				fault.minor({
					message: "Passwords don't match",
				});
				return;
			}

			set_recovery_status("processing");

			const response = await api.post("/auth/recover/password/reset", {
				token,
				password: password(),
			});

			set_recovery_status("success");
			return response.data;
		} catch (error) {
			fault.minor({
				message: "Failed to reset password",
			});
			set_recovery_status("failed");
		}
	}

	// Function to reset password with code
	async function reset_password_with_code(e: Event) {
		e.preventDefault();

		if (!email() || !recovery_code() || !password()) {
			fault.minor({
				message: "Please fill in all fields",
			});
			return;
		}

		if (password() !== confirm_password()) {
			fault.minor({
				message: "Passwords don't match",
			});
			return;
		}

		set_recovery_status("processing");

		try {
			const response = await api.post(
				"/auth/recover/password/reset-with-code",
				{
					email: email(),
					code: recovery_code(),
					password: password(),
				}
			);

			set_recovery_status("success");
			return response.data;
		} catch (error) {
			fault.minor({
				message: "Failed to reset password with code",
			});
			set_recovery_status("failed");
		}
	}

	// Check for token in URL params on component mount
	createEffect(() => {
		const token = search_params.token as string;

		if (token) {
			set_recovery_method("reset");
		}
	});

	return (
		<main class="md:px-48 px-6 mx-auto justify-items-center py-4 flex flex-col gap-4 h-screen md:max-h-screen">
			<Header />

			<section class="w-full flex flex-col gap-4 justify-start h-full overflow-y-auto items-center text-forest-900">
				<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
					<h1 class="text-2xl mb-6 text-forest-900 text-center">
						Password Recovery
					</h1>

					<Switch>
						<Match when={recovery_status() === "success"}>
							<div class="flex flex-col items-center justify-center py-6">
								<div class="w-16 h-16 bg-lapis-50 rounded-full flex items-center justify-center mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-8 w-8 text-lapis-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<h2 class="text-xl font-semibold mb-2 text-forest-800">
									Password Reset Successful!
								</h2>
								<p class="text-center mb-6">
									Your password has been successfully reset.
								</p>
								<A
									href="/signin"
									class="px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors"
								>
									Go to Login
								</A>
							</div>
						</Match>

						<Match when={recovery_status() === "requested"}>
							<div class="flex flex-col items-center justify-center py-6">
								<div class="w-16 h-16 bg-lapis-50 rounded-full flex items-center justify-center mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-8 w-8 text-lapis-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<h2 class="text-xl font-semibold mb-2 text-forest-800">
									Recovery Email Sent
								</h2>
								<p class="text-center mb-6">
									Please check your inbox (and spam folder)
									for the password reset link or code.
								</p>

								<div class="mb-6 w-full">
									<div class="flex border-b border-lapis-300">
										<button
											class={`py-2 px-4 ${recovery_method() === "request" ? "border-b-2 border-lapis-500 text-forest-900" : "text-forest-700"}`}
											onClick={() =>
												set_recovery_method("request")
											}
										>
											Resend Email
										</button>
										<button
											class={`py-2 px-4 ${recovery_method() === "code" ? "border-b-2 border-lapis-500 text-forest-900" : "text-forest-700"}`}
											onClick={() =>
												set_recovery_method("code")
											}
										>
											Use Code
										</button>
									</div>
								</div>

								<Show
									when={
										recovery_method() === "request" &&
										resend_status() !== "success"
									}
								>
									<form
										onSubmit={resend_recovery}
										class="w-full"
									>
										<fieldset class="mb-4">
											<label
												for="email"
												class="block text-forest-800 mb-2"
											>
												Your Email Address
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
											class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
												Resend Recovery Email
											</Show>
										</button>
									</form>
								</Show>

								<Show when={recovery_method() === "code"}>
									<form
										onSubmit={reset_password_with_code}
										class="w-full"
									>
										<fieldset class="mb-4">
											<label
												for="email-code"
												class="block text-forest-800 mb-2"
											>
												Your Email Address
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
													recovery_status() ===
													"processing"
												}
											/>
										</fieldset>

										<fieldset class="mb-4">
											<label
												for="recovery-code"
												class="block text-forest-800 mb-2"
											>
												Recovery Code
											</label>
											<input
												type="text"
												id="recovery-code"
												value={recovery_code()}
												onInput={(e) =>
													set_recovery_code(
														e.target.value
													)
												}
												placeholder="Enter 6-digit code from email"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													recovery_status() ===
													"processing"
												}
												maxLength={6}
											/>
										</fieldset>

										<fieldset class="mb-4">
											<label
												for="new-password"
												class="block text-forest-800 mb-2"
											>
												New Password
											</label>
											<input
												type="password"
												id="new-password"
												value={password()}
												onInput={(e) =>
													set_password(e.target.value)
												}
												placeholder="Enter new password"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													recovery_status() ===
													"processing"
												}
											/>
										</fieldset>

										<fieldset class="mb-4">
											<label
												for="confirm-password"
												class="block text-forest-800 mb-2"
											>
												Confirm Password
											</label>
											<input
												type="password"
												id="confirm-password"
												value={confirm_password()}
												onInput={(e) =>
													set_confirm_password(
														e.target.value
													)
												}
												placeholder="Confirm new password"
												class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
												disabled={
													recovery_status() ===
													"processing"
												}
											/>
										</fieldset>

										<button
											type="submit"
											class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={
												recovery_status() ===
												"processing"
											}
										>
											<Show
												when={
													recovery_status() !==
													"processing"
												}
												fallback="Processing..."
											>
												Reset Password
											</Show>
										</button>
									</form>
								</Show>

								<Show when={resend_status() === "success"}>
									<div class="text-center bg-lapis-50 p-4 rounded">
										<p class="mb-2">
											Recovery email has been sent!
										</p>
										<p>
											Please check your inbox (and spam
											folder) for the recovery link or
											code.
										</p>
									</div>
								</Show>
							</div>
						</Match>

						<Match when={recovery_method() === "reset"}>
							<div class="flex flex-col items-center justify-center py-6">
								<h2 class="text-xl font-semibold mb-4 text-forest-800">
									Set New Password
								</h2>

								<form class="w-full">
									<fieldset class="mb-4">
										<label
											for="new-password"
											class="block text-forest-800 mb-2"
										>
											New Password
										</label>
										<input
											type="password"
											id="new-password"
											value={password()}
											onInput={(e) =>
												set_password(e.target.value)
											}
											placeholder="Enter new password"
											class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
											disabled={
												recovery_status() ===
												"processing"
											}
										/>
									</fieldset>

									<fieldset class="mb-4">
										<label
											for="confirm-password"
											class="block text-forest-800 mb-2"
										>
											Confirm Password
										</label>
										<input
											type="password"
											id="confirm-password"
											value={confirm_password()}
											onInput={(e) =>
												set_confirm_password(
													e.target.value
												)
											}
											placeholder="Confirm new password"
											class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
											disabled={
												recovery_status() ===
												"processing"
											}
										/>
									</fieldset>

									<button
										type="button"
										class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={
											recovery_status() === "processing"
										}
										onClick={() =>
											reset_password_with_token(
												search_params.token as string
											)
										}
									>
										<Show
											when={
												recovery_status() !==
												"processing"
											}
											fallback="Processing..."
										>
											Reset Password
										</Show>
									</button>
								</form>
							</div>
						</Match>

						<Match when={recovery_status() === "failed"}>
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
									Password Reset Failed
								</h2>
								<p class="text-center mb-6">
									We couldn't reset your password. Please try
									again.
								</p>

								<button
									class="px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors"
									onClick={() => {
										if (recovery_method() === "reset") {
											set_recovery_status("idle");
										} else {
											set_recovery_status("requested");
											set_resend_status("idle");
										}
									}}
								>
									Try Again
								</button>
							</div>
						</Match>

						<Match
							when={
								recovery_status() === "idle" ||
								recovery_status() === "sending"
							}
						>
							<div class="flex flex-col items-center justify-center py-6">
								<h2 class="text-xl font-semibold mb-4 text-forest-800">
									Request Password Recovery
								</h2>

								<form
									onSubmit={request_recovery}
									class="w-full"
								>
									<fieldset class="mb-4">
										<label
											for="email-request"
											class="block text-forest-800 mb-2"
										>
											Your Email Address
										</label>
										<input
											type="email"
											id="email-request"
											value={email()}
											onInput={(e) =>
												set_email(e.target.value)
											}
											placeholder="Enter your email address"
											class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-lapis-300"
											disabled={
												recovery_status() === "sending"
											}
										/>
									</fieldset>

									<button
										type="submit"
										class="w-full px-6 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={
											recovery_status() === "sending"
										}
									>
										<Show
											when={
												recovery_status() !== "sending"
											}
											fallback="Sending..."
										>
											Send Recovery Email
										</Show>
									</button>
								</form>

								<div class="mt-4 text-center">
									<p>
										Remember your password?{" "}
										<A
											href="/signin"
											class="text-lapis-500 hover:underline"
										>
											Sign in
										</A>
									</p>
								</div>
							</div>
						</Match>
					</Switch>
				</div>
			</section>

			<Footer />
		</main>
	);
}

export default RecoverPasswordPage;
