"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { Language, Translations, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHindi: boolean;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleCustom = () => callback();
  window.addEventListener("skillbridge-lang-change", handleCustom);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === "skillbridge-lang") {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("skillbridge-lang-change", handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("skillbridge-lang");
  if (saved === "hi" || saved === "en") return saved;
  const docLang = document.documentElement.lang;
  if (docLang === "hi") return "hi";
  return "en";
}

function getServerSnapshot(): Language {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = useCallback((next: Language) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("skillbridge-lang", next);
      document.documentElement.lang = next;
      document.cookie = `sb_lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("skillbridge-lang-change", { detail: next }));
    } catch {
      // ignore
    }
  }, []);

  const currentTranslations = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isHindi: language === "hi",
        t: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      isHindi: false,
      t: translations.en,
    };
  }
  return ctx;
}
