import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: { tradeId: string } }
) {
  try {
    const { tradeId } = params;

    const tradesSnap = await adminDb
      .collectionGroup("trades")
      .where("tradeId", "==", tradeId)
      .get();

    if (tradesSnap.empty) {
      return NextResponse.json({ error: "İşlem bulunamadı" }, { status: 404 });
    }

    const tradeDoc = tradesSnap.docs[0];
    const uid = tradeDoc.ref.path.split("/")[1];
    const data = tradeDoc.data();

    if (!data.isShared) {
      return NextResponse.json({ error: "Bu işlem paylaşılmamış" }, { status: 403 });
    }

    const userSnap = await adminDb.collection("users").doc(uid).get();
    const userData = userSnap.data();

    return NextResponse.json({
      trade: {
        id: tradeDoc.id,
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
      },
      user: {
        displayName: userData?.displayName ?? "Trader",
        avatarUrl: userData?.avatarUrl ?? null,
        avatarColor: userData?.avatarColor ?? "#2ED9A4",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
