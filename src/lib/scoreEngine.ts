import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Trade, UserStats, LeaderboardPeriod } from "./types";
import { checkAndAwardAchievements } from "./achievement-store";

// Score formülü (0–100):
// Karlılık    %30 → netResult normalize (max +100% = 30 puan, negatif = 0)
// Kazanma     %25 → winRate * 0.25
// R:R Oranı   %25 → avgRR normalize (max 3.0 = 25 puan, üstü cap)
// İstikrar    %20 → son 30 günde trade sayısı (10+ = 20 puan, orantılı)

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
  const recentTrades = trades.filter((t) => new Date(t.entryDate) >= thirtyDaysAgo).length;
  const consistency = Math.min(recentTrades / 10, 1);

  return { totalTrades, winRate, avgRR, netResult, consistency };
}

export function calculateScore(trades: Trade[]): number {
  const stats = calculateStats(trades);
  if (stats.totalTrades === 0) return 0;

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

export function getRank(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const [lo, hi, rank] of RANK_TABLE) {
    if (clamped >= lo && clamped <= hi) return rank;
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

export async function syncUserScore(uid: string): Promise<void> {
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const displayName = (userData.displayName as string) ?? "";
  if (!displayName) return;

  const tradesSnap = await getDocs(
    query(collection(db, "users", uid, "trades"), orderBy("entryDate", "desc"))
  );
  const rawTrades = tradesSnap.docs.filter((d) => {
    const deletedAt = d.data().deletedAt;
    return deletedAt == null;
  });
  const trades: Trade[] = rawTrades.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      pair: data.pair,
      direction: data.direction,
      entryDate: data.entryDate,
      exitDate: data.exitDate,
      rr: data.rr,
      result: data.result,
      netPnl: data.netPnl ?? 0,
      strategy: data.strategy,
      note: data.note,
      screenshotUrl: data.screenshotUrl,
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    };
  });

  const stats = calculateStats(trades);
  const score = calculateScore(trades);
  const level = getLevel(score);
  const rank = getRank(score);

  const isPublic = userData.isPublic === true;
  const showStrategy = userData.showStrategy !== false;
  const avatarUrl = typeof userData.avatarUrl === "string" ? userData.avatarUrl : "";
  const avatarColor = typeof userData.avatarColor === "string" ? userData.avatarColor : "#2ED9A4";
  const topStrategy = showStrategy ? computeTopStrategy(trades) : "";

  await setDoc(
    doc(db, "users", uid),
    {
      displayName,
      avatarUrl,
      avatarColor,
      level,
      rank,
      score,
      isPublic,
      showStrategy,
      stats,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await checkAndAwardAchievements(uid, stats, level, trades);

  const periods: LeaderboardPeriod[] = ["weekly", "monthly", "alltime"];
  const leaderboardPromises = periods.map((period) => {
    let periodStats: UserStats;
    if (period === "alltime") {
      periodStats = stats;
    } else {
      const cut = new Date();
      cut.setDate(cut.getDate() - (period === "weekly" ? 7 : 30));
      const filtered = trades.filter((t) => new Date(t.entryDate) >= cut);
      periodStats = calculateStats(filtered);
    }
    const periodScore = calculateScoreFromStats(periodStats);
    const periodLevel = getLevel(periodScore);
    const periodRank = getRank(periodScore);

    return setDoc(doc(db, "leaderboard", period, "entries", uid), {
      displayName,
      avatarUrl,
      score: periodScore,
      level: periodLevel,
      rank: periodRank,
      winRate: periodStats.winRate,
      avgRR: periodStats.avgRR,
      netResult: periodStats.netResult,
      totalTrades: periodStats.totalTrades,
      topStrategy,
      period,
      isPublic,
      showStrategy,
      updatedAt: serverTimestamp(),
    });
  });

  await Promise.all(leaderboardPromises);
}

function calculateScoreFromStats(stats: UserStats): number {
  if (stats.totalTrades === 0) return 0;
  const profitabilityScore = Math.max(0, Math.min(stats.netResult / 50, 1)) * 30;
  const winRateScore = stats.winRate * 0.25;
  const rrScore = Math.min(stats.avgRR / 3, 1) * 25;
  const consistencyScore = stats.consistency * 20;
  return Math.round((profitabilityScore + winRateScore + rrScore + consistencyScore) * 100) / 100;
}
