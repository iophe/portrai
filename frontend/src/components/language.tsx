import { Accessor, children, createContext, createMemo, createResource, createSignal, JSX, JSXElement, Match, onMount, Setter, Switch, useContext } from "solid-js";

class LangManager {
    current : Accessor<string>
    private _update: Setter<string>
    constructor() {
        let default_lang = localStorage.getItem("lang");
        if (!default_lang) {
            default_lang = navigator.language.includes('-') ? navigator.language.split('-')[0] : navigator.language;
            localStorage.setItem("lang", default_lang);
        }
        
        const [current, update] = createSignal(default_lang);
        this.current = current
        this._update = update
    }

    update(lang:string) {
        localStorage.setItem("lang", lang);
        this._update(lang)
    }
}

export const LangContext = createContext<LangManager>();
export function useLang<T = LangManager>() {
    return useContext(LangContext) as T;
}
interface LangProviderProps {
    children?: JSXElement;
}
export function LangProvider(props: LangProviderProps) {
    const lang = new LangManager();

    return (
        <LangContext.Provider value={lang}>
            {props.children}
        </LangContext.Provider>
    );
}

interface InnerLangProps {
    lang ?: string
    children ?: JSXElement
}

export function Fr(props:InnerLangProps) {
    props.lang = "fr";
    return (props as unknown) as JSXElement;;
}

export function En(props:InnerLangProps) {
    props.lang = "en";
    return (props as unknown) as JSXElement;
}

export function Es(props:InnerLangProps) {
    props.lang = "es";
    return (props as unknown) as JSXElement;
}

interface LangProps {
    fallback ?: JSXElement
    children : JSXElement
}

export function Lang(props:LangProps) {
    const lang = useLang();
    const children = createMemo(() => {
        const chs = (props.children as JSX.ArrayElement);
        for (let index = 0; index < chs.length; index++) {
            const element = chs[index];
            if ( typeof element === "function") {
                const inner_props = (element as () => InnerLangProps)();
                if (inner_props.lang === lang.current()) {
                    return inner_props.children;
                }
            }   
        }
        return props.fallback
    })

    return <>{children()}</>;
}

export function Test() {
    const lang = useLang();

    onMount(() => {
        setTimeout(() => {
            lang.update("en");
        }, 1000)
    })

    return (
        <Lang>
            <Fr>Bonjour</Fr>
            <En>Hello</En>
            <Es>Hola</Es>
        </Lang>
    );
}