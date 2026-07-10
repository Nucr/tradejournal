import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: { tradeId: string } }
) {
  try {
    const { tradeId } = params;

    // sharedTrades koleksiyonundan bul (collectionGroup gerekmez)
    const sharedSnap = await adminDb.collection("sharedTrades").doc(tradeId).get();
    if (!sharedSnap.exists) {
      return NextResponse.json({ error: "İşlem bulunamadı" }, { status: 404 });
    }

    const data = sharedSnap.data()!;
    const uid = data.ownerUid;

    // Kullanıcı bilgisini al
    const userSnap = await adminDb.collection("users").doc(uid).get();
    const userData = userSnap.data();

    return NextResponse.json({
      trade: {
        id: tradeId,
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
        dislikeCount: data.dislikeCount ?? 0,
      },
      user: {
        displayName: data.userDisplayName ?? userData?.displayName ?? "Trader",
        avatarUrl: data.userAvatarUrl ?? userData?.avatarUrl ?? null,
        avatarColor: data.userAvatarColor ?? userData?.avatarColor ?? "#2ED9A4",
      },
    });
  } catch (err) {
    return handleApiError(err, "social/trade");
  }
}
