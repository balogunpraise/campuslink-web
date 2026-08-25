import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/server/backend-client";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    // Best-effort: revoke server-side so the refresh token can't be replayed,
    // but the cookies get cleared either way.
    await backendClient.post("/api/auth/revoke", { refreshToken });
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
