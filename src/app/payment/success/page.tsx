"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

function getCheckoutMeta() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("creem_checkout");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const PLAN_FEATURES: Record<string, { icon: string; label: string }[]> = {
  pro: [
    { icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", label: "1.000 işlem kaydı" },
    { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Gelişmiş analitik & grafikler" },
    { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Takvim görünümü" },
    { icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", label: "CSV içe aktarma" },
    { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Mesajlaşma & gruplar" },
    { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", label: "5 strateji, sınırsız hedef" },
    { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "Tema rengi özelleştirme" },
  ],
  premium: [
    { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", label: "Sınırsız işlem kaydı" },
    { icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "PDF/CSV dışa aktarma" },
    { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Strateji görselleri" },
    { icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "API erişimi" },
    { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Sınırsız strateji" },
    { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Öncelikli destek" },
  ],
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"updating" | "success" | "error">("updating");
  const [plan, setPlan] = useState<string>("");
  const [countdown, setCountdown] = useState(4);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    const planParam = searchParams.get("plan");
    const meta = getCheckoutMeta();
    const detectedPlan = planParam || meta?.plan || "";
    setPlan(detectedPlan);

    if (!detectedPlan) {
      setStatus("success");
      return;
    }

    async function writePlan(userId: string) {
      doneRef.current = true;
      try {
        const fbUser = auth.currentUser;
        const displayName = fbUser?.displayName ?? fbUser?.email?.split("@")[0] ?? "Trader";
        const email = fbUser?.email ?? "";
        let customerId = searchParams.get("customer_id") || searchParams.get("customerId") || meta?.customerId || "";
        let checkoutId = searchParams.get("checkout_id") || meta?.checkoutId || "";
        if (!customerId && checkoutId) {
          try {
            const lookupRes = await fetch("/api/creem/lookup-checkout", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ checkoutId }),
            });
            const lookupData = await lookupRes.json();
            if (lookupData.customerId) customerId = lookupData.customerId;
          } catch {}
        }
        const subscription = {
          plan: detectedPlan,
          status: "active" as const,
          updatedAt: new Date(),
        } as Record<string, unknown>;
        if (customerId) subscription.creemCustomerId = customerId;
        if (checkoutId) subscription.creemCheckoutId = checkoutId;
        await setDoc(
          doc(db, "users", userId),
          { displayName, email, subscription },
          { merge: true },
        );
        sessionStorage.removeItem("creem_checkout");
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      writePlan(currentUser.uid);
      return;
    }

    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        unsub();
        writePlan(user.uid);
      }
    });

    const timer = setTimeout(() => {
      unsub();
      setStatus("error");
    }, 10000);

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [searchParams]);

  useEffect(() => {
    if (status !== "success") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, router]);

  if (status === "updating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-paper-400 text-sm">Plan aktifleştiriliyor...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-coral-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">Plan Güncellenemedi</h1>
          <p className="text-sm text-paper-400 mb-6">Ödemen alındı ancak planın güncellenirken hata oluştu. Lütfen Abonelik Sayfasına gidip sayfayı yenile.</p>
          <Link
            href="/dashboard/billing"
            className="inline-block rounded-lg bg-mint-500 text-ink-950 font-semibold px-6 py-2.5 text-sm hover:bg-mint-400 transition"
          >
            Abonelik Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  const features = PLAN_FEATURES[plan] ?? [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 py-12">
      <div className="w-full max-w-lg px-6">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-mint-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">Ödeme Başarılı!</h1>
          <p className="text-sm text-paper-400">
            <span className="capitalize">{plan}</span> planın aktif. Tüm özelliklere erişebilirsin.
          </p>
        </div>

        {features.length > 0 && (
          <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-5 mb-6">
            <h2 className="text-sm font-semibold text-paper-200 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Yeni Açılan Özellikler
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                  <span className="text-sm text-paper-300">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-paper-500 mb-5">
            {countdown > 0 ? `${countdown} saniye içinde Dashboard'a yönlendirileceksin...` : "Yönlendiriliyor..."}
          </p>
          {countdown > 0 && (
            <div className="mx-auto mb-5 w-48 h-1 bg-ink-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-mint-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 4) * 100}%` }}
              />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/billing"
              className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-5 py-2.5 text-sm hover:bg-mint-400 transition"
            >
              Abonelik Sayfası
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-ink-700 text-paper-300 px-5 py-2.5 text-sm hover:bg-ink-800 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
