import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.API ?? "http://localhost:3000/api/v1",
	withCredentials: true,
	adapter: "fetch",
});
