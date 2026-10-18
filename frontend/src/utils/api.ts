import axios from "axios";
import { FaultTarget } from "@components/fault";
import { AxiosError } from "axios";
import { Navigator } from "@solidjs/router";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1",
	withCredentials: true,
	adapter: "fetch",
});

function getCSRFToken(): string | null {
	const cookies = document.cookie.split(";");

	const csrfCookie = cookies.find((cookie) =>
		cookie.trim().startsWith("csrf_=")
	);

	if (csrfCookie) {
		return csrfCookie.split("csrf_=")[1];
	}

	return null;
}

api.interceptors.request.use(
	async (config) => {
		if (config.method === "post") {
			const csrfToken = getCSRFToken();

			if (csrfToken) {
				config.headers["X-Csrf-Token"] = csrfToken;
			} else {
				try {
					await api.get("/csrf/update");
					const csrfToken = getCSRFToken();
					config.headers["X-Csrf-Token"] = csrfToken;
				} catch {}
			}
		}

		return config;
	},
	(error) => Promise.reject(error)
);

export default api;

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
