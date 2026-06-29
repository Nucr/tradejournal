"use client";

import Link from "next/link";

export default function PaymentSuccessPage() {
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
