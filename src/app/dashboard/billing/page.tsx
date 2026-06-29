"use client";

import { useAuth } from "@/lib/auth-context";
import { usePlan, PLAN_LIMITS, PLAN_ORDER } from "@/lib/features";
import type { Plan } from "@/lib/features";
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PLAN_INFO: Record<Plan, { label: string; price: Record<string, string>; color: string; gradient: string; icon: string }> = {
  free: {
    label: "Free", price: { monthly: "$0", yearly: "$0" },
    color: "text-paper-400", gradient: "from-paper-500/10 to-transparent",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  pro: {
    label: "Pro", price: { monthly: "$9/ay", yearly: "$7/ay" },
    color: "text-mint-400", gradient: "from-mint-500/15 to-transparent",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  premium: {
    label: "Premium", price: { monthly: "$19/ay", yearly: "$15/ay" },
    color: "text-amber-400", gradient: "from-amber-400/15 to-transparent",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
};

export default function BillingPage() {
  const { user } = useAuth();
  const { plan, getLimit } = usePlan();
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [creemCustomerId, setCreemCustomerId] = useState<string | null>(null);
  const [creemCheckoutId, setCreemCheckoutId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const sub = snap.data()?.subscription ?? {};
        setCreemCustomerId(sub.creemCustomerId ?? null);
        setCreemCheckoutId(sub.creemCheckoutId ?? null);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!creemCustomerId) {
      try {
        const raw = sessionStorage.getItem("creem_checkout");
        if (raw) {
          const meta = JSON.parse(raw);
          if (meta?.customerId) setCreemCustomerId(meta.customerId);
        }
      } catch {}
    }
  }, [creemCustomerId]);

  const currentPlan = PLAN_INFO[plan];

  const fadeIn = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
  });

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
        body: JSON.stringify({ plan: targetPlan, billing, email: user?.email }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        sessionStorage.setItem("creem_checkout", JSON.stringify({ plan: targetPlan, uid: user?.uid, checkoutId: data.checkoutId }));
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
      let cid = creemCustomerId;
      if (!cid && creemCheckoutId) {
        const lookupRes = await fetch("/api/creem/lookup-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutId: creemCheckoutId }),
        });
        const lookupData = await lookupRes.json();
        cid = lookupData.customerId || null;
        if (cid) {
          const { doc: fDoc, setDoc: fSetDoc } = await import("firebase/firestore");
          const { db: fDb } = await import("@/lib/firebase");
          await fSetDoc(fDoc(fDb, "users", user!.uid), {
            subscription: { creemCustomerId: cid },
          }, { merge: true });
          setCreemCustomerId(cid);
        }
      }
      const res = await fetch("/api/creem/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.uid}`,
        },
        body: JSON.stringify({ creemCustomerId: cid, checkoutId: creemCheckoutId }),
      });

      const data = await res.json();
      if (data.portalUrl) {
        window.open(data.portalUrl, "_blank", "noopener,noreferrer");
        setPortalLoading(false);
        return;
      } else {
        alert("Abonelik yönetim sayfası açılamadı. Lütfen Creem.io dashboard üzerinden yönetin veya destek ile iletişime geçin.");
      }
    } catch {
      alert("Portal açılırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.");
    } finally {
      setPortalLoading(false);
    }
  }

  const planLimits = PLAN_LIMITS[plan];
  const tradeLimit = planLimits?.trades === Infinity ? "Sınırsız" : planLimits?.trades ?? 0;
  const strategyLimit = planLimits?.strategies === Infinity ? "Sınırsız" : planLimits?.strategies ?? 0;
  const goalLimit = planLimits?.goals === Infinity ? "Sınırsız" : planLimits?.goals ?? 0;

  const planFeatures: Record<Plan, string[]> = {
    free: ["3 trade kaydı", "1 strateji", "1 hedef", "Temel analitik"],
    pro: ["1.000 trade", "5 strateji", "Sınırsız hedef", "Gelişmiş analitik", "CSV içe aktarma", "Takvim görünümü", "Tema özelleştirme"],
    premium: ["Sınırsız trade", "Sınırsız strateji", "Sınırsız hedef", "API erişimi", "PDF/CSV dışa aktarma", "Öncelikli destek", "Strateji görselleri"],
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div style={fadeIn(0)} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint-500/20 to-amber-500/20 border border-mint-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-950 dark:text-paper-100">Abonelik</h1>
            <p className="text-sm text-ink-500 dark:text-paper-500">Planını görüntüle, yükselt veya yönet.</p>
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      <section style={fadeIn(1)} className="relative mb-8 group">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-mint-500/30 via-transparent to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative rounded-2xl border border-surface-200 dark:border-ink-700 bg-gradient-to-br from-surface-50 via-white to-surface-50 dark:from-ink-900 dark:via-ink-950 dark:to-ink-900 p-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-mint-500/60 via-amber-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-mint-500/5 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan === "free" ? "from-paper-500/10 to-paper-500/5" : plan === "pro" ? "from-mint-500/20 to-mint-500/5" : "from-amber-400/20 to-amber-400/5"} border ${plan === "free" ? "border-paper-500/20" : plan === "pro" ? "border-mint-500/20" : "border-amber-400/20"} flex items-center justify-center`}>
                  <svg className={`w-6 h-6 ${currentPlan.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={currentPlan.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-ink-500 dark:text-paper-500 font-mono uppercase tracking-wider mb-0.5">Mevcut Plan</p>
                  <div className="flex items-center gap-3">
                    <h2 className={`font-display text-2xl font-bold ${currentPlan.color}`}>
                      {currentPlan.label}
                    </h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${plan === "free" ? "bg-surface-200 text-ink-700 dark:bg-ink-700 dark:text-paper-300" : plan === "pro" ? "bg-mint-500/20 text-mint-400 border border-mint-500/30" : "bg-amber-400/20 text-amber-400 border border-amber-400/30"}`}>
                      {currentPlan.price[billing]}
                    </span>
                  </div>
                </div>
              </div>
              {plan !== "free" && (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="group/btn relative px-5 py-2.5 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-mint-500 to-mint-400 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative text-ink-950 flex items-center gap-2">
                    {portalLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Açılıyor...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Aboneliği Yönet
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Trade", value: tradeLimit, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "from-mint-500/20 to-mint-500/5", border: "border-mint-500/20" },
                { label: "Strateji", value: strategyLimit, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color2: "from-amber-400/20 to-amber-400/5", border2: "border-amber-400/20" },
                { label: "Hedef", value: goalLimit, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color2: "from-paper-500/20 to-paper-500/5", border2: "border-paper-500/20" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="group/stat relative rounded-xl border border-surface-200 dark:border-ink-700 bg-surface-100/50 dark:bg-ink-800/50 p-4 hover:border-surface-100 dark:hover:border-ink-600 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${i === 0 ? stat.color : i === 1 ? stat.color2 : stat.color2} border ${i === 0 ? stat.border : i === 1 ? stat.border2 : stat.border2} flex items-center justify-center`}>
                      <svg className={`w-4 h-4 ${i === 0 ? "text-mint-400" : i === 1 ? "text-amber-400" : "text-ink-600 dark:text-paper-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-500 dark:text-paper-500 font-mono uppercase tracking-wider">{stat.label}</p>
                      <p className="text-lg font-bold text-ink-950 dark:text-paper-100">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      <section style={fadeIn(2)} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-mint-500/20 border border-amber-400/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-ink-950 dark:text-paper-100">Plan Karşılaştırması</h2>
          </div>
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-ink-800 rounded-xl p-1 border border-surface-200 dark:border-ink-700">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative text-xs font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                  billing === b
                    ? "bg-surface-200 text-ink-950 dark:bg-ink-700 dark:text-paper-100 shadow-lg"
                    : "text-ink-500 dark:text-paper-500 hover:text-ink-700 dark:hover:text-paper-300"
                }`}
              >
                {billing === b && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-surface-300 to-surface-200 dark:from-ink-600 dark:to-ink-700 animate-pulse" style={{ opacity: 0.1 }} />
                )}
                <span className="relative">{b === "monthly" ? "Aylık" : "Yıllık"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {(["free", "pro", "premium"] as Plan[]).map((p, idx) => {
            const isCurrent = p === plan;
            const info = PLAN_INFO[p];
            const limits = PLAN_LIMITS[p];
            const features = planFeatures[p];

            return (
              <div
                key={p}
                className={`group relative rounded-2xl border transition-all duration-500 ${
                  isCurrent
                    ? "border-mint-500/40 bg-gradient-to-br from-mint-500/[0.08] to-surface-50 dark:to-ink-900"
                    : "border-surface-200 dark:border-ink-700 bg-surface-50/50 dark:bg-ink-900/50 hover:border-surface-100 dark:hover:border-ink-600"
                }`}
                style={{
                  transitionDelay: `${idx * 0.05}s`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + idx * 0.08}s`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p === "free" ? "from-paper-500/10 to-paper-500/5" : p === "pro" ? "from-mint-500/20 to-mint-500/5" : "from-amber-400/20 to-amber-400/5"} border ${p === "free" ? "border-paper-500/20" : p === "pro" ? "border-mint-500/20" : "border-amber-400/20"} flex items-center justify-center`}>
                        <svg className={`w-5 h-5 ${info.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={info.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className={`font-bold text-base ${info.color}`}>{info.label}</h3>
                          <span className="text-sm text-ink-600 dark:text-paper-400 font-medium">{info.price[billing]}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-mint-500/20 text-mint-400 px-2 py-0.5 rounded-full border border-mint-500/30">
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isCurrent && p !== "free" && PLAN_ORDER[p] > PLAN_ORDER[plan] && (
                      <button
                        onClick={() => handleUpgrade(p)}
                        disabled={loading !== null}
                        className="group/btn relative px-5 py-2 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
                      >
                        <div className={`absolute inset-0 transition-opacity ${
                          p === "pro" ? "bg-gradient-to-r from-mint-500 to-mint-400" : "bg-gradient-to-r from-amber-400 to-amber-300"
                        } opacity-90 group-hover/btn:opacity-100`} />
                        <span className="relative text-ink-950 flex items-center gap-1.5">
                          {loading === p ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Yönlendiriliyor...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Yükselt
                            </>
                          )}
                        </span>
                      </button>
                    )}

                    {!isCurrent && p !== "free" && PLAN_ORDER[p] < PLAN_ORDER[plan] && (
                      <button
                        onClick={() => handleUpgrade(p)}
                        disabled={loading !== null}
                        className="group/btn relative px-5 py-2 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-surface-400 to-surface-300 dark:from-ink-600 dark:to-ink-700 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
                        <span className="relative text-ink-800 dark:text-paper-200 flex items-center gap-1.5">
                          {loading === p ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Yönlendiriliyor...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Düşür
                            </>
                          )}
                        </span>
                      </button>
                    )}

                    {!isCurrent && p === "free" && plan !== "free" && (
                      <span className="text-xs text-ink-500 dark:text-paper-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Aktif planda
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {features.map((f) => (
                      <span key={f} className="text-[11px] text-ink-500 dark:text-paper-500 bg-surface-100/50 dark:bg-ink-800/50 px-2 py-1 rounded-md border border-surface-200/50 dark:border-ink-700/50">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={fadeIn(3)} className="relative rounded-2xl border border-surface-200 dark:border-ink-700 bg-surface-50/50 dark:bg-ink-900/50 p-6 overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-paper-500/30 via-mint-500/20 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-bl from-paper-500/5 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-paper-500/10 to-mint-500/10 border border-paper-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-ink-600 dark:text-paper-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="font-display text-base font-bold text-ink-950 dark:text-paper-100">Sık Sorulan Sorular</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "Nasıl iptal ederim?", a: "Aboneliğini dilediğin zaman \"Aboneliği Yönet\" butonundan iptal edebilirsin. İptal sonrası mevcut dönemin sonuna kadar hizmet almaya devam edersin." },
              { q: "Plan değiştirebilir miyim?", a: "İstediğin zaman Pro veya Premium plana yükseltebilir ya da daha düşük bir plana geçebilirsin. Fark otomatik olarak hesaplanır." },
              { q: "İade politikası nedir?", a: <>Tüm ödemeler <span className="text-ink-700 dark:text-paper-300 font-medium">Creem</span> tarafından işlenir. İade ve iptal taleplerin için <Link href="https://creem.io" target="_blank" rel="noopener noreferrer" className="text-mint-400 hover:text-mint-300 underline underline-offset-2 transition-colors">Creem</Link> destek ekibiyle iletişime geçebilirsin.</> },
            ].map((faq, i) => (
              <div
                key={i}
                className="group/faq rounded-xl border border-surface-200/50 dark:border-ink-700/50 bg-surface-100/30 dark:bg-ink-800/30 p-4 hover:border-surface-100/50 dark:hover:border-ink-600/50 transition-all duration-300"
              >
                <p className="font-medium text-ink-800 dark:text-paper-200 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint-500/60 group-hover/faq:bg-mint-400 transition-colors" />
                  {faq.q}
                </p>
                <p className="text-sm text-ink-500 dark:text-paper-500 leading-relaxed pl-[14px]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
