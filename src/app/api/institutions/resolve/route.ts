import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  return proxyToBackend(
    request,
    { method: "GET", url: "/api/institutions/resolve", params: { email } },
    { auth: false },
  );
}
