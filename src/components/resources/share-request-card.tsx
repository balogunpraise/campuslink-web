"use client";

import { toast } from "sonner";
import { AlertTriangle, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import {
  useConfirmHandover,
  useConfirmReturn,
  useDisputeShareRequest,
  useRespondToShareRequest,
} from "@/hooks/use-resources";
import { ApiError } from "@/lib/http/api-client";
import { Card } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { isPhysicalResourceType } from "@/lib/types/resources";
import type { ResourceShareRequestSummary } from "@/lib/types/resources";

export function ShareRequestCard({ request }: { request: ResourceShareRequestSummary }) {
  const respond = useRespondToShareRequest();
  const handover = useConfirmHandover();
  const confirmReturn = useConfirmReturn();
  const dispute = useDisputeShareRequest();

  const isPhysical = isPhysicalResourceType(request.resourceType);
  const isPending = respond.isPending || handover.isPending || confirmReturn.isPending || dispute.isPending;

  async function run(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "That didn't work");
    }
  }

  const counterpartLabel = request.isOutgoing ? request.ownerName : request.requesterName;

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{request.resourceTitle}</p>
          <p className="text-xs text-slate-500">
            {request.isOutgoing ? "Requested from" : "Requested by"} {counterpartLabel}
            {request.isCrossInstitution && " · different school"}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(request.status)}>{request.status}</Badge>
      </div>

      {request.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{request.notes}</p>}

      {request.dueDate && (
        <p className="mt-2 text-xs text-slate-500">Due back {formatDate(request.dueDate)}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {request.status === "Pending" && !request.isOutgoing && (
          <>
            <Button size="sm" onClick={() => run(() => respond.mutateAsync({ id: request.id, body: { accept: true } }), "Accepted")}>
              <CheckCircle2 className="h-4 w-4" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => run(() => respond.mutateAsync({ id: request.id, body: { accept: false } }), "Declined")}
            >
              Decline
            </Button>
          </>
        )}

        {isPhysical && (request.status === "Approved" || request.status === "AwaitingHandover") && (
          <Button size="sm" onClick={() => run(() => handover.mutateAsync({ id: request.id }), "Handover confirmed")}>
            <ArrowLeftRight className="h-4 w-4" />
            {request.isOutgoing ? "Confirm I received it" : "Confirm I handed it over"}
          </Button>
        )}

        {isPhysical && (request.status === "OnLoan" || request.status === "AwaitingReturn") && (
          <Button size="sm" onClick={() => run(() => confirmReturn.mutateAsync({ id: request.id }), "Return confirmed")}>
            <ArrowLeftRight className="h-4 w-4" />
            {request.isOutgoing ? "Confirm I returned it" : "Confirm I got it back"}
          </Button>
        )}

        {isPhysical && ["AwaitingHandover", "OnLoan", "AwaitingReturn"].includes(request.status) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const reason = prompt("What went wrong?");
              if (reason) run(() => dispute.mutateAsync({ id: request.id, body: { reason } }), "Reported");
            }}
          >
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Report an issue
          </Button>
        )}
      </div>

      {isPending && <p className="mt-2 text-xs text-slate-400">Saving…</p>}
    </Card>
  );
}
