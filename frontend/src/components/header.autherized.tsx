import { A } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import LogoIcon from "@assets/icons/logo.svg?component-solid";
import HomeIcon from "@assets/icons/home.svg?component-solid";
import { api } from "@utils/api";
import DefaultHeader from "@components/header.default";
import { En, Fr, Lang, useLang } from "@components/language";

interface HeaderProps {}

function Header(props: HeaderProps) {
	if (!localStorage.getItem("IS_AUTHENTICATED")) {
		return <DefaultHeader />;
	}

	return (
		<header class="w-full flex lg:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest flex flex-row gap-2 items-center">
					<LogoIcon />
					<span>
						PORTR
						<span class="alice-regular text-forest-900">AI</span>
					</span>
				</h1>
			</A>
			<div class="lg:w-fit w-full text-sm lg:text-xl flex flex-row lg:gap-16 lg:justify-center justify-between items-center">
				<A
					href="/"
					class="tracking-widest hidden lg:block"
					activeClass="text-forest-600"
				>
					<HomeIcon class="fill-forest-500" />
				</A>
				<A
					href="/history"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>
							<h1>History</h1>
						</En>
						<Fr>
							<h1>Historique</h1>
						</Fr>
					</Lang>
				</A>
				<A
					href="/my-templates"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>
							<h1>Templates</h1>
						</En>
						<Fr>
							<h1>Modèles</h1>
						</Fr>
					</Lang>
				</A>
				<A
					href="/blogs"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>
							<h1>Blog</h1>
						</En>
						<Fr>
							<h1>Blog</h1>
						</Fr>
					</Lang>
				</A>
				<A
					href="/account"
					class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>
							<h1 class="text-nowrap">My Account</h1>
						</En>
						<Fr>
							<h1 class="text-nowrap">Mon Compte</h1>
						</Fr>
					</Lang>
				</A>
			</div>
		</header>
	);
}

export function AccountHeader(props: HeaderProps) {
	const lang = useLang();
	const [dropdownOpen, setDropdownOpen] = createSignal(false);

	// Liste des langues disponibles
	const languages = [
		{ code: "en", name: "English" },
		{ code: "fr", name: "Français" },
	];

	// Obtenir le nom de la langue actuelle pour l'affichage
	const getCurrentLanguageName = () => {
		const currentCode = lang.current();
		const language = languages.find((l) => l.code === currentCode);
		return language ? language.name : "Language";
	};

	// Gérer la sélection d'une langue avec type explicite
	const handleLanguageSelect = (code: string) => {
		lang.update(code);
		setDropdownOpen(false);
	};

	return (
		<header class="w-full flex lg:flex-row flex-col gap-4 justify-between items-center">
			<A href="/">
				<h1 class="text-2xl tracking-widest">
					PORTR<span class="alice-regular text-forest-900">AI</span>
				</h1>
			</A>
			<div class="lg:w-fit w-full flex flex-row lg:gap-16 lg:justify-center justify-between items-center">
				{/* Sélecteur de langue */}
				<div class="relative">
					<button
						onClick={() => setDropdownOpen(!dropdownOpen())}
						class="flex items-center gap-1 tracking-widest text-sm lg:text-xl"
					>
						{getCurrentLanguageName()}
						<svg
							class="w-4 h-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>

					<Show when={dropdownOpen()}>
						<div class="absolute mt-1 w-40 bg-white rounded-md shadow-lg z-10 overflow-hidden transition-all duration-200">
							<ul class="py-1">
								{languages.map((language) => (
									<li>
										<button
											class={`w-full text-left px-4 py-2 hover:bg-forest-50 ${lang.current() === language.code ? "bg-forest-100 font-medium" : ""}`}
											onClick={() =>
												handleLanguageSelect(
													language.code
												)
											}
										>
											{language.name}
										</button>
									</li>
								))}
							</ul>
						</div>
					</Show>
				</div>

				<A
					href="/blog"
					class="tracking-widest"
					activeClass="text-forest-600"
				>
					<Lang>
						<En>
							<h2>Blog</h2>
						</En>
						<Fr>
							<h2>Blog</h2>
						</Fr>
					</Lang>
				</A>
				<button
					onclick={async (e) => {
						try {
							await api.post("/auth/logout");
							localStorage.clear();
							window.location.reload();
						} catch (error) {
							console.error(error);
						}
					}}
					class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
				>
					<Lang>
						<En>
							<h2 class="text-nowrap">Log out</h2>
						</En>
						<Fr>
							<h2 class="text-nowrap">Déconnexion</h2>
						</Fr>
					</Lang>
				</button>
			</div>
		</header>
	);
}

export default Header;
