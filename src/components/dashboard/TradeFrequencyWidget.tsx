"use client";

import { useMemo } from "react";
import { Trade } from "@/lib/types";
import { format, parseISO, subDays, eachDayOfInterval, isSameDay } from "date-fns";

interface Props {
  trades: Trade[];
  maxDailyTrades?: number;
}

export default function TradeFrequencyWidget({ trades, maxDailyTrades = 3 }: Props) {
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
          const fillRatio = Math.min(1, count / maxDailyTrades);

          return (
            <div
              key={key}
              className="flex-1 flex flex-col items-center gap-0.5 group relative"
            >
              {count > 0 && (
                <div className="flex items-center gap-[2px] mb-0.5 h-3">
                  {Array.from({ length: maxDailyTrades }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        i < count
                          ? isOvertraded
                            ? "bg-coral-400"
                            : i === maxDailyTrades - 1 && count === maxDailyTrades
                            ? "bg-amber-400"
                            : "bg-mint-400"
                          : "bg-ink-700"
                      }`}
                      style={{
                        opacity: i < count
                          ? Math.max(0.3, 0.3 + fillRatio * 0.7)
                          : 0.15,
                      }}
                    />
                  ))}
                  {isOvertraded && (
                    <span className="text-[9px] text-coral-400 ml-0.5">⚠</span>
                  )}
                </div>
              )}
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
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-ink-800 text-paper-100 text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                  {count}/{maxDailyTrades} · {netResult >= 0 ? "+" : ""}{netResult.toFixed(1)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] font-mono text-paper-500 text-center">Son 14 gün</p>
    </div>
  );
}
