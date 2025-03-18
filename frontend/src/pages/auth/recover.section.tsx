import { createSignal, Show } from "solid-js";
import { useFault } from "@components/fault";
import EditIcon from "@assets/icons/edit.svg?component-solid";
import api from "@utils/api";

interface RecoverAccountProps {}

function RecoverAccount(props: RecoverAccountProps) {
	const [current_password, set_current_password] = createSignal("");
	const [new_password, set_new_password] = createSignal("");
	const [confirm_password, set_confirm_password] = createSignal("");
	const [password_status, set_password_status] = createSignal("idle");
	const [show_form, set_show_form] = createSignal(false);
	const fault = useFault();

	// Function to initiate password change
	async function handle_change_password(e: Event) {
		e.preventDefault();

		// Validate passwords
		if (!current_password()) {
			fault.minor({
				message: "Please enter your current password",
			});
			return;
		}

		if (!new_password()) {
			fault.minor({
				message: "Please enter a new password",
			});
			return;
		}

		if (new_password() !== confirm_password()) {
			fault.minor({
				message: "New passwords don't match",
			});
			return;
		}

		// Prevent using the same password
		if (current_password() === new_password()) {
			fault.minor({
				message: "New password must be different from current password",
			});
			return;
		}

		set_password_status("processing");

		try {
			// First verify current password by trying to sign in
			await api.post("/auth/recover/password/update", {
				current_password: current_password(),
				new_password: new_password(),
			});

			// Clear fields and show success message
			set_current_password("");
			set_new_password("");
			set_confirm_password("");
			set_password_status("success");

			// After 5 seconds, reset status and hide form
			setTimeout(() => {
				set_password_status("idle");
				set_show_form(false);
			}, 5000);
		} catch (error) {
			console.error("Password change error:", error);
			fault.minor({
				message:
					"Failed to change password. Please ensure your current password is correct.",
			});
			set_password_status("failed");
		}
	}

	// Function to initiate password reset via email
	async function handle_reset_password() {
		set_password_status("sending");

		try {
			const user_response = await api.get("/auth/user-email");
			const user_email = user_response.data.email;

			if (!user_email) {
				fault.minor({
					message: "Could not determine your email address",
				});
				set_password_status("failed");
				return;
			}

			// Send password recovery email
			await api.post("/auth/recover/password", {
				email: user_email,
			});

			set_password_status("requested");

			// After 5 seconds, reset status
			setTimeout(() => {
				set_password_status("idle");
				set_show_form(false);
			}, 5000);
		} catch (error) {
			fault.minor({
				message: "Failed to initiate password reset",
			});
			set_password_status("failed");
		}
	}

	return (
		<div class="w-full">
			<div class="flex flex-col gap-2">
				<p class="text-forest-700">Account Management</p>

				<Show when={!show_form() && password_status() === "idle"}>
					<div class="flex flex-col gap-2 mt-2">
						<button
							class="flex flex-row gap-4 items-center border w-fit px-4 py-2 rounded border-lapis-400 text-lapis-600"
							onClick={() => set_show_form(true)}
						>
							<span>Change Password</span>
                            <EditIcon class="fill-lapis-600"/>
						</button>
					</div>
				</Show>

				<Show
					when={
						show_form() &&
						password_status() !== "requested" &&
						password_status() !== "success"
					}
				>
					<form
						onSubmit={handle_change_password}
						class="w-full max-w-md bg-white rounded-lg mt-4"
					>
						<fieldset class="mb-4">
							<label
								for="current-password"
								class="block text-forest-800 mb-2"
							>
								Current Password
							</label>
							<input
								type="password"
								id="current-password"
								value={current_password()}
								onInput={(e) =>
									set_current_password(e.target.value)
								}
								placeholder="Enter your current password"
								class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
								disabled={password_status() === "processing"}
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
								value={new_password()}
								onInput={(e) =>
									set_new_password(e.target.value)
								}
								placeholder="Enter new password"
								class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
								disabled={password_status() === "processing"}
							/>
						</fieldset>

						<fieldset class="mb-4">
							<label
								for="confirm-new-password"
								class="block text-forest-800 mb-2"
							>
								Confirm New Password
							</label>
							<input
								type="password"
								id="confirm-new-password"
								value={confirm_password()}
								onInput={(e) =>
									set_confirm_password(e.target.value)
								}
								placeholder="Confirm new password"
								class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
								disabled={password_status() === "processing"}
							/>
						</fieldset>

						<div class="flex justify-between gap-4 mt-6">
							<button
								type="button"
								class="px-4 py-2 border border-forest-800 text-forest-800 rounded hover:bg-forest-50 transition-colors"
								onClick={() => set_show_form(false)}
								disabled={password_status() === "processing"}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="px-4 py-2 bg-forest-800 text-white rounded hover:bg-forest-700 transition-colors"
								disabled={password_status() === "processing"}
							>
								<Show
									when={password_status() !== "processing"}
									fallback="Updating..."
								>
									Update Password
								</Show>
							</button>
						</div>

						<div class="mt-4 pt-4 border-t border-lapis-200">
							<p class="text-sm text-forest-700 mb-2">
								Forgot your current password?
							</p>
							<button
								type="button"
								class="text-lapis-500 hover:underline text-sm"
								onClick={handle_reset_password}
								disabled={
									password_status() === "processing" ||
									password_status() === "sending"
								}
							>
								<Show
									when={password_status() !== "sending"}
									fallback="Sending reset email..."
								>
									Send password reset email instead
								</Show>
							</button>
						</div>
					</form>
				</Show>

				<Show when={password_status() === "success"}>
					<div class="w-full max-w-md bg-lapis-10 p-4 rounded mt-4">
						<div class="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-lapis-500 mr-2"
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
							<p class="text-forest-800">
								Password changed successfully!
							</p>
						</div>
					</div>
				</Show>

				<Show when={password_status() === "requested"}>
					<div class="w-full max-w-md bg-lapis-10 p-4 rounded mt-4">
						<div class="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-lapis-500 mr-2"
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
							<p class="text-forest-800">
								Password reset email sent! Check your inbox.
							</p>
						</div>
					</div>
				</Show>

				<Show when={password_status() === "failed"}>
					<div class="w-full max-w-md bg-red-100 p-4 rounded mt-4">
						<div class="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-red-500 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<p class="text-red-800">
								Error changing password. Please try again.
							</p>
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
}

export default RecoverAccount;
