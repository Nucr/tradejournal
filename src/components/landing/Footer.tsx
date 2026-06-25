"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-ink-800 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-lg font-bold text-paper-100">Ledger</span>
            <p className="mt-2 text-sm text-paper-500 max-w-xs">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-paper-500 mb-4">
              {t("footer.product")}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() =>
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-paper-300 hover:text-mint-400 transition"
                >
                  {t("footer.features")}
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-paper-300 hover:text-mint-400 transition"
                >
                  {t("footer.testimonials")}
                </button>
              </li>
              <li>
                <span className="text-sm text-paper-300 hover:text-mint-400 transition cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  {t("footer.register")}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-paper-500 mb-4">
              {t("footer.company")}
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-paper-300">{t("footer.about")}</span>
              </li>
              <li>
                <span className="text-sm text-paper-300">{t("footer.contact")}</span>
              </li>
              <li>
                <span className="text-sm text-paper-300">{t("footer.privacy")}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-800/50 text-center">
          <p className="text-xs text-paper-500 font-mono">
            &copy; 2025 Ledger. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
