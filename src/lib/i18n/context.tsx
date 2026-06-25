"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Locale, translations } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  toggle: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "tr",
  setLocale: () => {},
  t: (k: string) => k,
  toggle: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] ?? key;
    },
    [locale]
  );

  const toggle = useCallback(() => {
    setLocale((prev) => (prev === "tr" ? "en" : "tr"));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
