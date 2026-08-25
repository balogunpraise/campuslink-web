import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { method: "GET", url: "/api/auth/me" });
}
