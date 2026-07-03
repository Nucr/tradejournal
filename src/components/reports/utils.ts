import { Trade, Account } from "@/lib/types";
import { TradeStats } from "@/lib/date-utils";
import { format, parseISO } from "date-fns";

export interface AdvancedStats {
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  payoffRatio: number;
  grossProfit: number;
  grossLoss: number;
}

export interface MonthlyPnL {
  month: string;
  monthLabel: string;
  pnl: number;
  trades: number;
}

export interface DayOfWeekStat {
  name: string;
  shortName: string;
  trades: number;
  pnl: number;
  winRate: number;
}

export interface AccountStat extends Account {
  stats: TradeStats;
  pnl: number;
}

export function computeAdvancedStats(trades: Trade[]): AdvancedStats {
  const wins = trades.filter((t) => t.netPnl > 0);
  const losses = trades.filter((t) => t.netPnl < 0);
  const grossProfit = wins.reduce((s, t) => s + t.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

  return {
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0,
    avgWin,
    avgLoss,
    largestWin: wins.length > 0 ? Math.max(...wins.map((t) => t.netPnl)) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses.map((t) => t.netPnl)) : 0,
    payoffRatio: avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99 : 0,
    grossProfit,
    grossLoss,
  };
}

export function computeMonthlyPnL(trades: Trade[]): MonthlyPnL[] {
  const map = new Map<string, { pnl: number; trades: number }>();
  for (const t of trades) {
    const key = format(parseISO(t.entryDate), "yyyy-MM");
    const entry = map.get(key) || { pnl: 0, trades: 0 };
    entry.pnl += t.netPnl ?? 0;
    entry.trades += 1;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      monthLabel: format(parseISO(month + "-01"), "MMM yyyy"),
      pnl: data.pnl,
      trades: data.trades,
    }));
}

export function computeDayOfWeekStats(trades: Trade[]): DayOfWeekStat[] {
  const days = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
  ];
  const shortDays = ["Pts", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const wins = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  const pnls = new Array(7).fill(0);

  for (const t of trades) {
    const d = parseISO(t.entryDate).getDay();
    const idx = d === 0 ? 6 : d - 1;
    counts[idx]++;
    pnls[idx] += t.netPnl ?? 0;
    if (t.netPnl > 0) wins[idx]++;
  }

  return days.map((name, i) => ({
    name,
    shortName: shortDays[i],
    trades: counts[i],
    pnl: pnls[i],
    winRate: counts[i] > 0 ? (wins[i] / counts[i]) * 100 : 0,
  }));
}

export function computeAccountBreakdown(
  accounts: Account[],
  trades: Trade[],
  computeStatsFn: (trades: Trade[]) => TradeStats
): AccountStat[] {
  return accounts
    .map((acc) => {
      const accTrades = trades.filter((t) => t.accountId === acc.id);
      const stats = computeStatsFn(accTrades);
      const pnl = accTrades.reduce((s, t) => s + (t.netPnl ?? 0), 0);
      return { ...acc, stats, pnl };
    })
    .filter((a) => a.stats.total > 0);
}
