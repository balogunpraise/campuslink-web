import { NextRequest, NextResponse } from "next/server";
import type { AxiosRequestConfig } from "axios";
import { backendClient } from "./backend-client";
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "./session";
import type { AuthResponse } from "@/lib/types/auth";

export async function refreshTokens(refreshToken: string): Promise<AuthResponse | null> {
  const res = await backendClient.post("/api/auth/refresh", { refreshToken });
  return res.status === 200 ? (res.data as AuthResponse) : null;
}

interface ProxyOptions {
  /** Attach the caller's access token, refreshing it once on a 401. Default true. */
  auth?: boolean;
}

// Forwards one request to the CampusLink API and returns a ready-to-send
// NextResponse. Centralizing this means every route.ts file is a thin,
// declarative wrapper instead of re-implementing token attachment, the
// refresh-on-401 retry, and cookie rotation each time.
export async function proxyToBackend(
  request: NextRequest,
  config: AxiosRequestConfig,
  { auth = true }: ProxyOptions = {},
): Promise<NextResponse> {
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let rotated: AuthResponse | null = null;

  if (auth && !accessToken && refreshToken) {
    rotated = await refreshTokens(refreshToken);
    accessToken = rotated?.accessToken;
  }

  const attach = (token?: string) => ({
    ...config.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  let res = await backendClient.request({ ...config, headers: attach(accessToken) });

  if (auth && res.status === 401 && !rotated && refreshToken) {
    rotated = await refreshTokens(refreshToken);
    if (rotated) {
      res = await backendClient.request({ ...config, headers: attach(rotated.accessToken) });
    }
  }

  const response = NextResponse.json(res.data ?? null, { status: res.status });

  if (rotated) {
    setAuthCookies(response, rotated);
  } else if (auth && res.status === 401) {
    clearAuthCookies(response);
  }

  return response;
}
