import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/auth-proxy";

// Two-party confirmation, physical loans only: each side calls this once,
// independently, when the item actually changes hands. The backend decides
// whether the caller is confirming as owner or borrower from the JWT — see
// ResourceShareRequest.ConfirmHandover on the entity.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(request, { method: "POST", url: `/api/resources/share-requests/${id}/handover` });
}
