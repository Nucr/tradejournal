"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/features";
import { PLAN_LIMITS } from "@/lib/features";
import PricingSection from "@/components/landing/PricingSection";

export default function PricingPage() {
  const { user } = useAuth();
  const { plan } = usePlan();

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Navbar */}
      <nav className="border-b border-ink-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-paper-100">
            Ledger
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-paper-500 font-mono">
              Mevcut plan: <span className="text-paper-100 font-semibold uppercase">{plan}</span>
            </span>
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-4 py-2 text-sm hover:bg-mint-400 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-ink-700 text-paper-300 px-4 py-2 text-sm hover:bg-ink-800 transition"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </nav>

      <PricingSection />
    </div>
  );
}
