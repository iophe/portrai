import axios from "axios";

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
