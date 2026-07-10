import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError } from "@/lib/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snap = await adminDb.collection("publicProfiles").get();
    let count = 0;

    const batch = adminDb.batch();
    for (const d of snap.docs) {
      const data = d.data();
      const displayName = data.displayName as string | undefined;
      if (displayName && !data.displayName_lower) {
        batch.update(d.ref, { displayName_lower: displayName.toLowerCase() });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    return NextResponse.json({ updated: count, total: snap.size });
  } catch (err) {
    return handleApiError(err, "backfill");
  }
}
