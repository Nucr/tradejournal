import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { adminDb } from "@/lib/firebase-admin";

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
      return NextResponse.json({ error: "Trade bulunamadı" }, { status: 404 });
    }

    const tradeDoc = tradesSnap.docs[0];
    const uid = tradeDoc.ref.path.split("/")[1];
    const tradeRaw = tradeDoc.data();

    if (!tradeRaw.isShared) {
      return NextResponse.json({ error: "Bu trade paylaşılmamış" }, { status: 403 });
    }
    if (tradeRaw.visibility === "private") {
      return NextResponse.json({ error: "Bu trade özel" }, { status: 403 });
    }

    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const userData = userSnap.data();

    return NextResponse.json({
      trade: {
        pair: tradeRaw.pair,
        direction: tradeRaw.direction,
        entryDate: tradeRaw.entryDate,
        exitDate: tradeRaw.exitDate,
        rr: tradeRaw.rr ?? 0,
        result: tradeRaw.result ?? 0,
        netPnl: tradeRaw.netPnl ?? 0,
        strategy: tradeRaw.strategy ?? "",
        note: tradeRaw.note ?? "",
        screenshotUrl: tradeRaw.screenshotUrl ?? "",
      },
      user: {
        displayName: userData?.displayName ?? "Trader",
        avatarColor: userData?.avatarColor ?? "#2ED9A4",
      },
    });
  } catch (err) {
    return handleApiError(err, "share");
  }
}
