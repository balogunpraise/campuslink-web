import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, {
    method: "GET",
    url: "/api/study-buddies/candidates",
    // subjectIds is a repeated query param (List<Guid> model binding on the
    // backend) — a URLSearchParams instance preserves that; a plain object
    // built from it would silently keep only the last value.
    params: searchParams,
  });
}
