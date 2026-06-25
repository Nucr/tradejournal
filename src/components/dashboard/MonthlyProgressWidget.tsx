"use client";

import { Trade } from "@/lib/types";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";

interface Props {
  trades: Trade[];
}

export default function MonthlyProgressWidget({ trades }: Props) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthTrades = trades.filter((t) =>
    isWithinInterval(parseISO(t.entryDate), { start: monthStart, end: monthEnd })
  );

  const total = monthTrades.length;
  const wins = monthTrades.filter((t) => t.result > 0).length;
  const losses = monthTrades.filter((t) => t.result < 0).length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const totalPnl = monthTrades.reduce((s, t) => s + t.netPnl, 0);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-paper-400">Ayın {dayOfMonth}. günü</span>
          <span className="font-mono text-paper-500">{monthProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-mint-500 transition-all"
            style={{ width: `${monthProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-ink-950/50 p-3 text-center">
          <p className="text-2xl font-mono font-bold text-paper-100">{total}</p>
          <p className="text-[11px] font-mono text-paper-500 uppercase tracking-wide">İşlem</p>
        </div>
        <div className="rounded-lg bg-ink-950/50 p-3 text-center">
          <p className={`text-2xl font-mono font-bold ${winRate >= 50 ? "text-mint-400" : "text-coral-400"}`}>
            {winRate.toFixed(0)}%
          </p>
          <p className="text-[11px] font-mono text-paper-500 uppercase tracking-wide">Win Rate</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-paper-400">Kazanç</span>
        <span className="font-mono text-mint-400 font-semibold">{wins}</span>
      </div>
      <div className="flex items-center justify-between text-sm -mt-2">
        <span className="text-paper-400">Kayıp</span>
        <span className="font-mono text-coral-400 font-semibold">{losses}</span>
      </div>
      <div className="pt-2 border-t border-ink-800 flex items-center justify-between text-sm">
        <span className="text-paper-300 font-medium">Net P&L</span>
        <span className={`font-mono font-bold ${totalPnl >= 0 ? "text-mint-400" : "text-coral-400"}`}>
          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
