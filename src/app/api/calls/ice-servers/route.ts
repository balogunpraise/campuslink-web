import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Fetched right before a call and re-fetched when it expires. Credentials
// are per-user and short-lived, so this can't be cached across users.
export async function GET(request: NextRequest) {
  return proxyToBackend(request, { method: "GET", url: "/api/calls/ice-servers" });
}
