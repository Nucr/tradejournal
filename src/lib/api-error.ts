import { NextResponse } from "next/server";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(err: unknown, context?: string) {
  if (err instanceof ApiError) {
    return apiError(err.message, err.status);
  }
  const message = err instanceof Error ? err.message : "Bilinmeyen hata";
  if (context) {
    console.error(`[${context}]`, err instanceof Error ? err.stack || err.message : err);
  }
  return apiError(message, 500);
}
