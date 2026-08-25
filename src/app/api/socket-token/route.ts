import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "@/lib/server/session";
import { refreshTokens } from "@/lib/server/auth-proxy";

// The one deliberate exception to "the backend is never called from the
// browser" (see README): every hub (chat, calls) needs the browser to hold a
// bearer token directly, which an httpOnly cookie can't provide. This route
// reads the access token already sitting in that cookie and hands it to page
// JS just long enough to open a socket — the SignalR client keeps it in
// memory via accessTokenFactory (re-fetched on every reconnect) and it's
// never written to localStorage or a client-readable cookie.
export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let rotated = null;

  if (!accessToken && refreshToken) {
    rotated = await refreshTokens(refreshToken);
    accessToken = rotated?.accessToken;
  }

  if (!accessToken) {
    const response = NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    if (refreshToken) clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ accessToken });
  if (rotated) setAuthCookies(response, rotated);
  return response;
}
