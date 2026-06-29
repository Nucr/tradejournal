import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";

export async function POST(_request: NextRequest) {
  try {
    const proProduct = await creem.products.create({
      name: "Pro",
      description: "Profesyonel traderlar için gelişmiş özellikler",
      billingType: "recurring",
      billingPeriod: "every-year",
      currency: "USD",
      price: 8400,
      taxMode: "inclusive",
    });

    const premiumProduct = await creem.products.create({
      name: "Premium",
      description: "Sınırsız özellikler ve öncelikli destek",
      billingType: "recurring",
      billingPeriod: "every-year",
      currency: "USD",
      price: 18000,
      taxMode: "inclusive",
    });

    return NextResponse.json({
      pro: {
        id: proProduct.id,
        name: proProduct.name,
        price: "$84/year ($7/month)",
      },
      premium: {
        id: premiumProduct.id,
        name: premiumProduct.name,
        price: "$180/year ($15/month)",
      },
      message: "Ürünler Creem'da oluşturuldu. ID'leri .env.local dosyasına ekleyin.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
