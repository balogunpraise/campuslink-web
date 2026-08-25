import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, {
    method: "GET",
    url: `/api/calls/conversations/${conversationId}/history`,
    params: searchParams,
  });
}
