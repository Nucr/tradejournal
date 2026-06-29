import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createCustomerPortal, getCheckout } from "@/lib/creem";

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

    if (!creemCustomerId && checkoutId) {
      const checkout = await getCheckout(checkoutId);
      if (checkout?.customer?.id) {
        creemCustomerId = checkout.customer.id;
      }
    }

    if (!creemCustomerId) {
      return NextResponse.json({ error: "Aktif abonelik bulunamadı. Abonelik sayfasını yenileyip tekrar deneyin." }, { status: 400 });
    }

    const data = await createCustomerPortal(creemCustomerId, `${request.nextUrl.origin}/dashboard/billing`);

    return NextResponse.json({ portalUrl: data.portal_url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
