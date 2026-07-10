"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToTrades } from "@/lib/trades";
import { subscribeToAccounts } from "@/lib/accounts";
import { Trade, Account } from "@/lib/types";
import { format, parseISO, startOfWeek } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import StatCard from "@/components/StatCard";
import { usePlan } from "@/lib/features";
import FeatureGate from "@/components/FeatureGate";

type BarMode = "daily" | "weekly";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { hasFeature } = usePlan();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [barMode, setBarMode] = useState<BarMode>("daily");
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

  useEffect(() => {
    if (!user) return;
    try {
      const unsub = subscribeToAccounts(user.uid, setAccounts);
      return unsub;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Hesaplar yüklenemedi";
      setError(message);
    }
  }, [user]);

  const filteredTrades = useMemo(() => {
    if (accountFilter === "all") return trades;
    return trades.filter((t) => t.accountId === accountFilter);
  }, [trades, accountFilter]);

  const totalResult = useMemo(
    () => filteredTrades.reduce((sum, t) => sum + t.result, 0),
    [filteredTrades]
  );

  const winCount = useMemo(
    () => filteredTrades.filter((t) => t.result > 0).length,
    [filteredTrades]
  );

  const lossCount = useMemo(
    () => filteredTrades.filter((t) => t.result < 0).length,
    [filteredTrades]
  );

  const winRate = filteredTrades.length > 0 ? (winCount / filteredTrades.length) * 100 : 0;

  const cumulativeData = useMemo(() => {
    const sorted = [...filteredTrades].sort(
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
  }, [filteredTrades]);

  const barData = useMemo(() => {
    if (barMode === "daily") {
      const map = new Map<string, number>();
      for (const t of filteredTrades) {
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
    for (const t of filteredTrades) {
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
  }, [filteredTrades, barMode]);

  return (
    <FeatureGate feature="advanced_charts">
    <div className="space-y-8">
      {error && (
        <div className="flex items-center justify-center min-h-[60vh] text-coral-400">{error}</div>
      )}
      {!error && (
      <>
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold">Analitik</h1>
        <p className="text-sm text-paper-300 mt-1">
          Tüm işlemlerinin detaylı analizi.
        </p>
      </div>

      <div className="flex items-center gap-3 animate-fade-in-up stagger-1">
        <div className="flex-1">
          <label className="text-[10px] font-mono uppercase tracking-wide text-paper-500 mb-1 block">Hesap Filtresi</label>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50"
          >
            <option value="all">Tüm Hesaplar</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
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
          value={String(filteredTrades.length)}
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
              <LineChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2ED9A4"
                  strokeWidth={2}
                  dot={false}
                  fill="url(#barFill)"
                  activeDot={{ r: 4, fill: "#2ED9A4", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
      )}
    </div>
    </FeatureGate>
  );
}
