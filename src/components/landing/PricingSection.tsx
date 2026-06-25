"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

const FREE_FEATURES = [1, 2, 3, 4];
const PRO_FEATURES = [1, 2, 3, 4, 5];

function PricingCard({
  plan,
  features,
  badge,
}: {
  plan: "free" | "pro";
  features: number[];
  badge?: string;
}) {
  const { t } = useI18n();

  return (
    <div
      className={`relative rounded-xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
        plan === "pro"
          ? "border-mint-500/40 bg-gradient-to-b from-mint-500/5 to-ink-900/80"
          : "border-ink-800 bg-ink-900/50"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-mint-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950">
          {badge}
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-paper-100">
          {t(`pricing.${plan}.name`)}
        </h3>
        <div className="mt-3 flex items-baseline justify-center gap-0.5">
          <span className="font-display text-4xl font-bold text-paper-100">
            ${t(`pricing.${plan}.price`)}
          </span>
          <span className="text-sm text-paper-500">{t(`pricing.${plan}.period`)}</span>
        </div>
        <p className="mt-2 text-xs text-paper-300">{t(`pricing.${plan}.desc`)}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-paper-300">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-mint-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {t(`pricing.${plan}.feature${f}`)}
          </li>
        ))}
      </ul>

      <Link
        href="/register"
        className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
          plan === "pro"
            ? "bg-mint-500 text-ink-950 hover:bg-mint-400"
            : "border border-ink-700 text-paper-100 hover:bg-ink-800"
        }`}
      >
        {t(`pricing.${plan}.cta`)}
      </Link>
    </div>
  );
}

export default function PricingSection() {
  const { t } = useI18n();
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100">
            {t("pricing.title")}
          </h2>
          <p className="mt-3 text-paper-300">{t("pricing.desc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <PricingCard plan="free" features={FREE_FEATURES} />
          <PricingCard plan="pro" features={PRO_FEATURES} badge={t("pricing.pro.badge")} />
        </div>
      </div>
    </section>
  );
}
