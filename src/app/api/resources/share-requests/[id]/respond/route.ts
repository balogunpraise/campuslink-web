import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Owner accepts or rejects a pending request.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return proxyToBackend(request, {
    method: "POST",
    url: `/api/resources/share-requests/${id}/respond`,
    data: body,
  });
}
