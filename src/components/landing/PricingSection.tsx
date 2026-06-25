"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

const PLANS = ["free", "pro", "premium"] as const;
const FREE_FEATURES = [1, 2, 3, 4, 5, 6];
const PRO_FEATURES = [1, 2, 3, 4, 5, 6, 7];
const PREMIUM_FEATURES = [1, 2, 3, 4, 5, 6];

const FEATURES_MAP: Record<string, number[]> = {
  free: FREE_FEATURES,
  pro: PRO_FEATURES,
  premium: PREMIUM_FEATURES,
};

function PricingCard({
  plan,
  features,
  badge,
}: {
  plan: "free" | "pro" | "premium";
  features: number[];
  badge?: string;
}) {
  const { t } = useI18n();

  const isPro = plan === "pro";
  const isPremium = plan === "premium";

  return (
    <div
      className={`relative rounded-xl border p-8 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        isPro
          ? "border-mint-500/40 bg-gradient-to-b from-mint-500/5 to-ink-900/80"
          : isPremium
            ? "border-amber-400/30 bg-gradient-to-b from-amber-400/5 to-ink-900/80"
            : "border-ink-800 bg-ink-900/50"
      }`}
    >
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${
          isPro ? "bg-mint-500 text-ink-950" : "bg-amber-400 text-ink-950"
        }`}>
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

      <ul className="space-y-3 mb-8 flex-1">
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
        href={plan === "free" ? "/register" : "/pricing"}
        className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
          isPro
            ? "bg-mint-500 text-ink-950 hover:bg-mint-400"
            : isPremium
              ? "bg-amber-400 text-ink-950 hover:bg-amber-300"
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
      <div className="mx-auto max-w-6xl px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan}
              plan={plan}
              features={FEATURES_MAP[plan]}
              badge={plan !== "free" ? t(`pricing.${plan}.badge`) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
