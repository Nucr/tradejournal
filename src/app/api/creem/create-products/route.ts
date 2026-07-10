import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { createProduct } from "@/lib/creem";

export async function POST(_request: NextRequest) {
  try {
    const proProduct = await createProduct(
      "Pro",
      "Profesyonel traderlar için gelişmiş özellikler",
      8400,
    );

    const premiumProduct = await createProduct(
      "Premium",
      "Sınırsız özellikler ve öncelikli destek",
      18000,
    );

    return NextResponse.json({
      pro: { id: proProduct.id, name: proProduct.name, price: "$84/year ($7/month)" },
      premium: { id: premiumProduct.id, name: premiumProduct.name, price: "$180/year ($15/month)" },
      message: "Ürünler Creem'da oluşturuldu.",
    });
  } catch (err) {
    return handleApiError(err, "creem/create-products");
  }
}
