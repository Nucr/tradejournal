import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const [usersSnap, strategiesSnap, tradesSnap] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("strategies").count().get(),
      adminDb.collectionGroup("trades").count().get(),
    ]);

    return NextResponse.json({
      totalUsers: usersSnap.data().count,
      totalStrategies: strategiesSnap.data().count,
      totalTrades: tradesSnap.data().count,
    });
  } catch (err) {
    return handleApiError(err, "admin-stats");
  }
}
