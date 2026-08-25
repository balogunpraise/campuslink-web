import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { method: "GET", url: "/api/study-buddies/profile" });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend(request, { method: "PUT", url: "/api/study-buddies/profile", data: body });
}
