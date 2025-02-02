import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import solid_svg from "vite-plugin-solid-svg";

export default defineConfig({
	plugins: [
		solidPlugin(),
		tailwindcss(),
		solid_svg({
			defaultAsComponent: true,
		}),
	],
	server: {
		port: 5050,
	},
	build: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@utils": path.resolve(__dirname, "./src/utils"),
		},
	},
	optimizeDeps: {
		include: ["solid-js"],
	},
});
