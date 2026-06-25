import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["tr", "en"];
const DEFAULT_LOCALE = "tr";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== "/") return;

  const cookieLocale = request.cookies.get("locale")?.value;
  const acceptLang = request.headers
    .get("accept-language")
    ?.split(",")?.[0]
    ?.split("-")?.[0];
  const detected =
    cookieLocale ??
    (LOCALES.includes(acceptLang || "") ? acceptLang : null) ??
    DEFAULT_LOCALE;

  request.nextUrl.pathname = `/${detected}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/"],
};
