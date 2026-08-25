import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyToBackend(
    request,
    { method: "GET", url: `/api/institutions/${encodeURIComponent(slug)}` },
    { auth: false },
  );
}
