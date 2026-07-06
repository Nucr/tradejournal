"use client";

import { TradeStats } from "@/lib/date-utils";
import { AdvancedStats } from "./utils";

interface Props {
  stats: TradeStats;
  advanced: AdvancedStats;
  tradeCount: number;
}

export default function DetailedMetricsTable({ stats, advanced, tradeCount }: Props) {
  const rows = [
    { label: "Toplam İşlem", value: String(stats.total) },
    { label: "Kazanan", value: String(stats.wins), sub: `${stats.wins > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}%` },
    { label: "Kaybeden", value: String(stats.losses), sub: `${stats.losses > 0 ? ((stats.losses / stats.total) * 100).toFixed(1) : 0}%` },
    { label: "Başabaş", value: String(stats.breakeven) },
    { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%` },
    { label: "Profit Factor", value: advanced.profitFactor >= 99 ? "∞" : advanced.profitFactor.toFixed(2) },
    { label: "Gross P&L", value: `$${advanced.grossProfit.toFixed(2)}`, tone: "mint" },
    { label: "Gross Loss", value: `($${advanced.grossLoss.toFixed(2)})`, tone: "coral" },
    { label: "Net P&L ($)", value: `${stats.totalNetPnl >= 0 ? "+" : ""}$${stats.totalNetPnl.toFixed(2)}`, tone: stats.totalNetPnl >= 0 ? "mint" : "coral" },
    { label: "Net P&L (%)", value: `${stats.totalResult >= 0 ? "+" : ""}${stats.totalResult.toFixed(2)}%`, tone: stats.totalResult >= 0 ? "mint" : "coral" },
    { label: "Ortalama RR", value: `${stats.avgRR.toFixed(2)}R` },
    { label: "Toplam RR", value: `${stats.totalRR >= 0 ? "+" : ""}${stats.totalRR.toFixed(1)}R` },
    { label: "Payoff Ratio", value: advanced.payoffRatio >= 99 ? "∞" : advanced.payoffRatio.toFixed(2) },
    { label: "Ort. Kazanan", value: `$${advanced.avgWin.toFixed(2)}` },
    { label: "Ort. Kaybeden", value: `($${advanced.avgLoss.toFixed(2)})` },
    { label: "En Büyük Kazanç", value: `$${advanced.largestWin.toFixed(2)}` },
    { label: "En Büyük Kayıp", value: `($${Math.abs(advanced.largestLoss).toFixed(2)})` },
    { label: "Max Galibiyet Serisi", value: String(stats.maxWinStreak) },
    { label: "Max Mağlubiyet Serisi", value: String(stats.maxLoseStreak) },
    { label: "Güncel Seri", value: stats.currentWinStreak > 0 ? `${stats.currentWinStreak}W` : stats.currentLoseStreak > 0 ? `${stats.currentLoseStreak}L` : "—" },
    { label: "Max Drawdown", value: `${advanced.maxDrawdown.toFixed(2)}%`, tone: "coral" },
    { label: "Max Drawdown ($)", value: `($${advanced.maxDrawdownAmount.toFixed(2)})`, tone: "coral" },
    { label: "Ort. Risk/İşlem", value: `$${advanced.avgRiskPerTrade.toFixed(2)}` },
    { label: "Max Ardışık Kayıp", value: String(advanced.consecutiveLosses), tone: "coral" },
  ];

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
        Detaylı Metrikler
      </h2>
      <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-800 bg-ink-950/50">
                <th className="text-left px-4 py-2.5 text-[11px] font-mono uppercase tracking-wide text-paper-500">Metrik</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-mono uppercase tracking-wide text-paper-500">Değer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.label}
                  className={`border-b border-ink-800/50 hover:bg-ink-800/30 transition ${
                    i % 2 === 0 ? "bg-transparent" : "bg-ink-950/20"
                  }`}
                >
                  <td className="px-4 py-2 text-paper-300 font-mono text-xs">{r.label}</td>
                  <td
                    className={`px-4 py-2 text-right font-mono text-xs font-semibold ${
                      r.tone === "mint"
                        ? "text-accent"
                        : r.tone === "coral"
                        ? "text-coral-400"
                        : "text-paper-100"
                    }`}
                  >
                    {r.value}
                    {r.sub && (
                      <span className="ml-1.5 text-paper-500 font-normal">{r.sub}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
