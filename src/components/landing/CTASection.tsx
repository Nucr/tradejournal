import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-mint-500/20 bg-gradient-to-br from-mint-500/5 to-ink-900/80 px-8 py-16 text-center">
          <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100 mb-3">
              Hemen Başla, Ücretsiz
            </h2>
            <p className="text-paper-300 max-w-md mx-auto mb-8">
              Kredi kartı gerekmez. 30 saniyede kaydol, işlemlerini kaydetmeye
              ve performansını analiz etmeye başla.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-mint-500 px-8 py-3.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition hover:scale-105 active:scale-100"
              >
                Ücretsiz Kaydol
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-ink-700 px-8 py-3.5 text-sm font-medium text-paper-300 hover:bg-ink-800 hover:text-paper-100 transition"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
