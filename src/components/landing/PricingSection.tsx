"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/use-in-view";
import { useAuth } from "@/lib/auth-context";

const PLANS = ["free", "pro", "premium"] as const;
const FREE_FEATURES = [1, 2, 3, 4, 5, 6];
const PRO_FEATURES = [1, 2, 3, 4, 5, 6, 7];
const PREMIUM_FEATURES = [1, 2, 3, 4, 5, 6];

const FEATURES_MAP: Record<string, number[]> = {
  free: FREE_FEATURES,
  pro: PRO_FEATURES,
  premium: PREMIUM_FEATURES,
};

const PRICES: Record<string, Record<string, { price: string; period: string; badge: string }>> = {
  pro: {
    monthly: { price: "9", period: "/ay", badge: "Aylık" },
    yearly: { price: "7", period: "/ay", badge: "Yıllık (En Popüler)" },
  },
  premium: {
    monthly: { price: "19", period: "/ay", badge: "Aylık" },
    yearly: { price: "15", period: "/ay", badge: "Yıllık" },
  },
};

function PricingCard({
  plan,
  features,
  badge,
  billing,
}: {
  plan: "free" | "pro" | "premium";
  features: number[];
  badge?: string;
  billing: "monthly" | "yearly";
}) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPro = plan === "pro";
  const isPremium = plan === "premium";
  const prices = PRICES[plan];

  async function handleCheckout() {
    if (!user) {
      window.location.href = "/register";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify({ plan, billing, email: user.email }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        sessionStorage.setItem("creem_checkout", JSON.stringify({ plan, uid: user.uid, checkoutId: data.checkoutId }));
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Bir hata oluştu");
      }
    } catch {
      alert("Ödeme sayfası açılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

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
            ${prices ? prices[billing].price : t(`pricing.${plan}.price`)}
          </span>
          <span className="text-sm text-paper-500">
            {prices ? prices[billing].period : t(`pricing.${plan}.period`)}
          </span>
        </div>
        {prices && billing === "yearly" && (
          <p className="text-[10px] text-mint-400 font-medium mt-1">
            ${prices.monthly.price}/ay yerine ${prices.yearly.price}/ay
          </p>
        )}
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

      {plan === "free" ? (
        <Link
          href="/register"
          className="block w-full rounded-lg border border-ink-700 text-paper-100 py-2.5 text-center text-sm font-semibold hover:bg-ink-800 transition"
        >
          {t(`pricing.${plan}.cta`)}
        </Link>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition disabled:opacity-40 ${
            isPro
              ? "bg-mint-500 text-ink-950 hover:bg-mint-400"
              : "bg-amber-400 text-ink-950 hover:bg-amber-300"
          }`}
        >
          {loading ? "Yönlendiriliyor..." : t(`pricing.${plan}.cta`)}
        </button>
      )}
    </div>
  );
}

export default function PricingSection() {
  const { t } = useI18n();
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100">
            {t("pricing.title")}
          </h2>
          <p className="mt-3 text-paper-300">{t("pricing.desc")}</p>

          {/* Global billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBilling("monthly")}
              className={`relative px-5 py-2 text-sm font-semibold rounded-full transition ${
                billing === "monthly"
                  ? "bg-mint-500 text-ink-950 shadow-lg shadow-mint-500/25"
                  : "bg-ink-800 text-paper-400 hover:text-paper-200"
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`relative px-5 py-2 text-sm font-semibold rounded-full transition ${
                billing === "yearly"
                  ? "bg-mint-500 text-ink-950 shadow-lg shadow-mint-500/25"
                  : "bg-ink-800 text-paper-400 hover:text-paper-200"
              }`}
            >
              Yıllık
              <span className="absolute -top-2 -right-2 bg-amber-400 text-ink-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                2 Ay Ücretsiz
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan}
              plan={plan}
              features={FEATURES_MAP[plan]}
              badge={plan !== "free" ? (billing === "yearly" ? t(`pricing.${plan}.badge`) : undefined) : undefined}
              billing={billing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
