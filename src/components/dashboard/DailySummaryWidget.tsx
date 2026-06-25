"use client";

import { Trade } from "@/lib/types";
import { startOfDay, endOfDay, parseISO, isWithinInterval } from "date-fns";

interface Props {
  trades: Trade[];
}

export default function DailySummaryWidget({ trades }: Props) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const todayTrades = trades.filter((t) =>
    isWithinInterval(parseISO(t.entryDate), { start: dayStart, end: dayEnd })
  );

  const total = todayTrades.length;
  const wins = todayTrades.filter((t) => t.result > 0).length;
  const losses = todayTrades.filter((t) => t.result < 0).length;
  const totalPnl = todayTrades.reduce((s, t) => s + t.netPnl, 0);
  const best = todayTrades.reduce((best, t) => (t.result > (best?.result ?? -Infinity) ? t : best), null as Trade | null);
  const worst = todayTrades.reduce((worst, t) => (t.result < (worst?.result ?? Infinity) ? t : worst), null as Trade | null);

  if (total === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-paper-500">Bugün henüz işlem yok.</p>
        <p className="text-xs text-paper-600 mt-1">Yeni bir işlem eklemek için Trade Defteri sayfasına git.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-paper-400">Toplam</span>
        <span className="font-mono font-semibold text-paper-100">{total}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-paper-400">Kazanç / Kayıp</span>
        <span className="font-mono">
          <span className="text-mint-400 font-semibold">{wins}K</span>
          <span className="text-paper-500 mx-1">/</span>
          <span className="text-coral-400 font-semibold">{losses}Z</span>
        </span>
      </div>
      <div className="pt-2 border-t border-ink-800 flex items-center justify-between text-sm">
        <span className="text-paper-300 font-medium">Günlük P&L</span>
        <span className={`font-mono font-bold text-base ${totalPnl >= 0 ? "text-mint-400" : "text-coral-400"}`}>
          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
        </span>
      </div>

      {(best || worst) && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {best && (
            <div className="rounded-lg bg-mint-500/5 border border-mint-500/20 p-2">
              <p className="text-[10px] font-mono text-mint-400/70 uppercase tracking-wide">En iyi</p>
              <p className="text-sm font-semibold text-mint-400">+{best.result}%</p>
              <p className="text-[10px] font-mono text-paper-500">{best.pair}</p>
            </div>
          )}
          {worst && (
            <div className="rounded-lg bg-coral-500/5 border border-coral-500/20 p-2">
              <p className="text-[10px] font-mono text-coral-400/70 uppercase tracking-wide">En kötü</p>
              <p className="text-sm font-semibold text-coral-400">{worst.result}%</p>
              <p className="text-[10px] font-mono text-paper-500">{worst.pair}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
