import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Removing yourself is leaving the conversation.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const { id, userId } = await params;
  return proxyToBackend(request, {
    method: "DELETE",
    url: `/api/chat/conversations/${id}/participants/${userId}`,
  });
}
