import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, serializeAdminData } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const snap = await adminDb.collection("users").get();
    const users = snap.docs.map((d) => ({
      uid: d.id,
      ...serializeAdminData(d.data()),
    }));

    return NextResponse.json({ users });
  } catch (err) {
    return handleApiError(err, "admin-users");
  }
}
