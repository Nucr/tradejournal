import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { adminDb } from "@/lib/firebase-admin";

const ALLOWED_PERIODS = ["weekly", "monthly", "alltime"] as const;

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") ?? "alltime";
  if (!ALLOWED_PERIODS.includes(period as any)) {
    return NextResponse.json({ error: "Geçersiz periyot" }, { status: 400 });
  }

  try {
    const entriesSnap = await adminDb
      .collection("leaderboard")
      .doc(period)
      .collection("entries")
      .orderBy("score", "desc")
      .get();

    const entries = await Promise.all(
      entriesSnap.docs.map(async (d, index) => {
        const data = d.data();
        const uid = d.id;

        let userSnap;
        try {
          userSnap = await adminDb.collection("users").doc(uid).get();
        } catch {
          userSnap = null;
        }
        const userData = userSnap?.data?.();
        const optIn = userData?.leaderboardOptIn === true;

        const mask = (val: number) => (optIn ? val : "####");

        return {
          uid,
          rank: index + 1,
          displayName: optIn ? (data.displayName ?? "Bilinmeyen") : "Anonim Trader",
          avatarUrl: optIn ? (data.avatarUrl ?? null) : null,
          avatarColor: data.avatarColor ?? "#2ED9A4",
          level: optIn ? (data.level ?? 1) : 0,
          rankTitle: optIn ? (data.rank ?? "Çaylak") : "####",
          score: mask(data.score ?? 0),
          winRate: mask(data.winRate ?? 0),
          netResult: mask(data.netResult ?? 0),
          totalTrades: mask(data.totalTrades ?? 0),
          isPublic: data.isPublic ?? false,
          leaderboardOptIn: optIn,
        };
      })
    );

    return NextResponse.json({ entries, period });
  } catch (err) {
    return handleApiError(err, "leaderboard");
  }
}
