"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 md:py-40 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint-500/20 bg-mint-500/5 px-4 py-1.5 text-xs font-mono text-mint-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
            10.000+ işlem kaydedildi
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-paper-100">
            İşlemlerini Kaydet,
            <br />
            <span className="text-mint-400">Performansını Analiz Et</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-paper-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Ekran görüntüsü, strateji ve RR ile her işlemini tek bir deftere kaydet.
            Günlük, haftalık, aylık performansını interaktif grafiklerle takip et.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              href="/register"
              className="rounded-lg bg-mint-500 px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition hover:scale-105 active:scale-100"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-ink-700 px-6 py-3 text-sm font-medium text-paper-300 hover:bg-ink-800 hover:text-paper-100 transition"
            >
              Giriş Yap
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg animate-fade-in-up">
          <div className="relative">
            <div className="absolute -inset-4 bg-mint-500/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-card overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-coral-500" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-mint-500" />
                <span className="ml-2 text-xs font-mono text-paper-500">Ledger — Pano</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-ink-800/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-mint-500/20 flex items-center justify-center text-xs font-bold text-mint-400">
                      BTC
                    </div>
                    <div>
                      <p className="text-sm font-medium text-paper-100">BTCUSD</p>
                      <p className="text-xs text-paper-500">Long • 2.4R</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-mint-400">+$1,240</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-ink-800/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-400/20 flex items-center justify-center text-xs font-bold text-amber-400">
                      XAU
                    </div>
                    <div>
                      <p className="text-sm font-medium text-paper-100">XAUUSD</p>
                      <p className="text-xs text-paper-500">Short • 1.1R</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-mint-400">+$380</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-ink-800/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-coral-500/20 flex items-center justify-center text-xs font-bold text-coral-400">
                      EUR
                    </div>
                    <div>
                      <p className="text-sm font-medium text-paper-100">EURUSD</p>
                      <p className="text-xs text-paper-500">Long • 0.8R</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-coral-400">-$210</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-ink-800/30 p-4">
                <div className="flex items-center justify-between text-xs text-paper-500 mb-2">
                  <span>Haftalık Performans</span>
                  <span className="text-mint-400">+12.4%</span>
                </div>
                <div className="h-12 flex items-end gap-1">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-mint-500/60 transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
