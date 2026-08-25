import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// What a client calls on load to find a call already in progress that it can
// still join — covers the case where it wasn't rung (e.g. it opened the app
// after the call started).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  return proxyToBackend(request, { method: "GET", url: `/api/calls/conversations/${conversationId}/active` });
}
