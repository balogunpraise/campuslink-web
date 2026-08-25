import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/server/backend-client";
import { setAuthCookies } from "@/lib/server/session";
import type { AuthResponse, RegisterRequest } from "@/lib/types/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RegisterRequest;
  const res = await backendClient.post("/api/auth/register", body);

  if (res.status !== 200) {
    return NextResponse.json(res.data, { status: res.status });
  }

  const auth = res.data as AuthResponse;
  const response = NextResponse.json({ user: auth.user }, { status: 200 });
  setAuthCookies(response, auth);
  return response;
}
