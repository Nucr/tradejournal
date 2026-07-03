"use client";

import { AdvancedStats } from "./utils";

interface Props {
  stats: AdvancedStats;
  tradeCount: number;
}

export default function ExecutiveSummary({ stats, tradeCount }: Props) {
  const cards = [
    {
      label: "Profit Factor",
      value: stats.profitFactor >= 99 ? "∞" : stats.profitFactor.toFixed(2),
      tone: stats.profitFactor >= 1.5 ? "mint" : stats.profitFactor >= 1 ? "amber" : "coral",
      hint: "Brüt Kâr / Brüt Zarar",
    },
    {
      label: "Ort. Kazanan",
      value: `$${stats.avgWin.toFixed(2)}`,
      tone: "mint",
      hint: `${tradeCount > 0 ? ((stats.grossProfit / (stats.grossProfit + stats.grossLoss)) * 100).toFixed(1) : 0}% kâr katkısı`,
    },
    {
      label: "Ort. Kaybeden",
      value: `$${stats.avgLoss.toFixed(2)}`,
      tone: "coral",
      hint: `Ortalamanın ${stats.payoffRatio > 0 ? `${stats.payoffRatio.toFixed(2)}x` : "—"} büyüklüğünde`,
    },
    {
      label: "Payoff Ratio",
      value: stats.payoffRatio >= 99 ? "∞" : stats.payoffRatio.toFixed(2),
      tone: stats.payoffRatio >= 2 ? "mint" : stats.payoffRatio >= 1 ? "amber" : "coral",
      hint: "Avg Win / Avg Loss",
    },
    {
      label: "En Büyük Kazanç",
      value: `$${stats.largestWin.toFixed(2)}`,
      tone: "mint",
    },
    {
      label: "En Büyük Kayıp",
      value: `$${Math.abs(stats.largestLoss).toFixed(2)}`,
      tone: "coral",
    },
  ];

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
        Performans Özeti
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition"
          >
            <p className="text-[11px] font-mono uppercase tracking-wide text-paper-500 mb-2 leading-tight">
              {c.label}
            </p>
            <p
              className={`font-display text-xl font-semibold font-mono ${
                c.tone === "mint"
                  ? "text-accent"
                  : c.tone === "coral"
                  ? "text-coral-400"
                  : "text-amber-400"
              }`}
            >
              {c.value}
            </p>
            {c.hint && (
              <p className="text-[11px] font-mono text-paper-500 mt-1">{c.hint}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
