"use client";

const TICKER = [
  { pair: "EURUSD", rr: "+2.4R", up: true },
  { pair: "XAUUSD", rr: "+1.1R", up: true },
  { pair: "BTCUSD", rr: "-1.0R", up: false },
  { pair: "GBPJPY", rr: "+3.2R", up: true },
  { pair: "NAS100", rr: "BE", up: null },
];

export default function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 bg-ink-900 border-r border-ink-800 px-12 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

      <div className="relative z-10">
        <span className="font-display text-2xl font-bold tracking-tight">
          Verifter
        </span>
        <p className="mt-1 text-sm text-paper-300 font-mono">
          trade journal &amp; performans defteri
        </p>
      </div>

      <div className="relative z-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-paper-500 font-mono mb-4">
          son kayıtlar
        </p>
        {TICKER.map((t) => (
          <div
            key={t.pair}
            className="flex items-center justify-between border-b border-ink-800 pb-3 font-mono text-sm"
          >
            <span className="text-paper-100">{t.pair}</span>
            <span
              className={
                t.up === true
                  ? "text-mint-400"
                  : t.up === false
                  ? "text-coral-400"
                  : "text-amber-400"
              }
            >
              {t.rr}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <p className="text-sm text-paper-300 max-w-sm leading-relaxed">
          Her işlemin ekran görüntüsü, RR'ı ve stratejisiyle tek bir deftere
          işlenir. Günlük, haftalık, aylık ve yıllık performansını tek
          bakışta gör.
        </p>
      </div>
    </div>
  );
}
