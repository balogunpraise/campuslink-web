import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, {
    method: "GET",
    url: "/api/study-buddies/requests",
    params: searchParams,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend(request, { method: "POST", url: "/api/study-buddies/requests", data: body });
}
