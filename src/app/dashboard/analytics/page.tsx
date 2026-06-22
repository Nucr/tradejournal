"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToTrades } from "@/lib/trades";
import { Trade } from "@/lib/types";
import { format, parseISO, startOfWeek } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import StatCard from "@/components/StatCard";

type BarMode = "daily" | "weekly";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [barMode, setBarMode] = useState<BarMode>("daily");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, setTrades);
    return unsub;
  }, [user]);

  const totalResult = useMemo(
    () => trades.reduce((sum, t) => sum + t.result, 0),
    [trades]
  );

  const winCount = useMemo(
    () => trades.filter((t) => t.result > 0).length,
    [trades]
  );

  const lossCount = useMemo(
    () => trades.filter((t) => t.result < 0).length,
    [trades]
  );

  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  const cumulativeData = useMemo(() => {
    const sorted = [...trades].sort(
      (a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime()
    );
    let cum = 0;
    return sorted.map((t) => {
      cum += t.result;
      return {
        date: format(parseISO(t.entryDate), "dd MMM"),
        value: Number(cum.toFixed(2)),
      };
    });
  }, [trades]);

  const barData = useMemo(() => {
    if (barMode === "daily") {
      const map = new Map<string, number>();
      for (const t of trades) {
        const key = format(parseISO(t.entryDate), "yyyy-MM-dd");
        map.set(key, (map.get(key) || 0) + t.result);
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({
          date: format(parseISO(date), "dd MMM"),
          value: Number(value.toFixed(2)),
        }));
    }

    const map = new Map<string, { sum: number; label: string }>();
    for (const t of trades) {
      const d = parseISO(t.entryDate);
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      if (!map.has(key)) {
        map.set(key, { sum: 0, label: format(weekStart, "dd MMM") });
      }
      map.get(key)!.sum += t.result;
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, { sum, label }]) => ({
        date: label,
        value: Number(sum.toFixed(2)),
      }));
  }, [trades, barMode]);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold">Analitik</h1>
        <p className="text-sm text-paper-300 mt-1">
          Tüm işlemlerinin detaylı analizi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up stagger-1">
        <StatCard
          label="Toplam Kâr/Zarar"
          value={`${totalResult >= 0 ? "+" : ""}${totalResult.toFixed(2)}%`}
          tone={totalResult >= 0 ? "mint" : "coral"}
        />
        <StatCard
          label="Kazanma Oranı"
          value={`${winRate.toFixed(1)}%`}
          tone={winRate >= 50 ? "mint" : "coral"}
          hint={`${winCount}K / ${lossCount}Z`}
        />
        <StatCard
          label="Toplam İşlem Sayısı"
          value={String(trades.length)}
        />
      </div>

      <div className="animate-fade-in-up stagger-2">
        <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
          Kümülatif Sonuç
        </h2>
        {cumulativeData.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
            Henüz veri yok.
          </div>
        ) : (
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
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
                />
                <YAxis
                  stroke="#6B7480"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
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
                  fill="url(#cumFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500">
            {barMode === "daily" ? "Günlük" : "Haftalık"} Performans
          </h2>
          <div className="flex rounded-lg border border-ink-800 overflow-hidden">
            <button
              onClick={() => setBarMode("daily")}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                barMode === "daily"
                  ? "bg-mint-500/10 text-mint-400"
                  : "bg-ink-900 text-paper-500 hover:text-paper-300"
              }`}
            >
              Günlük
            </button>
            <button
              onClick={() => setBarMode("weekly")}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                barMode === "weekly"
                  ? "bg-mint-500/10 text-mint-400"
                  : "bg-ink-900 text-paper-500 hover:text-paper-300"
              }`}
            >
              Haftalık
            </button>
          </div>
        </div>
        {barData.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
            Henüz veri yok.
          </div>
        ) : (
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="#1B212B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7480"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#6B7480"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
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
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.value >= 0 ? "#2ED9A4" : "#FF5D5D"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
