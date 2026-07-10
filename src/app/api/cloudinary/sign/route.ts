import "server-only";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { handleApiError } from "@/lib/api-error";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json({ error: "CLOUDINARY_API_SECRET eksik" }, { status: 500 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "strategies";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret,
    );

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    return handleApiError(err, "cloudinary/sign");
  }
}
