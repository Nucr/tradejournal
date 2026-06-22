import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Trade, UserStats, LeaderboardPeriod } from "./types";

const RANK_TABLE: [number, number, string][] = [
  [0, 9, "Çaylak"],
  [10, 19, "Acemi"],
  [20, 29, "Gelişen"],
  [30, 39, "Deneyimli"],
  [40, 49, "Uzman"],
  [50, 59, "İleri"],
  [60, 69, "Usta"],
  [70, 79, "Elit"],
  [80, 89, "Efsane"],
  [90, 100, "Efsanevi"],
];

export function calculateStats(trades: Trade[]): UserStats {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgRR: 0,
      netResult: 0,
      consistency: 0,
    };
  }

  let wins = 0;
  let totalRR = 0;
  let totalResult = 0;

  for (const t of trades) {
    if (t.result > 0) {
      wins++;
    }
    totalRR += t.rr;
    totalResult += t.result;
  }

  const winRate = (wins / totalTrades) * 100;
  const avgRR = totalRR / totalTrades;
  const netResult = totalResult;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTrades = trades.filter(
    (t) => new Date(t.entryDate) >= thirtyDaysAgo
  ).length;
  const consistency = Math.min(recentTrades / 10, 1);

  return { totalTrades, winRate, avgRR, netResult, consistency };
}

export function calculateScore(trades: Trade[]): number {
  const stats = calculateStats(trades);
  if (stats.totalTrades === 0) {
    return 0;
  }

  const profitabilityScore = Math.max(0, Math.min(stats.netResult / 50, 1)) * 30;
  const winRateScore = stats.winRate * 0.25;
  const rrScore = Math.min(stats.avgRR / 3, 1) * 25;
  const consistencyScore = stats.consistency * 20;

  const raw = profitabilityScore + winRateScore + rrScore + consistencyScore;
  return Math.round(raw * 100) / 100;
}

export function getLevel(score: number): number {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return Math.min(Math.floor(clamped / 10) + 1, 10);
}

export function getRank(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const [lo, hi, rank] of RANK_TABLE) {
    if (clamped >= lo && clamped <= hi) {
      return rank;
    }
  }
  return "Çaylak";
}

function computeTopStrategy(trades: Trade[]): string {
  if (trades.length === 0) return "";
  const freq = new Map<string, number>();
  for (const t of trades) {
    freq.set(t.strategy, (freq.get(t.strategy) ?? 0) + 1);
  }
  let best = "";
  let bestCount = 0;
  for (const [name, count] of freq) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

export async function syncUserToLeaderboard(
  uid: string,
  trades: Trade[],
  displayName: string
): Promise<void> {
  const stats = calculateStats(trades);
  const score = calculateScore(trades);
  const level = getLevel(score);
  const rank = getRank(score);

  const userSnap = await getDoc(doc(db, "users", uid));
  const existing = userSnap.exists() ? userSnap.data() : {};
  const docData = existing as Record<string, unknown>;
  const isPublic = docData.isPublic === true;
  const showStrategy = docData.showStrategy !== false;
  const avatarUrl = typeof docData.avatarUrl === "string" ? docData.avatarUrl : "";
  const topStrategy = showStrategy ? computeTopStrategy(trades) : "";

  const userPayload = {
    displayName,
    level,
    rank,
    score,
    stats,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), userPayload, { merge: true });

  const periods: LeaderboardPeriod[] = ["weekly", "monthly", "alltime"];
  const leaderboardPromises = periods.map((period) =>
    setDoc(doc(db, "leaderboard", period, "entries", uid), {
      displayName,
      avatarUrl,
      score,
      level,
      rank,
      winRate: stats.winRate,
      avgRR: stats.avgRR,
      netResult: stats.netResult,
      totalTrades: stats.totalTrades,
      topStrategy,
      period,
      isPublic,
      showStrategy,
      updatedAt: serverTimestamp(),
    })
  );

  await Promise.all(leaderboardPromises);
}
