import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { createCustomerPortal, getCheckout } from "@/lib/creem";

const TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE !== "false";

function testOrdersUrl(uid: string, checkoutId?: string) {
  const id = checkoutId || uid;
  return `https://www.creem.io/test/my-orders/${id}`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }

  const uid = authHeader.slice(7);
  if (!uid) {
    return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { creemCustomerId } = body as { creemCustomerId?: string; checkoutId?: string };
    const { checkoutId } = body as { creemCustomerId?: string; checkoutId?: string };

    if (!creemCustomerId && checkoutId) {
      const checkout = await getCheckout(checkoutId);
      if (checkout?.customer?.id) {
        creemCustomerId = checkout.customer.id;
      }
    }

    if (!creemCustomerId || creemCustomerId.startsWith("{")) {
      if (TEST_MODE) {
        return NextResponse.json({ portalUrl: testOrdersUrl(uid, checkoutId || undefined) });
      }
      return NextResponse.json({ error: "Aktif abonelik bulunamadı. Abonelik sayfasını yenileyip tekrar deneyin." }, { status: 400 });
    }

    const data = await createCustomerPortal(creemCustomerId);
    return NextResponse.json({ portalUrl: data.customer_portal_link });
  } catch (err) {
    if (TEST_MODE) {
      return NextResponse.json({ portalUrl: testOrdersUrl(uid) });
    }
    return handleApiError(err, "creem/portal");
  }
}
