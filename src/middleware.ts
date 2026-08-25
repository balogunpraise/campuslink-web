import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/server/session";

const PUBLIC_ROUTES = ["/login", "/register"];

// A quick, cookie-presence check so signed-out visitors never render an
// authenticated page and get bounced by a client-side redirect instead. It
// isn't a substitute for the backend's own [Authorize] checks (a present
// cookie could still be an expired token) — the API is the real authority;
// this just keeps the UI honest about who's signed in.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const hasSession = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value || request.cookies.get(REFRESH_COOKIE)?.value,
  );

  if (!isPublic && !hasSession && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
