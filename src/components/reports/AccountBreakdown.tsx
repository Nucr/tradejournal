"use client";

import { AccountStat } from "./utils";

interface Props {
  data: AccountStat[];
}

export default function AccountBreakdown({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
        Hesap Bazında Performans
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((acc) => (
          <div
            key={acc.id}
            className="rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition"
          >
            <h3 className="font-display font-semibold text-paper-100 text-sm mb-2">
              {acc.name}
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-paper-500">İşlem</span>
                <span className="text-paper-200">{acc.stats.total}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-paper-500">Win Rate</span>
                <span className={`${acc.stats.winRate >= 50 ? "text-accent" : "text-coral-400"}`}>
                  {acc.stats.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-paper-500">Net PnL</span>
                <span className={acc.pnl >= 0 ? "text-accent" : "text-coral-400"}>
                  {acc.pnl >= 0 ? "+" : ""}${acc.pnl.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-paper-500">Ort. RR</span>
                <span className="text-paper-200">{acc.stats.avgRR.toFixed(2)}R</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
