"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-ink-700 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-paper-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">Ödeme İptal Edildi</h1>
        <p className="text-sm text-paper-400 mb-6">Herhangi bir ödeme yapılmadı. İstediğin zaman tekrar deneyebilirsin.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/#pricing"
            className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-6 py-2.5 text-sm hover:bg-mint-400 transition"
          >
            Planlara Göz At
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
