"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { useEndStudyBuddyMatch, useRespondToStudyBuddyRequest } from "@/hooks/use-study-buddies";
import { useStartDirectConversation } from "@/hooks/use-chat";
import { ApiError } from "@/lib/http/api-client";
import { Card } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, initials } from "@/lib/utils";
import type { StudyBuddyMatchResponse } from "@/lib/types/study-buddies";

export function MatchCard({ match }: { match: StudyBuddyMatchResponse }) {
  const router = useRouter();
  const respond = useRespondToStudyBuddyRequest();
  const end = useEndStudyBuddyMatch();
  const startConversation = useStartDirectConversation();

  async function message() {
    try {
      const conversation = await startConversation.mutateAsync({ recipientUserId: match.counterpartUserId });
      router.push(`/chat/${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't open that conversation");
    }
  }

  async function run(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "That didn't work");
    }
  }

  const [counterpartFirst, counterpartLast] = match.counterpartFullName.split(" ");

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <Avatar initials={initials(counterpartFirst, counterpartLast)} size="sm" />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{match.counterpartFullName}</p>
            <p className="text-xs text-slate-500">
              {match.counterpartInstitutionName}
              {match.isCrossInstitution && " · different school"}
              {match.subject && ` · about ${match.subject.name}`}
            </p>
          </div>
        </div>
        <Badge variant={statusBadgeVariant(match.status)}>{match.status}</Badge>
      </div>

      {match.message && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{match.message}</p>}
      <p className="mt-2 text-xs text-slate-400">Requested {formatDate(match.requestedAt)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {match.status === "Pending" && !match.isOutgoing && (
          <>
            <Button
              size="sm"
              onClick={() => run(() => respond.mutateAsync({ id: match.id, accept: true }), "Matched!")}
            >
              <CheckCircle2 className="h-4 w-4" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => run(() => respond.mutateAsync({ id: match.id, accept: false }), "Declined")}
            >
              <XCircle className="h-4 w-4" /> Decline
            </Button>
          </>
        )}

        {match.status === "Accepted" && (
          <Button size="sm" variant="outline" onClick={message} isLoading={startConversation.isPending}>
            <MessageCircle className="h-4 w-4" /> Message
          </Button>
        )}

        {(match.status === "Pending" || match.status === "Accepted") && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => run(() => end.mutateAsync(match.id), match.status === "Pending" ? "Withdrawn" : "Ended")}
          >
            {match.status === "Pending" && match.isOutgoing ? "Withdraw" : "End pairing"}
          </Button>
        )}
      </div>
    </Card>
  );
}
