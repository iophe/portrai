import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.API ?? "http://localhost:3000/api/v1",
	withCredentials: true,
	adapter: "fetch",
});

api.interceptors.request.use(
	(config) => {
		const csrfToken =
			document.cookie
				.split("; ")
				.find((row) => row.startsWith("csrf_token="))
				?.split("=")[1]
				?.toString() + "=";

		if (csrfToken) {
			config.headers["X-CSRF-Token"] = csrfToken;
		}

		return config;
	},
	(error) => Promise.reject(error)
);

export default api;
