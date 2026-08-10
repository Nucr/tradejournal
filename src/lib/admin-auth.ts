import "server-only";
import { NextRequest } from "next/server";
import { ApiError } from "./api-error";
import { adminDb } from "./firebase-admin";

export async function requireAdmin(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401);
  }

  const token = authHeader.slice(7);
  const { getAuth } = await import("firebase-admin/auth");

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(token);
  } catch {
    throw new ApiError("Invalid token", 401);
  }

  const callerUid = decoded.uid;
  const callerSnap = await adminDb.collection("users").doc(callerUid).get();
  const callerData = callerSnap.data();

  if (callerData?.role !== "admin") {
    throw new ApiError("Admin required", 403);
  }

  return callerUid;
}

function serializeValue(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "object" && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return value;
}

export function serializeAdminData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = serializeValue(v);
  }
  return out;
}
