"use client";

import { useAuth } from "@/lib/auth-context";
import { usePlan, PLAN_LIMITS } from "@/lib/features";
import type { Plan } from "@/lib/features";
import { useState } from "react";
import Link from "next/link";

const PLAN_INFO: Record<Plan, { label: string; price: Record<string, string>; color: string; badge: string }> = {
  free: { label: "Free", price: { monthly: "$0", yearly: "$0" }, color: "text-paper-400", badge: "bg-ink-700 text-paper-300" },
  pro: { label: "Pro", price: { monthly: "$9/ay", yearly: "$7/ay" }, color: "text-mint-400", badge: "bg-mint-500/20 text-mint-400 border border-mint-500/30" },
  premium: { label: "Premium", price: { monthly: "$19/ay", yearly: "$15/ay" }, color: "text-amber-400", badge: "bg-amber-400/20 text-amber-400 border border-amber-400/30" },
};

export default function BillingPage() {
  const { user } = useAuth();
  const { plan, getLimit } = usePlan();
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const currentPlan = PLAN_INFO[plan];

  async function handleUpgrade(targetPlan: Plan) {
    if (targetPlan === "free" || targetPlan === plan) return;
    setLoading(targetPlan);

    try {
      const res = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.uid}`,
        },
        body: JSON.stringify({ plan: targetPlan, billing }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Bir hata oluştu");
      }
    } catch {
      alert("Ödeme sayfası açılırken bir hata oluştu");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/creem/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.uid}`,
        },
      });

      const data = await res.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      } else {
        alert(data.error || "Portal açılamadı");
      }
    } catch {
      alert("Portal açılırken bir hata oluştu");
    } finally {
      setPortalLoading(false);
    }
  }

  const planLimits = PLAN_LIMITS[plan];
  const tradeLimit = planLimits?.trades === Infinity ? "Sınırsız" : planLimits?.trades ?? 0;
  const strategyLimit = planLimits?.strategies === Infinity ? "Sınırsız" : planLimits?.strategies ?? 0;
  const goalLimit = planLimits?.goals === Infinity ? "Sınırsız" : planLimits?.goals ?? 0;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Abonelik</h1>
      <p className="text-sm text-paper-500 mb-8">Planını görüntüle ve yönet.</p>

      {/* Current Plan Card */}
      <section className="rounded-xl border border-ink-800 bg-gradient-to-br from-ink-900 to-ink-950 p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-mint-500/60 to-mint-500/10" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-paper-500 font-mono uppercase tracking-wider mb-1">Mevcut Plan</p>
            <div className="flex items-center gap-3">
              <h2 className={`font-display text-2xl font-bold ${currentPlan.color}`}>
                {currentPlan.label}
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${currentPlan.badge}`}>
                {currentPlan.price[billing]}
              </span>
            </div>
          </div>
          {plan !== "free" && (
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="rounded-lg border border-ink-700 text-paper-300 px-4 py-2 text-sm hover:bg-ink-800 transition disabled:opacity-40"
            >
              {portalLoading ? "Açılıyor..." : "Aboneliği Yönet"}
            </button>
          )}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg bg-ink-800/50 p-3">
            <p className="text-xs text-paper-500 font-mono">Trade</p>
            <p className="text-lg font-semibold text-paper-100">{tradeLimit}</p>
          </div>
          <div className="rounded-lg bg-ink-800/50 p-3">
            <p className="text-xs text-paper-500 font-mono">Strateji</p>
            <p className="text-lg font-semibold text-paper-100">{strategyLimit}</p>
          </div>
          <div className="rounded-lg bg-ink-800/50 p-3">
            <p className="text-xs text-paper-500 font-mono">Hedef</p>
            <p className="text-lg font-semibold text-paper-100">{goalLimit}</p>
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      <section className="rounded-xl border border-ink-800 bg-ink-900 p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400/40 to-transparent" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">Plan Karşılaştırması</h2>
          <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-0.5">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition ${
                  billing === b ? "bg-ink-700 text-paper-100" : "text-paper-500 hover:text-paper-300"
                }`}
              >
                {b === "monthly" ? "Aylık" : "Yıllık"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {(["free", "pro", "premium"] as Plan[]).map((p) => {
            const isCurrent = p === plan;
            const info = PLAN_INFO[p];
            const limits = PLAN_LIMITS[p];
            return (
              <div
                key={p}
                className={`rounded-xl border p-4 transition ${
                  isCurrent
                    ? "border-mint-500/30 bg-mint-500/5"
                    : "border-ink-700 bg-ink-800/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${info.color}`}>{info.label}</h3>
                    <span className="text-sm text-paper-400">{info.price[billing]}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-mint-500/20 text-mint-400 px-2 py-0.5 rounded-full border border-mint-500/30">
                        Aktif
                      </span>
                    )}
                  </div>
                  {!isCurrent && p !== "free" && (
                    <button
                      onClick={() => handleUpgrade(p)}
                      disabled={loading !== null}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                        p === "pro"
                          ? "bg-mint-500 text-ink-950 hover:bg-mint-400"
                          : "bg-amber-400 text-ink-950 hover:bg-amber-300"
                      } disabled:opacity-40`}
                    >
                      {loading === p ? "Yönlendiriliyor..." : `Yükselt`}
                    </button>
                  )}
                  {!isCurrent && p === "free" && plan !== "free" && (
                    <span className="text-xs text-paper-500">Mevcut planın ücretsizden yüksek</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-paper-500">
                  <span>Trade: {limits.trades === Infinity ? "∞" : limits.trades}</span>
                  <span>Strateji: {limits.strategies === Infinity ? "∞" : limits.strategies}</span>
                  <span>Hedef: {limits.goals === Infinity ? "∞" : limits.goals}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="rounded-xl border border-ink-800 bg-ink-900 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-paper-500/30 to-transparent" />
        <h2 className="font-display text-base font-semibold mb-3">Sık Sorulan Sorular</h2>
        <div className="space-y-4 text-sm text-paper-400">
          <div>
            <p className="font-medium text-paper-200 mb-1">Nasıl iptal ederim?</p>
            <p>Aboneliğini dilediğin zaman &quot;Aboneliği Yönet&quot; butonundan iptal edebilirsin. İptal sonrası mevcut dönemin sonuna kadar hizmet almaya devam edersin.</p>
          </div>
          <div>
            <p className="font-medium text-paper-200 mb-1">Plan değiştirebilir miyim?</p>
            <p>Herhangi bir zamanda Pro veya Premium plana yükseltebilirsin. Fark otomatik olarak hesaplanır.</p>
          </div>
          <div>
            <p className="font-medium text-paper-200 mb-1">İade politikası nedir?</p>
            <p>
              Tüm ödemeler <span className="text-paper-300">Creem</span> tarafından işlenir. İade ve iptal taleplerin için <Link href="https://creem.io" target="_blank" rel="noopener noreferrer" className="text-mint-400 hover:underline">Creem</Link> destek ekibiyle iletişime geçebilirsin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
