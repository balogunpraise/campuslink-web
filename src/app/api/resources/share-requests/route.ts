import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Incoming and outgoing share requests for the current user, filterable by
// status — mirrors GET /api/study-buddies/requests.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, {
    method: "GET",
    url: "/api/resources/share-requests",
    params: searchParams,
  });
}
