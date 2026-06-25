"use client";

import { Trade } from "@/lib/types";
import { subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";

interface Props {
  trades: Trade[];
}

export default function PeriodComparisonWidget({ trades }: Props) {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const thisMonth = trades.filter((t) =>
    isWithinInterval(parseISO(t.entryDate), { start: thisMonthStart, end: thisMonthEnd })
  );
  const lastMonth = trades.filter((t) =>
    isWithinInterval(parseISO(t.entryDate), { start: lastMonthStart, end: lastMonthEnd })
  );

  const thisStats = {
    total: thisMonth.length,
    wins: thisMonth.filter((t) => t.result > 0).length,
    totalPnl: thisMonth.reduce((s, t) => s + t.netPnl, 0),
    totalResult: thisMonth.reduce((s, t) => s + t.result, 0),
  };
  const lastStats = {
    total: lastMonth.length,
    wins: lastMonth.filter((t) => t.result > 0).length,
    totalPnl: lastMonth.reduce((s, t) => s + t.netPnl, 0),
    totalResult: lastMonth.reduce((s, t) => s + t.result, 0),
  };

  const delta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+∞" : current === 0 ? "0" : "-∞";
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
  };

  const Row = ({ label, current, previous }: { label: string; current: number; previous: number }) => {
    const d = delta(current, previous);
    const isPositive = current >= previous;
    return (
      <div className="flex items-center justify-between py-1.5 text-sm">
        <span className="text-paper-400">{label}</span>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-paper-100 font-medium">
            {typeof current === "number" && label === "Net P&L"
              ? `${current >= 0 ? "+" : ""}$${current.toFixed(2)}`
              : label === "Win Rate"
              ? `${((current / (thisStats.total || 1)) * 100).toFixed(0)}%`
              : current}
          </span>
          <span className={`text-xs ${isPositive ? "text-mint-400" : "text-coral-400"}`}>
            {d}
          </span>
        </div>
      </div>
    );
  };

  if (thisMonth.length === 0 && lastMonth.length === 0) {
    return (
      <p className="text-sm text-paper-500 text-center py-6">
        Karşılaştırma için henüz veri yok.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-paper-500 pb-2 border-b border-ink-800">
        <span>Bu Ay / Geçen Ay</span>
      </div>
      <Row label="İşlem" current={thisStats.total} previous={lastStats.total} />
      <Row label="Kazanç" current={thisStats.wins} previous={lastStats.wins} />
      <Row label="Net P&L" current={thisStats.totalPnl} previous={lastStats.totalPnl} />
    </div>
  );
}
