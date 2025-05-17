import { FaultTarget } from "@components/fault";
import { api } from "./api";
import { AxiosError } from "axios";
import { Navigator } from "@solidjs/router";

interface PaymentConfig {
	plan: string;
}

export async function Pay(params: PaymentConfig) {
	const response = await api.post("/payment/create-checkout-session", {
		plan: params.plan,
	});
	// Redirect to Stripe Checkout
	if (response.data.checkout_url) {
		window.location.href = response.data.checkout_url;
	}
}
