import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/server/backend-client";
import { setAuthCookies } from "@/lib/server/session";
import type { AuthResponse } from "@/lib/types/auth";
import type { LoginRequest } from "@/lib/types/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginRequest;
  const res = await backendClient.post("/api/auth/login", body);

  if (res.status !== 200) {
    return NextResponse.json(res.data, { status: res.status });
  }

  const auth = res.data as AuthResponse;
  // The tokens are only ever set as httpOnly cookies — the JSON body handed
  // back to the browser carries just the user profile, never the tokens
  // themselves, so they don't pass through client-readable memory at all.
  const response = NextResponse.json({ user: auth.user }, { status: 200 });
  setAuthCookies(response, auth);
  return response;
}
