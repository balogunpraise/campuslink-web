import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return proxyToBackend(
    request,
    // Passed as a URLSearchParams instance (not a plain object) so axios
    // serializes it with `.toString()` and preserves repeated keys.
    { method: "GET", url: "/api/institutions", params: searchParams },
    { auth: false },
  );
}
