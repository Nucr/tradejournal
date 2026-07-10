import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { adminDb } from "@/lib/firebase-admin";
import { calculateStats, calculateScore, getLevel, getRank } from "@/lib/score-engine";
import { ACHIEVEMENT_DEFS, checkEarned } from "@/lib/achievements";
import type { Trade } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();
    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "uid gerekli" }, { status: 400 });
    }

    const tradesSnap = await adminDb.collection("users").doc(uid).collection("trades")
      .orderBy("entryDate", "desc")
      .get();

    const trades: Trade[] = tradesSnap.docs
      .filter((d) => {
        const data = d.data();
        return data.deletedAt == null;
      })
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          pair: String(data.pair ?? ""),
          direction: data.direction as Trade["direction"],
          entryDate: String(data.entryDate ?? ""),
          exitDate: String(data.exitDate ?? ""),
          rr: Number(data.rr ?? 0),
          result: Number(data.result ?? 0),
          netPnl: Number(data.netPnl ?? 0),
          strategy: String(data.strategy ?? ""),
          note: String(data.note ?? ""),
          screenshotUrl: String(data.screenshotUrl ?? ""),
          accountId: data.accountId != null ? String(data.accountId) : undefined,
          likeCount: Number(data.likeCount ?? 0),
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? String(data.entryDate ?? ""),
          deletedAt: data.deletedAt?.toDate?.()?.toISOString?.() ?? null,
        } as Trade;
      });

    const stats = calculateStats(trades);
    const score = calculateScore(trades);
    const level = getLevel(score);
    const rank = getRank(score);

    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const userData = userSnap.data()!;
    const displayName = String(userData.displayName ?? "");
    if (!displayName) {
      return NextResponse.json({ error: "Kullanıcı adı bulunamadı" }, { status: 400 });
    }

    const avatarUrl = typeof userData.avatarUrl === "string" ? userData.avatarUrl : "";
    const avatarColor = typeof userData.avatarColor === "string" ? userData.avatarColor : "#2ED9A4";

    // Update user doc with stats
    await adminDb.collection("users").doc(uid).set({
      stats: {
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        avgRR: stats.avgRR,
        netResult: stats.netResult,
        consistency: stats.consistency,
      },
      score,
      level,
      rank,
      updatedAt: new Date(),
    }, { merge: true });

    // Sync public profile
    await adminDb.collection("publicProfiles").doc(uid).set({
      displayName,
      displayName_lower: displayName.toLowerCase(),
      avatarUrl: avatarUrl || null,
      avatarColor,
      level,
      rank,
      score,
      isPublic: userData.isPublic ?? true,
      updatedAt: new Date(),
    }, { merge: true });

    // Leaderboard entries
    const now = new Date();
    const baseEntry = {
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
      updatedAt: new Date(),
    };

    await adminDb.collection("leaderboard").doc("alltime").collection("entries").doc(uid).set(baseEntry);

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weeklyCut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const monthlyTrades = trades.filter((t) => new Date(t.entryDate) >= thirtyDaysAgo);
    const weeklyTrades = trades.filter((t) => new Date(t.entryDate) >= weeklyCut);

    for (const [periodKey, periodTrades] of [
      ["monthly", monthlyTrades] as const,
      ["weekly", weeklyTrades] as const,
    ]) {
      const periodStats = calculateStats(periodTrades);
      const periodScore = calculateScore(periodTrades);
      await adminDb.collection("leaderboard").doc(periodKey).collection("entries").doc(uid).set({
        displayName,
        avatarUrl,
        avatarColor,
        score: periodScore,
        level: getLevel(periodScore),
        rank: getRank(periodScore),
        winRate: periodStats.winRate,
        avgRR: periodStats.avgRR,
        netResult: periodStats.netResult,
        totalTrades: periodStats.totalTrades,
        updatedAt: new Date(),
      });
    }

    // Achievements
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const existingAchievements: string[] = userDoc.data()?.achievements ?? [];

    const earnedIds = checkEarned(
      ACHIEVEMENT_DEFS,
      { totalTrades: stats.totalTrades, winRate: stats.winRate, avgRR: stats.avgRR, consistency: stats.consistency, level, netResult: stats.netResult },
      trades.map((t) => ({ result: t.result, netPnl: t.netPnl, entryDate: t.entryDate, pair: t.pair }))
    );

    const newIds = earnedIds.filter((id) => !existingAchievements.includes(id));

    if (newIds.length > 0) {
      const allIds = [...new Set([...existingAchievements, ...newIds])];
      await adminDb.collection("users").doc(uid).set({ achievements: allIds, updatedAt: new Date() }, { merge: true });
    }

    const newAchievements = newIds.map((id) => {
      const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
      return {
        id,
        label: def?.label ?? id,
        desc: def?.desc ?? "",
        icon: def?.icon ?? "🏆",
        rarity: def?.rarity ?? "common",
        earnedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json({ ok: true, newAchievements });
  } catch (err) {
    return handleApiError(err, "sync-score");
  }
}
