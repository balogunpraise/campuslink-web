import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// NOTE: /api/resources has no controller on the CampusLink API yet — the
// Resource / ResourceShareRequest entities and repository exist, but nothing
// exposes them over HTTP. This proxy is written against the shape those
// entities imply so the frontend is ready the moment that controller lands.
// See README.md "Backend gaps" for the exact endpoints this expects.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, {
    method: "GET",
    url: "/api/resources",
    params: searchParams,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend(request, { method: "POST", url: "/api/resources", data: body });
}
