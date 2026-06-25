"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, translations } from "./translations";

const LOCALES: Locale[] = ["tr", "en"];

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
  const pathname = usePathname();
  const router = useRouter();

  const rawLocale = pathname.split("/")[1];
  const locale: Locale = rawLocale === "en" ? "en" : "tr";

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] ?? key;
    },
    [locale]
  );

  const setLocale = useCallback(
    (l: Locale) => {
      router.push(`/${l}`);
    },
    [router]
  );

  const toggle = useCallback(() => {
    router.push(`/${locale === "tr" ? "en" : "tr"}`);
  }, [locale, router]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
