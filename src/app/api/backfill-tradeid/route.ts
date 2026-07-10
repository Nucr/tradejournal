import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { adminDb } from "@/lib/firebase-admin";

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
    let updated = 0;

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const tradesSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("trades")
        .get();

      const batch = adminDb.batch();
      let batchCount = 0;

      for (const tradeDoc of tradesSnap.docs) {
        const data = tradeDoc.data();
        if (data.tradeId == null || data.tradeId === "") {
          batch.update(tradeDoc.ref, { tradeId: tradeDoc.id });
          batchCount++;
          updated++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    }

    return NextResponse.json({ updated });
  } catch (err) {
    return handleApiError(err, "backfill-tradeid");
  }
}
