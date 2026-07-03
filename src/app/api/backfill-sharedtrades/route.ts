import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    const { getAuth } = await import("firebase-admin/auth");
    let decoded;
    try {
      decoded = await getAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const callerUid = decoded.uid;
    const callerSnap = await adminDb.collection("users").doc(callerUid).get();
    const callerData = callerSnap.data();

    if (callerData?.role !== "admin") {
      return NextResponse.json({ error: "Admin required" }, { status: 403 });
    }

    const usersSnap = await adminDb.collection("users").get();
    let written = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data();

      const tradesSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("trades")
        .where("isShared", "==", true)
        .get();

      for (const tradeDoc of tradesSnap.docs) {
        const data = tradeDoc.data();
        const visibility = data.visibility as string | undefined;
        if (visibility !== "public") {
          skipped++;
          continue;
        }

        await adminDb.collection("sharedTrades").doc(tradeDoc.id).set({
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
          userDisplayName: userData?.displayName ?? "Trader",
          userAvatarUrl: userData?.avatarUrl ?? null,
          userAvatarColor: userData?.avatarColor ?? "#2ED9A4",
          entryDateServer: data.entryDate,
        });
        written++;
      }
    }

    return NextResponse.json({ written, skipped });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
