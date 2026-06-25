import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Trade, UserStats } from "./types";
import { checkAndAwardAchievements } from "./achievement-store";

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

export async function syncUserScore(uid: string): Promise<void> {
  try {
    const tradesSnap = await getDocs(
      query(
        collection(db, "users", uid, "trades"),
        orderBy("entryDate", "desc")
      )
    );

    const trades: Trade[] = tradesSnap.docs
      .filter((d) => {
        const data = d.data();
        return data.deletedAt == null;
      })
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          pair: data.pair as string,
          direction: data.direction as Trade["direction"],
          entryDate: data.entryDate as string,
          exitDate: data.exitDate as string,
          rr: (data.rr as number) ?? 0,
          result: (data.result as number) ?? 0,
          netPnl: (data.netPnl as number) ?? 0,
          strategy: (data.strategy as string) ?? "",
          note: (data.note as string) ?? "",
          screenshotUrl: (data.screenshotUrl as string) ?? "",
          createdAt:
            (data.createdAt as Timestamp)?.toDate?.().toISOString?.() ??
            new Date().toISOString(),
          deletedAt:
            data.deletedAt == null
              ? null
              : (
                  data.deletedAt as Timestamp
                )?.toDate?.().toISOString?.() ?? null,
        };
      });

    const stats = calculateStats(trades);
    const score = calculateScore(trades);
    const level = getLevel(score);
    const rank = getRank(score);

    await setDoc(
      doc(db, "users", uid),
      {
        stats,
        score,
        level,
        rank,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const displayName = (userData.displayName as string) ?? "";
    if (!displayName) return;

    const avatarUrl = typeof userData.avatarUrl === "string" ? userData.avatarUrl : "";
    const avatarColor = typeof userData.avatarColor === "string" ? userData.avatarColor : "#2ED9A4";

    const now = new Date();

    const alltimeEntry = {
      displayName,
      avatarUrl,
      avatarColor,
      score,
      level,
      rank,
      winRate: stats.winRate,
      avgRR: stats.avgRR,
      netResult: stats.netResult,
      totalTrades: stats.totalTrades,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "leaderboard", "alltime", "entries", uid), alltimeEntry);

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weeklyCut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const monthlyTrades = trades.filter((t) => new Date(t.entryDate) >= thirtyDaysAgo);
    const weeklyTrades = trades.filter((t) => new Date(t.entryDate) >= weeklyCut);

    for (const [periodKey, periodTrades] of [
      ["monthly", monthlyTrades] as const,
      ["weekly", weeklyTrades] as const,
    ]) {
      const periodStats = calculateStats(periodTrades as Trade[]);
      const periodScore = calculateScore(periodTrades as Trade[]);
      const periodLevel = getLevel(periodScore);
      const periodRank = getRank(periodScore);

      await setDoc(
        doc(db, "leaderboard", periodKey, "entries", uid),
        {
          displayName,
          avatarUrl,
          avatarColor,
          score: periodScore,
          level: periodLevel,
          rank: periodRank,
          winRate: periodStats.winRate,
          avgRR: periodStats.avgRR,
          netResult: periodStats.netResult,
          totalTrades: periodStats.totalTrades,
          updatedAt: serverTimestamp(),
        }
      );
    }

    await checkAndAwardAchievements(uid, stats, level, trades.map((t) => ({
      result: t.result,
      netPnl: t.netPnl,
      entryDate: t.entryDate,
      pair: t.pair,
    })));
  } catch (err) {
    console.error("syncUserScore error:", err);
  }
}
