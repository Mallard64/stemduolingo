"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import en from "@/lib/translations/en.json";
import es from "@/lib/translations/es.json";

export type Language = "en" | "es";

export const translations: Record<Language, typeof en> = {
  en,
  es,
};

type I18nStore = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        const keys = key.split(".");
        let value: any = translations[lang];
        for (const k of keys) {
          value = value?.[k];
        }
        return value || key;
      },
    }),
    {
      name: "omnistem-i18n",
    }
  )
);
