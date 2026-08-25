import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend(request, { method: "POST", url: "/api/chat/conversations/direct", data: body });
}
