import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Request to borrow a physical item or get access to a digital one.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return proxyToBackend(request, {
    method: "POST",
    url: `/api/resources/${id}/share-requests`,
    data: body,
  });
}
