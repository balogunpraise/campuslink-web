import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, { method: "GET", url: "/api/people", params: searchParams });
}
