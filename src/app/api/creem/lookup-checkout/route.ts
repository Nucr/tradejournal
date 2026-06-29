import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getCheckout } from "@/lib/creem";

export async function POST(request: NextRequest) {
  try {
    const { checkoutId } = await request.json() as { checkoutId?: string };
    if (!checkoutId) {
      return NextResponse.json({ error: "checkoutId gerekli" }, { status: 400 });
    }

    const checkout = await getCheckout(checkoutId);
    const customerId = checkout.customer?.id ?? null;

    return NextResponse.json({ customerId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
