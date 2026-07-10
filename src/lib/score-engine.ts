import type { Trade, UserStats } from "./types";

export function calculateStats(trades: Trade[]): UserStats {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return { totalTrades: 0, winRate: 0, avgRR: 0, netResult: 0, consistency: 0 };
  }

  let wins = 0;
  let totalRR = 0;
  let totalResult = 0;

  for (const t of trades) {
    if (t.result > 0) wins++;
    totalRR += t.rr;
    totalResult += t.result;
  }

  const winRate = (wins / totalTrades) * 100;
  const avgRR = totalRR / totalTrades;
  const netResult = totalResult;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const consistency = trades.filter(
    (t) => new Date(t.entryDate) >= thirtyDaysAgo
  ).length;

  return { totalTrades, winRate, avgRR, netResult, consistency };
}

export function calculateScore(trades: Trade[]): number {
  const stats = calculateStats(trades);
  if (stats.totalTrades === 0) return 0;

  const profitability = Math.max(
    0,
    Math.min(stats.netResult / 100, 1)
  ) * 30;

  const winRateScore = (stats.winRate / 100) * 25;

  const rrScore = Math.max(
    0,
    Math.min(stats.avgRR / 3, 1)
  ) * 25;

  const consistencyScore = Math.min(stats.consistency / 10, 1) * 20;

  const raw = profitability + winRateScore + rrScore + consistencyScore;
  return Math.round(raw * 100) / 100;
}

const RANKS = [
  { min: 0, level: 1, rank: "Çaylak" },
  { min: 10, level: 2, rank: "Acemi" },
  { min: 20, level: 3, rank: "Gelişen" },
  { min: 30, level: 4, rank: "Deneyimli" },
  { min: 40, level: 5, rank: "Uzman" },
  { min: 50, level: 6, rank: "İleri" },
  { min: 60, level: 7, rank: "Usta" },
  { min: 70, level: 8, rank: "Elit" },
  { min: 80, level: 9, rank: "Efsane" },
  { min: 90, level: 10, rank: "Efsanevi" },
] as const;

export function getLevel(score: number): number {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  let result = 1;
  for (const r of RANKS) {
    if (clamped >= r.min) result = r.level;
  }
  return result;
}

export function getRank(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  let result = "Çaylak";
  for (const r of RANKS) {
    if (clamped >= r.min) result = r.rank;
  }
  return result;
}
