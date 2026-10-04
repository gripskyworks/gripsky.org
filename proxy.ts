import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Derive document language from the URL, not cookies or an untrusted incoming
// language header. Also cover Vinext's .rsc navigation requests.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\.rsc$/, "");
  const language = path === "/zh" || path.startsWith("/zh/") ? "zh-CN" : "en";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-gripsky-language", language);
  requestHeaders.set("x-gripsky-pathname", path.replace(/\/+$/, "") || "/");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api/|assets/|_next/|favicon.ico|sitemap.xml|robots.txt|llms.txt|feed.xml|manifest.webmanifest).*)"],
};
