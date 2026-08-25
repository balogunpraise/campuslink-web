import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(request, { method: "GET", url: `/api/resources/${id}` });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(request, { method: "DELETE", url: `/api/resources/${id}` });
}
