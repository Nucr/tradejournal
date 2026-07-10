import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const lastEntryDate = searchParams.get("lastEntryDate");

    let query = adminDb
      .collection("sharedTrades")
      .orderBy("entryDate", "desc")
      .limit(limit + 1);

    if (lastEntryDate) {
      query = query.startAfter(lastEntryDate);
    }

    const tradesSnap = await query.get();

    const items: {
      tradeId: string;
      ownerUid: string;
      pair: string;
      direction: string;
      entryDate: string;
      exitDate: string;
      result: number;
      rr: number;
      netPnl: number;
      strategy: string;
      note: string;
      screenshotUrl: string;
      likeCount: number;
      dislikeCount: number;
      user: {
        displayName: string;
        avatarUrl: string | null;
        avatarColor: string;
      };
    }[] = [];

    for (const doc of tradesSnap.docs.slice(0, limit)) {
      const data = doc.data();
      items.push({
        tradeId: doc.id,
        ownerUid: data.ownerUid ?? "",
        pair: data.pair ?? "",
        direction: data.direction ?? "",
        entryDate: data.entryDate ?? "",
        exitDate: data.exitDate ?? "",
        result: data.result ?? 0,
        rr: data.rr ?? 0,
        netPnl: data.netPnl ?? 0,
        strategy: data.strategy ?? "",
        note: data.note ?? "",
        screenshotUrl: data.screenshotUrl ?? "",
        likeCount: data.likeCount ?? 0,
        dislikeCount: data.dislikeCount ?? 0,
        user: {
          displayName: data.userDisplayName ?? "Trader",
          avatarUrl: data.userAvatarUrl ?? null,
          avatarColor: data.userAvatarColor ?? "#2ED9A4",
        },
      });
    }

    const hasMore = tradesSnap.docs.length > limit;
    const lastDoc = tradesSnap.docs[limit - 1];
    const nextCursor = lastDoc?.data()?.entryDate ?? null;

    return NextResponse.json({ items, hasMore, nextCursor });
  } catch (err) {
    return handleApiError(err, "social/feed");
  }
}
