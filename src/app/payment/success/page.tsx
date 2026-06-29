"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const checkoutId = searchParams.get("checkout_id");
    const orderId = searchParams.get("order_id");
    const customerId = searchParams.get("customer_id");
    const productId = searchParams.get("product_id");
    const requestId = searchParams.get("request_id");
    const signature = searchParams.get("signature");

    if (signature) {
      fetch("/api/creem/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout_id: checkoutId,
          order_id: orderId,
          customer_id: customerId,
          product_id: productId,
          request_id: requestId,
          signature,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) {
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    } else {
      setTimeout(() => setStatus("success"), 1500);
    }
  }, [searchParams]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-paper-400 text-sm">Ödeme doğrulanıyor...</p>
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
          <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">Doğrulama Başarısız</h1>
          <p className="text-sm text-paper-400 mb-6">Ödeme işleminiz tamamlanmış olabilir. Sorun yaşarsanız destek ile iletişime geçin.</p>
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
