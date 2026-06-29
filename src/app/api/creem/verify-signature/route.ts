import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkout_id, order_id, customer_id, product_id, request_id, signature } = body;

    if (!signature) {
      return NextResponse.json({ error: "İmza bulunamadı" }, { status: 400 });
    }

    const apiKey = process.env.CREEM_API_KEY ?? "";

    const params: Record<string, string> = {};
    if (checkout_id) params.checkout_id = checkout_id;
    if (order_id) params.order_id = order_id;
    if (customer_id) params.customer_id = customer_id;
    if (product_id) params.product_id = product_id;
    if (request_id) params.request_id = request_id;

    const paramValues = Object.values(params).filter(Boolean);
    paramValues.push(`salt=${apiKey}`);

    const expectedSignature = crypto
      .createHash("sha256")
      .update(paramValues.join("|"))
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Geçersiz imza" }, { status: 401 });
    }

    const uid = request_id;
    if (uid) {
      const plan = (product_id === process.env.CREEM_PRODUCT_PRO_YEARLY || product_id === process.env.CREEM_PRODUCT_PRO_MONTHLY)
        ? "pro"
        : (product_id === process.env.CREEM_PRODUCT_PREMIUM_YEARLY || product_id === process.env.CREEM_PRODUCT_PREMIUM_MONTHLY)
          ? "premium"
          : "free";

      await adminDb.collection("users").doc(uid).set({
        subscription: {
          plan,
          creemCustomerId: customer_id,
          creemCheckoutId: checkout_id,
          status: "active",
          updatedAt: new Date(),
        },
      }, { merge: true });
    }

    return NextResponse.json({ verified: true, plan: uid ? "guncellendi" : "beklemede" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
