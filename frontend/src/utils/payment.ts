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

export function ProcessMajorError(
	error: any,
	navigate: Navigator,
	fault: FaultTarget,
	message?: string
) {
	if ((error as AxiosError).status === 402) {
		fault.info({
			message:
				"You have reach the limit of what your current plan can offer, please upgrade your plan",
		});
		navigate("/pricing");
	}
	if (
		(error as AxiosError).status !== 401 &&
		(error as AxiosError).status !== 402
	)
		if (message) {
			fault.major({
				message,
			});
		} else {
			fault.major({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
		}
}
export function ProcessMinorError(
	error: any,
	navigate: Navigator,
	fault: FaultTarget,
	message?: string
) {
	if ((error as AxiosError).status === 402) {
		fault.info({
			message:
				"You have reach the limit of what your current plan can offer, please upgrade your plan",
		});
		navigate("/pricing");
	}
	if (
		(error as AxiosError).status !== 401 &&
		(error as AxiosError).status !== 402
	)
		if (message) {
			fault.minor({
				message,
			});
		} else {
			fault.minor({
				message:
					((error as AxiosError).response?.data as any).error ??
					(error as AxiosError).message,
			});
		}
}
