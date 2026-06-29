import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const uid = authHeader.slice(7);
    if (!uid) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const userData = userSnap.data()!;
    const creemCustomerId = userData.subscription?.creemCustomerId;

    if (!creemCustomerId) {
      return NextResponse.json({ error: "Aktif abonelik bulunamadı" }, { status: 400 });
    }

    const res = await fetch(
      process.env.NEXT_PUBLIC_CREEM_TEST_MODE === "true"
        ? "https://test-api.creem.io/v1/customer-portal"
        : "https://api.creem.io/v1/customer-portal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CREEM_API_KEY ?? "",
        },
        body: JSON.stringify({
          customer_id: creemCustomerId,
          return_url: `${request.nextUrl.origin}/dashboard/billing`,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Portal URL oluşturulamadı");
    }

    const data = await res.json();
    return NextResponse.json({ portalUrl: data.portal_url ?? data.url ?? "" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
