import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const lastEntryDate = searchParams.get("lastEntryDate");

    let query = adminDb
      .collectionGroup("trades")
      .where("isShared", "==", true)
      .where("visibility", "==", "public")
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
      user: {
        displayName: string;
        avatarUrl: string | null;
        avatarColor: string;
      };
    }[] = [];

    for (const doc of tradesSnap.docs.slice(0, limit)) {
      const data = doc.data();
      const uid = doc.ref.path.split("/")[1];
      const userSnap = await adminDb.collection("users").doc(uid).get();
      const userData = userSnap.data();

      items.push({
        tradeId: doc.id,
        ownerUid: uid,
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
        user: {
          displayName: userData?.displayName ?? "Trader",
          avatarUrl: userData?.avatarUrl ?? null,
          avatarColor: userData?.avatarColor ?? "#2ED9A4",
        },
      });
    }

    const hasMore = tradesSnap.docs.length > limit;
    const lastDoc = tradesSnap.docs[limit - 1];
    const nextCursor = lastDoc?.data()?.entryDate ?? null;

    return NextResponse.json({ items, hasMore, nextCursor });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
