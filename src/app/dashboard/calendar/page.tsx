"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/features";
import FeatureGate from "@/components/FeatureGate";
import { subscribeToTrades } from "@/lib/trades";
import { Trade } from "@/lib/types";
import {
  format, parseISO, startOfMonth, endOfMonth, getDay,
  addMonths, subMonths,
  isWithinInterval,
} from "date-fns";
import { tr } from "date-fns/locale";
import StatCard from "@/components/StatCard";

const DAY_HEADERS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export default function CalendarPage() {
  const { user } = useAuth();
  const { hasFeature } = usePlan();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      const unsub = subscribeToTrades(user.uid, setTrades);
      return unsub;
    } catch (err) {
      const message = err instanceof Error ? err.message : "İşlemler yüklenemedi";
      setError(message);
    }
  }, [user]);

  // ── Month calendar logic ──

  const monthTrades = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return trades.filter((t) =>
      isWithinInterval(parseISO(t.entryDate), { start: monthStart, end: monthEnd })
    );
  }, [trades, currentDate]);

  const monthStats = useMemo(() => {
    const total = monthTrades.length;
    const totalResult = monthTrades.reduce((s, t) => s + t.result, 0);
    const totalPnl = monthTrades.reduce((s, t) => s + t.netPnl, 0);
    const wins = monthTrades.filter((t) => t.result > 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    return { total, totalResult, totalPnl, winRate, wins };
  }, [monthTrades]);

  const tradesByDay = useMemo(() => {
    const map = new Map<string, Trade[]>();
    for (const t of monthTrades) {
      const key = format(parseISO(t.entryDate), "yyyy-MM-dd");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(t);
    }
    return map;
  }, [monthTrades]);

  const dayInfo = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDayOfWeek = getDay(monthStart);
    const daysInMonth = monthEnd.getDate();
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ day: 0, dateStr: "", isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateStr = format(date, "yyyy-MM-dd");
      cells.push({ day: d, dateStr, isCurrentMonth: true });
    }

    return { cells, todayStr, daysInMonth, startDayOfWeek };
  }, [currentDate]);

  function goToPrevMonth() {
    setCurrentDate((prev) => subMonths(prev, 1));
    setSelectedDay(null);
  }

  function goToNextMonth() {
    setCurrentDate((prev) => addMonths(prev, 1));
    setSelectedDay(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDay(null);
  }

  function getCellColor(dateStr: string): string {
    const dayTrades = tradesByDay.get(dateStr);
    if (!dayTrades || dayTrades.length === 0) return "";
    const netResult = dayTrades.reduce((s, t) => s + t.result, 0);
    if (netResult > 0) return "bg-mint-500/10";
    if (netResult < 0) return "bg-coral-500/10";
    return "bg-amber-400/10";
  }

  const selectedDayTrades = selectedDay ? tradesByDay.get(selectedDay) ?? [] : [];

  return (
    <FeatureGate feature="calendar">
      <div className="space-y-8">
      {error && (
        <div className="flex items-center justify-center min-h-[60vh] text-coral-400">{error}</div>
      )}
      {!error && (
      <>
      {/* ── Header ── */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold">İşlem Takvimi</h1>
        <p className="text-sm text-paper-300 mt-1">
          İşlemlerini takvim üzerinde görüntüle.
        </p>
      </div>

      {/* ── Month stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up stagger-1">
        <StatCard
          label="Aylık Net Kâr/Zarar"
          value={`${monthStats.totalResult >= 0 ? "+" : ""}${monthStats.totalResult.toFixed(2)}%`}
          sub={`${monthStats.totalPnl >= 0 ? "+" : ""}${monthStats.totalPnl.toFixed(2)}$`}
          tone={monthStats.totalResult >= 0 ? "mint" : "coral"}
        />
        <StatCard
          label="Alınan Toplam İşlem"
          value={String(monthStats.total)}
        />
        <StatCard
          label="Aylık Kazanma Oranı"
          value={`${monthStats.winRate.toFixed(1)}%`}
          tone={monthStats.winRate >= 50 ? "mint" : "coral"}
          hint={`${monthStats.wins}K / ${monthStats.total - monthStats.wins}Z`}
        />
      </div>

      {/* ── Calendar Grid ── */}
      <div className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="flex items-center gap-1 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-300 hover:text-paper-100 hover:border-ink-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="font-display text-lg font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: tr })}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-xs font-mono text-paper-300 hover:text-paper-100 hover:border-ink-700 transition"
            >
              Bugün
            </button>
            <button
              onClick={goToNextMonth}
              className="flex items-center gap-1 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-300 hover:text-paper-100 hover:border-ink-700 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-ink-800 bg-ink-900 shadow-lg shadow-black/20 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-7 bg-ink-850/50">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="px-2 py-2.5 text-center text-[11px] font-mono font-semibold uppercase tracking-wider text-paper-500 border-b border-ink-800/80"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {dayInfo.cells.map((cell, i) => {
              if (!cell.isCurrentMonth) {
                return <div key={`empty-${i}`} className="min-h-[88px] sm:min-h-[108px] bg-ink-950/30" />;
              }

              const dayTrades = tradesByDay.get(cell.dateStr);
              const tradeCount = dayTrades?.length ?? 0;
              const isToday = cell.dateStr === dayInfo.todayStr;
              const cellColor = getCellColor(cell.dateStr);
              const isSelected = cell.dateStr === selectedDay;
              const netResult = dayTrades?.reduce((s, t) => s + t.result, 0) ?? 0;
              const netPnlDay = dayTrades?.reduce((s, t) => s + t.netPnl, 0) ?? 0;

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : cell.dateStr)}
                  className={`
                    relative min-h-[88px] sm:min-h-[108px] p-2 flex flex-col items-start justify-start
                    text-left border-b border-r border-ink-800/60
                    transition-all duration-150
                    hover:z-10 hover:shadow-lg hover:shadow-black/30
                    ${cellColor}
                    ${isSelected
                      ? "ring-2 ring-inset ring-mint-500/50 bg-mint-500/5 shadow-inner"
                      : "hover:bg-ink-850"
                    }
                    ${isToday ? "after:absolute after:top-1.5 after:right-1.5 after:w-1.5 after:h-1.5 after:rounded-full after:bg-mint-400" : ""}
                  `}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-mono leading-none ${
                        isToday
                          ? "text-mint-400 font-bold"
                          : isSelected
                          ? "text-mint-300"
                          : "text-paper-300"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {tradeCount > 0 && (
                      <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded-md leading-none ${
                        netResult > 0
                          ? "bg-mint-500/20 text-mint-400"
                          : netResult < 0
                          ? "bg-coral-500/20 text-coral-400"
                          : "bg-amber-400/20 text-amber-400"
                      }`}>
                        {tradeCount}
                      </span>
                    )}
                  </div>

                  {tradeCount > 0 && (
                    <div className="mt-auto flex flex-col">
                      <span className={`text-[11px] font-mono font-semibold ${
                        netResult > 0
                          ? "text-mint-400"
                          : netResult < 0
                          ? "text-coral-400"
                          : "text-amber-400"
                      }`}>
                        {netResult >= 0 ? "+" : ""}{netResult.toFixed(1)}%
                      </span>
                      <span className={`text-[10px] font-mono ${
                        netPnlDay > 0
                          ? "text-mint-400/70"
                          : netPnlDay < 0
                          ? "text-coral-400/70"
                          : "text-amber-400/70"
                      }`}>
                        {netPnlDay >= 0 ? "+" : ""}{netPnlDay.toFixed(2)}$
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Selected Day Panel ── */}
      {selectedDay && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">
              {format(parseISO(selectedDay), "dd MMMM yyyy", { locale: tr })}
            </h2>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-lg border border-ink-800 bg-ink-900 p-2 text-paper-500 hover:text-paper-100 hover:border-ink-700 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedDayTrades.length === 0 ? (
            <div className="rounded-xl border border-ink-800 bg-ink-900 p-8 text-center text-sm text-paper-500">
              Bu günde işlem bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayTrades.map((trade) => (
                <DayTradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Analytics link ── */}
      <div className="animate-fade-in-up stagger-3">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 text-center">
          <p className="text-sm text-paper-500 mb-3">
            Detaylı büyüme grafiği ve analitikler için Analitik sayfasını ziyaret et.
          </p>
          <a
            href="/dashboard/analytics"
            className="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Analitik'e Git
          </a>
        </div>
      </div>
      </>
      )}
    </div>
    </FeatureGate>
  );
}

function DayTradeCard({ trade }: { trade: Trade }) {
  const resultColor =
    trade.result > 0
      ? "text-mint-400"
      : trade.result < 0
      ? "text-coral-400"
      : "text-amber-400";

  const directionBadge =
    trade.direction === "long"
      ? "border-mint-500/40 text-mint-400 bg-mint-500/10"
      : trade.direction === "short"
      ? "border-coral-500/40 text-coral-400 bg-coral-500/10"
      : "border-amber-400/40 text-amber-400 bg-amber-400/10";

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 flex items-center justify-between hover:border-ink-700 hover:shadow-md hover:shadow-black/20 transition-all">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold">{trade.pair}</span>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${directionBadge}`}>
              {trade.direction === "long" ? "LONG" : trade.direction === "short" ? "SHORT" : "BE"}
            </span>
          </div>
          {trade.strategy && (
            <p className="text-xs text-paper-500 font-mono mt-0.5">{trade.strategy}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-mono font-semibold text-base ${resultColor}`}>
          {trade.result >= 0 ? "+" : ""}{trade.result}%
        </p>
        <p className={`text-xs font-mono ${resultColor.replace("400", "400/80")}`}>
          {trade.netPnl >= 0 ? "+" : ""}{trade.netPnl.toFixed(2)}$
        </p>
        <p className="text-xs text-paper-500 font-mono">{trade.rr}R</p>
      </div>
    </div>
  );
}
