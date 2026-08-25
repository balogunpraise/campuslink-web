import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const body = await request.json();
  return proxyToBackend(request, { method: "PUT", url: `/api/chat/messages/${messageId}`, data: body });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  return proxyToBackend(request, { method: "DELETE", url: `/api/chat/messages/${messageId}` });
}
