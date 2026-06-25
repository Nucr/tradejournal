"use client";

import { Trade } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface Props {
  trades: Trade[];
}

export default function RecentTradesWidget({ trades }: Props) {
  const recent = [...trades]
    .sort((a, b) => (b.createdAt || b.entryDate).localeCompare(a.createdAt || a.entryDate))
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-paper-500 text-center py-6">
        Henüz işlem yok.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((t) => {
        const isWin = t.result > 0;
        const isLoss = t.result < 0;
        return (
          <div
            key={t.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-ink-950/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isWin ? "bg-mint-400" : isLoss ? "bg-coral-400" : "bg-amber-400"
              }`} />
              <span className="text-sm font-medium text-paper-100 truncate">{t.pair}</span>
              <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                t.direction === "long"
                  ? "text-mint-400 bg-mint-500/10"
                  : t.direction === "short"
                  ? "text-coral-400 bg-coral-500/10"
                  : "text-amber-400 bg-amber-400/10"
              }`}>
                {t.direction === "long" ? "L" : t.direction === "short" ? "S" : "BE"}
              </span>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className={`text-sm font-mono font-semibold ${isWin ? "text-mint-400" : isLoss ? "text-coral-400" : "text-amber-400"}`}>
                {t.result >= 0 ? "+" : ""}{t.result}%
              </span>
              <p className="text-[10px] font-mono text-paper-500">
                {format(parseISO(t.entryDate), "dd MMM")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
