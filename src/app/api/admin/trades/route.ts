import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const q = adminDb
      .collectionGroup("trades")
      .orderBy("entryDate", "desc")
      .limit(100);
    const snap = await q.get();

    const trades = snap.docs.map((d) => {
      const data = d.data();
      const parts = d.ref.path.split("/");
      const userId = parts[1];
      return {
        id: d.id,
        userId,
        pair: data.pair,
        direction: data.direction,
        entryDate: data.entryDate,
        exitDate: data.exitDate,
        rr: data.rr,
        result: data.result,
        netPnl: data.netPnl ?? 0,
        strategy: data.strategy,
        note: data.note,
        screenshotUrl: data.screenshotUrl,
        createdAt:
          typeof data.createdAt?.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : "",
        deletedAt:
          typeof data.deletedAt?.toDate === "function"
            ? data.deletedAt.toDate().toISOString()
            : null,
      };
    });

    return NextResponse.json({ trades });
  } catch (err) {
    return handleApiError(err, "admin-trades");
  }
}
