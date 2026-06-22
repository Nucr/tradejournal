"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToTrades } from "@/lib/trades";
import { Trade } from "@/lib/types";
import {
  format, parseISO, startOfMonth, endOfMonth, getDay,
  addMonths, subMonths, isWithinInterval,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import StatCard from "@/components/StatCard";

const DAY_HEADERS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export default function CalendarPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Growth chart date range
  const [growthStart, setGrowthStart] = useState("");
  const [growthEnd, setGrowthEnd] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, setTrades);
    return unsub;
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
    const wins = monthTrades.filter((t) => t.result > 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    return { total, totalResult, winRate, wins };
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

  // ── Growth chart logic ──

  const growthRange = useMemo(() => {
    const end = growthEnd ? parseISO(growthEnd) : new Date();
    const start = growthStart
      ? parseISO(growthStart)
      : subMonths(new Date(), 6);
    return { start, end };
  }, [growthStart, growthEnd]);

  const growthData = useMemo(() => {
    const filtered = trades
      .filter((t) => {
        const d = parseISO(t.entryDate);
        return d >= growthRange.start && d <= growthRange.end;
      })
      .sort((a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime());

    if (filtered.length === 0) return [];

    let cum = 0;
    return filtered.map((t) => {
      cum += t.result;
      return {
        date: format(parseISO(t.entryDate), "dd MMM yy"),
        value: Number(cum.toFixed(2)),
      };
    });
  }, [trades, growthRange]);

  const growthStats = useMemo(() => {
    if (growthData.length === 0) return { start: 0, end: 0, change: 0, percentChange: 0 };
    const startVal = growthData[0].value;
    const endVal = growthData[growthData.length - 1].value;
    const change = endVal - startVal;
    const percentChange = startVal !== 0 ? (change / Math.abs(startVal)) * 100 : 0;
    return { start: startVal, end: endVal, change, percentChange };
  }, [growthData]);

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold">İşlem Takvimi</h1>
        <p className="text-sm text-paper-300 mt-1">
          İşlemlerini takvim üzerinde görüntüle ve büyümeni takip et.
        </p>
      </div>

      {/* ── Month stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up stagger-1">
        <StatCard
          label="Aylık Net Kâr/Zarar"
          value={`${monthStats.totalResult >= 0 ? "+" : ""}${monthStats.totalResult.toFixed(2)}%`}
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
                    <span className={`mt-auto text-[11px] font-mono font-semibold ${
                      netResult > 0
                        ? "text-mint-400"
                        : netResult < 0
                        ? "text-coral-400"
                        : "text-amber-400"
                    }`}>
                      {netResult >= 0 ? "+" : ""}{netResult.toFixed(1)}%
                    </span>
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

      {/* ── Growth Chart Section ── */}
      <div className="animate-fade-in-up stagger-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Büyüme Grafiği</h2>
            <p className="text-xs text-paper-500 font-mono mt-0.5">
              Belirli bir dönemdeki kümülatif büyümeni görüntüle.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-wide text-paper-500">Başlangıç</label>
              <input
                type="date"
                value={growthStart}
                onChange={(e) => setGrowthStart(e.target.value)}
                placeholder="6 ay önce"
                className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition w-full sm:w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-wide text-paper-500">Bitiş</label>
              <input
                type="date"
                value={growthEnd}
                onChange={(e) => setGrowthEnd(e.target.value)}
                className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition w-full sm:w-36"
              />
            </div>
            {(growthStart || growthEnd) && (
              <button
                onClick={() => { setGrowthStart(""); setGrowthEnd(""); }}
                className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-xs text-paper-500 hover:text-paper-300 hover:border-ink-700 transition self-end"
              >
                Sıfırla
              </button>
            )}
          </div>
        </div>

        {/* Growth summary mini cards */}
        {growthData.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg border border-ink-800 bg-ink-900/50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-wide text-paper-500">Başlangıç</p>
              <p className="font-mono text-sm font-semibold mt-0.5">{growthStats.start.toFixed(2)}%</p>
            </div>
            <div className="rounded-lg border border-ink-800 bg-ink-900/50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-wide text-paper-500">Bitiş</p>
              <p className="font-mono text-sm font-semibold mt-0.5">{growthStats.end.toFixed(2)}%</p>
            </div>
            <div className="rounded-lg border border-ink-800 bg-ink-900/50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-wide text-paper-500">Değişim</p>
              <p className={`font-mono text-sm font-semibold mt-0.5 ${growthStats.change >= 0 ? "text-mint-400" : "text-coral-400"}`}>
                {growthStats.change >= 0 ? "+" : ""}{growthStats.change.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg border border-ink-800 bg-ink-900/50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-wide text-paper-500">Büyüme</p>
              <p className={`font-mono text-sm font-semibold mt-0.5 ${growthStats.percentChange >= 0 ? "text-mint-400" : "text-coral-400"}`}>
                {growthStats.percentChange >= 0 ? "+" : ""}{growthStats.percentChange.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        {growthData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
            <svg className="w-8 h-8 text-paper-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p>Bu dönemde işlem bulunmuyor.</p>
            <p className="text-xs text-paper-500 mt-1">
              {!growthStart && !growthEnd ? "Varsayılan olarak son 6 ay gösteriliyor." : "Farklı bir tarih aralığı dene."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-72 shadow-lg shadow-black/20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2ED9A4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2ED9A4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1B212B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7480"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6B7480"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#11151B",
                    border: "1px solid #272F3B",
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                  labelStyle={{ color: "#A8B0BC" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2ED9A4"
                  strokeWidth={2}
                  fill="url(#growthFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
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
        <p className="text-xs text-paper-500 font-mono">{trade.rr}R</p>
      </div>
    </div>
  );
}
