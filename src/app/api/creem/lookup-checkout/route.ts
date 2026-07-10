import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { getCheckout } from "@/lib/creem";

export async function POST(request: NextRequest) {
  try {
    const { checkoutId } = await request.json() as { checkoutId?: string };
    if (!checkoutId) {
      return NextResponse.json({ error: "checkoutId gerekli" }, { status: 400 });
    }

    const checkout = await getCheckout(checkoutId);
    const customerId = checkout?.customer?.id ?? null;

    return NextResponse.json({ customerId });
  } catch (err) {
    return handleApiError(err, "creem/lookup-checkout");
  }
}
