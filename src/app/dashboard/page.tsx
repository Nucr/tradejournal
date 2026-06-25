"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToTrades } from "@/lib/trades";
import { getProfile } from "@/lib/profile";
import { Trade, RangeKey, UserProfile } from "@/lib/types";
import RankBadge from "@/components/RankBadge";
import { filterTradesByRange, computeStats } from "@/lib/date-utils";
import DateRangeTabs from "@/components/DateRangeTabs";
import StatCard from "@/components/StatCard";
import EquityCurveChart from "@/components/EquityCurveChart";
import { StatCardSkeleton, BannerSkeleton, ChartSkeleton } from "@/components/dashboard/Skeleton";
import WidgetCard from "@/components/dashboard/WidgetCard";
import RecentTradesWidget from "@/components/dashboard/RecentTradesWidget";
import MonthlyProgressWidget from "@/components/dashboard/MonthlyProgressWidget";
import TradeFrequencyWidget from "@/components/dashboard/TradeFrequencyWidget";
import DailySummaryWidget from "@/components/dashboard/DailySummaryWidget";
import GoalsWidget from "@/components/dashboard/GoalsWidget";
import PeriodComparisonWidget from "@/components/dashboard/PeriodComparisonWidget";
import { format, parseISO } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [range, setRange] = useState<RangeKey>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, (data) => {
      setTrades(data);
      setLoading(false);
    });
    getProfile(user.uid).then((p) => {
      setProfile(p);
    });
    return () => {
      unsub();
    };
  }, [user]);

  const filtered = useMemo(
    () => filterTradesByRange(trades, range, new Date(), customStart, customEnd),
    [trades, range, customStart, customEnd]
  );

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const allStats = useMemo(() => computeStats(trades), [trades]);

  const filteredNetPnl = stats.totalNetPnl;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold">Genel Bakış</h1>
        <p className="text-sm text-paper-300 mt-1">
          Performansını seçtiğin tarih aralığına göre takip et.
        </p>
      </div>

      {/* Profile banner */}
      {profile && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 flex flex-wrap items-center gap-6 animate-fade-in-up stagger-1">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500">Seviye</p>
            <p className="font-mono text-lg font-semibold mt-0.5">{profile.level}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500">Rütbe</p>
            <div className="mt-1">
              <RankBadge rank={profile.rank} size="md" />
            </div>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500">Puan</p>
            <p className="font-mono text-lg font-semibold mt-0.5">{profile.score}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500">Toplam P&L</p>
            <p className={`font-mono text-lg font-semibold mt-0.5 ${allStats.totalNetPnl >= 0 ? "text-mint-400" : "text-coral-400"}`}>
              {allStats.totalNetPnl >= 0 ? "+" : ""}${allStats.totalNetPnl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="animate-fade-in-up stagger-2">
        <DateRangeTabs
          value={range}
          onChange={setRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomChange={(s, e) => {
            setCustomStart(s);
            setCustomEnd(e);
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in-up stagger-3">
        <StatCard label="İşlem Sayısı" value={String(stats.total)} />
        <StatCard
          label="Kazanma Oranı"
          value={`${stats.winRate.toFixed(0)}%`}
          tone="mint"
          hint={`${stats.wins}K / ${stats.losses}Z / ${stats.breakeven}BE`}
        />
        <StatCard
          label="Toplam RR"
          value={`${stats.totalRR >= 0 ? "+" : ""}${stats.totalRR.toFixed(1)}R`}
          tone={stats.totalRR >= 0 ? "mint" : "coral"}
        />
        <StatCard
          label="Toplam %"
          value={`${stats.totalResult >= 0 ? "+" : ""}${stats.totalResult.toFixed(2)}%`}
          tone={stats.totalResult >= 0 ? "mint" : "coral"}
        />
        <StatCard
          label="Net Kâr/Zarar"
          value={`${filteredNetPnl >= 0 ? "+" : ""}$${Math.abs(filteredNetPnl).toFixed(2)}`}
          tone={filteredNetPnl >= 0 ? "mint" : "coral"}
        />
        <StatCard
          label="Ort. RR"
          value={`${stats.avgRR.toFixed(2)}R`}
          tone="amber"
        />
      </div>

      <div className="animate-fade-in-up stagger-4">
        <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
          Kümülatif Sonuç
        </h2>
        <EquityCurveChart trades={filtered} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up stagger-5">
        <BestWorst label="En İyi İşlem" trade={stats.bestTrade} tone="mint" />
        <BestWorst label="En Kötü İşlem" trade={stats.worstTrade} tone="coral" />
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-6">
        <WidgetCard title="Bugünkü Özet">
          <DailySummaryWidget trades={trades} />
        </WidgetCard>
        <WidgetCard title="Aylık İlerleme">
          <MonthlyProgressWidget trades={trades} />
        </WidgetCard>
        <WidgetCard title="Dönem Karşılaştırma">
          <PeriodComparisonWidget trades={trades} />
        </WidgetCard>
        <WidgetCard title="Hedefler">
          <GoalsWidget />
        </WidgetCard>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up stagger-7">
        <WidgetCard title="Son İşlemler">
          <RecentTradesWidget trades={trades} />
        </WidgetCard>
        <WidgetCard title="Trade Sıklığı">
          <TradeFrequencyWidget trades={trades} />
        </WidgetCard>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-7 w-32 bg-ink-800 rounded animate-pulse" />
        <div className="h-4 w-64 bg-ink-800 rounded mt-2 animate-pulse" />
      </div>
      <BannerSkeleton />
      <div className="h-9 w-96 bg-ink-800 rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <ChartSkeleton />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-xl border border-ink-800 bg-ink-900 animate-pulse" />
        <div className="h-24 rounded-xl border border-ink-800 bg-ink-900 animate-pulse" />
      </div>
    </div>
  );
}

function BestWorst({
  label,
  trade,
  tone,
}: {
  label: string;
  trade: Trade | null;
  tone: "mint" | "coral";
}) {
  if (!trade) {
    return (
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 text-sm text-paper-500">
        {label}: henüz veri yok.
      </div>
    );
  }
  const toneClass = tone === "mint" ? "text-mint-400" : "text-coral-400";
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
      <p className="text-xs uppercase tracking-wide text-paper-500 font-mono mb-2">
        {label}
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-semibold">{trade.pair}</p>
          <p className="text-xs text-paper-500 font-mono">
            {format(parseISO(trade.entryDate), "dd MMM yyyy")}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-mono text-lg font-semibold ${toneClass}`}>
            {trade.result >= 0 ? "+" : ""}
            {trade.result}%
          </p>
          {trade.netPnl !== 0 && (
            <p className={`text-xs font-mono ${toneClass}`}>
              {trade.netPnl >= 0 ? "+" : ""}${trade.netPnl.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
