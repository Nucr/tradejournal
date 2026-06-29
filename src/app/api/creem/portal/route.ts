import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createCustomerPortal, getCheckout } from "@/lib/creem";

const TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE !== "false";
const APP_BASE = TEST_MODE ? "https://test-app.creem.io" : "https://app.creem.io";

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
    let { creemCustomerId, checkoutId } = body as { creemCustomerId?: string; checkoutId?: string };
    const returnUrl = `${request.nextUrl.origin}/dashboard/billing`;

    if (!creemCustomerId && checkoutId) {
      const checkout = await getCheckout(checkoutId);
      if (checkout?.customer?.id) {
        creemCustomerId = checkout.customer.id;
      }
    }

    if (!creemCustomerId) {
      return NextResponse.json({ error: "Aktif abonelik bulunamadı. Abonelik sayfasını yenileyip tekrar deneyin." }, { status: 400 });
    }

    try {
      const data = await createCustomerPortal(creemCustomerId, returnUrl);
      return NextResponse.json({ portalUrl: data.portal_url });
    } catch {
      const directPortalUrl = `${APP_BASE}/customer-portal?customer_id=${encodeURIComponent(creemCustomerId)}&return_url=${encodeURIComponent(returnUrl)}`;
      return NextResponse.json({ portalUrl: directPortalUrl });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Portal error:", message, err instanceof Error ? err.stack : "");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
