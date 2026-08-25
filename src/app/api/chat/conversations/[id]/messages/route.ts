import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Newest-first page. Pass the previous page's nextCursor as `before` to
// scroll further back.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  return proxyToBackend(request, {
    method: "GET",
    url: `/api/chat/conversations/${id}/messages`,
    params: searchParams,
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return proxyToBackend(request, { method: "POST", url: `/api/chat/conversations/${id}/messages`, data: body });
}
