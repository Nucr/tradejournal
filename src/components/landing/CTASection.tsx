"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

export default function CTASection() {
  const { t } = useI18n();
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={ref}
          className={`relative overflow-hidden rounded-2xl border border-mint-500/20 bg-gradient-to-br from-mint-500/5 to-ink-900/80 px-8 py-16 text-center transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100 mb-3">
              {t("cta.title")}
            </h2>
            <p className="text-paper-300 max-w-md mx-auto mb-8">{t("cta.desc")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group relative rounded-lg bg-mint-500 px-8 py-3.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition-all duration-300 hover:scale-105 active:scale-100 shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40"
              >
                <span className="relative z-10">{t("cta.register")}</span>
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-ink-700 px-8 py-3.5 text-sm font-medium text-paper-300 hover:bg-ink-800 hover:text-paper-100 transition"
              >
                {t("cta.login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
