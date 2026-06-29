"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
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

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"updating" | "success" | "error">("updating");
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    const planParam = searchParams.get("plan");
    const requestId = searchParams.get("request_id");
    const meta = getCheckoutMeta();
    const plan = planParam || meta?.plan || "";
    const uid = requestId || meta?.uid || "";

    if (!plan) {
      setStatus("success");
      return;
    }

    async function writePlan(userId: string) {
      doneRef.current = true;
      try {
        await setDoc(
          doc(db, "users", userId),
          {
            subscription: {
              plan,
              status: "active",
              updatedAt: new Date(),
            },
          },
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
      if (uid && uid.length > 0) {
        writePlan(uid);
      } else {
        setStatus("error");
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [searchParams]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-mint-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">Ödeme Başarılı!</h1>
        <p className="text-sm text-paper-400 mb-2">Planın aktifleştirildi. Tüm özelliklere erişebilirsin.</p>
        <p className="text-xs text-paper-500 mb-8">Sayfa yönlendiriliyor...</p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard/billing"
            className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-6 py-2.5 text-sm hover:bg-mint-400 transition"
          >
            Abonelik Sayfası
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-ink-700 text-paper-300 px-6 py-2.5 text-sm hover:bg-ink-800 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
