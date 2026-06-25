import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["tr", "en"];
const DEFAULT_LOCALE = "tr";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let locale = DEFAULT_LOCALE;

  const pathLocale = pathname.split("/")[1];
  if (LOCALES.includes(pathLocale)) {
    locale = pathLocale;
  }

  if (pathname === "/") {
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
    const res = NextResponse.redirect(request.nextUrl);
    res.headers.set("x-locale", detected);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|icons|manifest|sw|offline|robots|sitemap|og-image).*)"],
};
