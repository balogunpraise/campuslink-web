import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Same two-party pattern as handover, for the item coming back.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(request, { method: "POST", url: `/api/resources/share-requests/${id}/return` });
}
