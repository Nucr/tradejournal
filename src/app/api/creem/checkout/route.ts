import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/creem";
import type { Plan } from "@/lib/features";

type BillingPeriod = "monthly" | "yearly";

const PRODUCT_IDS: Record<Plan, Record<BillingPeriod, string>> = {
  free: { monthly: "", yearly: "" },
  pro: {
    monthly: process.env.CREEM_PRODUCT_PRO_MONTHLY ?? "prod_5iBKvm5SgnGv8nWAWZvs8f",
    yearly: process.env.CREEM_PRODUCT_PRO_YEARLY ?? "prod_6meCVYl8rbl2vpmjYaY3yH",
  },
  premium: {
    monthly: process.env.CREEM_PRODUCT_PREMIUM_MONTHLY ?? "prod_2JPWBSIV1nydapmQPDZ9O",
    yearly: process.env.CREEM_PRODUCT_PREMIUM_YEARLY ?? "prod_18KSUDy1S3sP1exT283nuQ",
  },
};

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

    const body = await request.json();
    const { plan, billing, email } = body as { plan: Plan; billing: BillingPeriod; email?: string };

    if (!plan || !["pro", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
    }

    const period: BillingPeriod = billing === "monthly" ? "monthly" : "yearly";
    const productId = PRODUCT_IDS[plan][period];

    if (!productId) {
      return NextResponse.json({ error: "Ürün yapılandırılmamış" }, { status: 500 });
    }

    const checkout = await createCheckout(
      productId,
      uid,
      `${request.nextUrl.origin}/payment/success?plan=${plan}&billing=${period}`,
      email ?? undefined,
    );

    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
