"use client";

import { useI18n } from "@/lib/i18n/context";

export default function LanguageToggle() {
  const { locale, toggle } = useI18n();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-lg border border-ink-700 px-2.5 py-1.5 text-xs font-mono font-medium text-paper-300 hover:bg-ink-800 hover:text-paper-100 transition"
      title={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
    >
      <span
        className={`h-3 w-3 rounded-full ${locale === "tr" ? "bg-coral-500" : "bg-mint-500"}`}
      />
      {locale === "tr" ? "EN" : "TR"}
    </button>
  );
}
