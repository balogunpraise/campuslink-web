import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => undefined);
  return proxyToBackend(request, {
    method: "POST",
    url: `/api/people/${id}/study-buddy-request`,
    data: body,
  });
}
