"use client";

import { useMemo } from "react";
import { Trade } from "@/lib/types";
import { format, parseISO, subDays, eachDayOfInterval, isSameDay } from "date-fns";

interface Props {
  trades: Trade[];
  maxDailyTrades?: number;
}

export default function TradeFrequencyWidget({ trades, maxDailyTrades = 5 }: Props) {
  const now = new Date();
  const last14Days = eachDayOfInterval({
    start: subDays(now, 13),
    end: now,
  });

  const tradesByDay = useMemo(() => {
    const map = new Map<string, Trade[]>();
    for (const t of trades) {
      const key = format(parseISO(t.entryDate), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [trades]);

  const maxCount = Math.max(
    1,
    ...last14Days.map((d) => tradesByDay.get(format(d, "yyyy-MM-dd"))?.length ?? 0)
  );

  const overtradedDays = useMemo(() => {
    return last14Days.filter((d) => {
      const count = tradesByDay.get(format(d, "yyyy-MM-dd"))?.length ?? 0;
      return count > maxDailyTrades;
    });
  }, [last14Days, tradesByDay, maxDailyTrades]);

  const hasOvertrade = overtradedDays.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-20">
        {last14Days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTrades = tradesByDay.get(key);
          const count = dayTrades?.length ?? 0;
          const netResult = dayTrades?.reduce((s, t) => s + t.result, 0) ?? 0;
          const height = Math.max(4, (count / maxCount) * 68);
          const isToday = isSameDay(day, now);
          const isOvertraded = count > maxDailyTrades;

          return (
            <div
              key={key}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              <div
                className={`w-full rounded-sm transition-all ${
                  netResult > 0
                    ? "bg-mint-500/60"
                    : netResult < 0
                    ? "bg-coral-500/60"
                    : "bg-ink-700"
                } ${isToday ? "ring-1 ring-mint-400/50" : ""} ${
                  isOvertraded ? "animate-shake" : ""
                }`}
                style={{ height: `${height}px` }}
              />
              <span className={`text-[8px] font-mono ${isToday ? "text-mint-400" : "text-paper-500"}`}>
                {format(day, "d")}
              </span>
              {count > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ink-800 text-paper-100 text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                  {count} işlem · {netResult >= 0 ? "+" : ""}{netResult.toFixed(1)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] font-mono text-paper-500 text-center">Son 14 gün</p>
      {hasOvertrade && (
        <div className="animate-fade-in-up flex items-center gap-2 mt-2 rounded-lg border border-coral-500/30 bg-coral-500/10 px-3 py-2">
          <span className="text-coral-400 text-sm animate-warning-pulse">⚠</span>
          <p className="text-[11px] text-coral-300 font-mono">
            Uyarı: {overtradedDays.length} günde {maxDailyTrades}'ten fazla işlem açılmış ({overtradedDays.map(d => format(d, "d MMM")).join(", ")})
          </p>
        </div>
      )}
    </div>
  );
}
