import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, serializeAdminData } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const q = adminDb.collection("strategies").orderBy("createdAt", "desc");
    const snap = await q.get();

    const strategies = snap.docs.map((d) => ({
      id: d.id,
      ...serializeAdminData(d.data()),
    }));

    return NextResponse.json({ strategies });
  } catch (err) {
    return handleApiError(err, "admin-strategies");
  }
}
