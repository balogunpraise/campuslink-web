import type { NextResponse } from "next/server";
import type { AuthResponse } from "@/lib/types/auth";

export const ACCESS_COOKIE = "cl_at";
export const REFRESH_COOKIE = "cl_rt";

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Tokens live only in httpOnly cookies — client-side JS (and therefore any
// XSS in the app) never has read access to them. The tradeoff is every
// backend call has to go through our own Route Handlers instead of straight
// from the browser, which is exactly the point.
export function setAuthCookies(response: NextResponse, auth: AuthResponse) {
  response.cookies.set(ACCESS_COOKIE, auth.accessToken, {
    ...baseCookieOptions,
    expires: new Date(auth.accessTokenExpiresAt),
  });
  response.cookies.set(REFRESH_COOKIE, auth.refreshToken, {
    ...baseCookieOptions,
    expires: new Date(auth.refreshTokenExpiresAt),
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}
