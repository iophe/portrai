import { Component, Show, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import LogoIcon from "@assets/icons/logo.svg?component-solid";
import { api } from "@utils/api";
import { En, Fr, Lang, LangProvider, Test, useLang } from "@components/language";

function Header() {
  const is_authenticated = localStorage.getItem("IS_AUTHENTICATED");
  const lang = useLang();
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  
  // Liste des langues disponibles
  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" }
  ];
  
  // Obtenir le nom de la langue actuelle pour l'affichage
  const getCurrentLanguageName = () => {
    const currentCode = lang.current();
    const language = languages.find(l => l.code === currentCode);
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
        <h1 class="text-2xl tracking-widest flex flex-row gap-2 items-center">
          <LogoIcon />
          <span>
            PORTR
            <span class="alice-regular text-forest-900">AI</span>
          </span>
        </h1>
      </A>
      
      <div class="lg:w-fit w-full text-sm lg:text-xl flex flex-row lg:gap-16 lg:justify-center justify-between items-center">
        {/* Sélecteur de langue */}
        <div class="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen())} 
            class="flex items-center gap-1 tracking-widest text-sm lg:text-xl"
          >
            {getCurrentLanguageName()}
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <Show when={dropdownOpen()}>
            <div class="absolute mt-1 w-40 bg-white rounded-md shadow-lg z-10 overflow-hidden transition-all duration-200">
              <ul class="py-1">
                {languages.map((language) => (
                  <li>
                    <button
                      class={`w-full text-left px-4 py-2 hover:bg-forest-50 ${lang.current() === language.code ? 'bg-forest-100 font-medium' : ''}`}
                      onClick={() => handleLanguageSelect(language.code)}
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
          href="/blogs"
          class="tracking-widest"
          activeClass="text-forest-600"
        >
          <Lang>
            {[
              <En>Blog</En>,
              <Fr>Blog</Fr>
            ]}
          </Lang>
        </A>
        
        <A
          href="/pricing"
          class="tracking-widest"
          activeClass="text-forest-600"
        >
          <Lang>
            {[
              <En>Pricing</En>,
              <Fr>Prix</Fr>
            ]}
          </Lang>
        </A>
        
        <Show when={!is_authenticated}>
          <A
            href="/signin"
            class="tracking-widest"
            activeClass="text-forest-600"
          >
            <Lang>
              {[
                <En>Signin</En>,
                <Fr>Se Connecter</Fr>
              ]}
            </Lang>
          </A>
        </Show>
        
        <Show
          when={is_authenticated}
          fallback={
            <A
              href="/pricing"
              class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
              activeClass="text-forest-600"
            >
              <h1 class="text-nowrap">
                <Lang>
                  {[
                    <En>Get Started</En>,
                    <Fr>Commencer</Fr>
                  ]}
                </Lang>
              </h1>
            </A>
          }
        >
          <A
            href="/account"
            class="tracking-widest bg-forest-800 text-snow-100 py-2 px-4 rounded"
            activeClass="text-forest-600"
          >
            <h1 class="text-nowrap">
              <Lang>
                {[
                  <En>My account</En>,
                  <Fr>Mon compte</Fr>
                ]}
              </Lang>
            </h1>
          </A>
        </Show>
      </div>
    </header>
  );
}

export default Header;