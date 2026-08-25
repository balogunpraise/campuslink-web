"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";
import { useSendStudyBuddyRequest } from "@/hooks/use-study-buddies";
import { ApiError } from "@/lib/http/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { StudyBuddyCandidate } from "@/lib/types/study-buddies";

export function CandidateCard({ candidate }: { candidate: StudyBuddyCandidate }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sendRequest = useSendStudyBuddyRequest();

  const [first, last] = candidate.fullName.split(" ");
  const pending = candidate.existingMatchStatus === "Pending";
  const connected = candidate.existingMatchStatus === "Accepted";

  async function send(subjectId: string) {
    try {
      await sendRequest.mutateAsync({
        recipientUserId: candidate.userId,
        subjectId,
        message: message || undefined,
      });
      toast.success("Request sent");
      setOpen(false);
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send request");
    }
  }

  return (
    <Card interactive>
      <div className="flex items-start gap-3">
        <Avatar initials={initials(first, last)} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-slate-100">{candidate.fullName}</p>
          <p className="text-xs text-slate-500">
            {candidate.institutionName}
            {!candidate.isSameInstitution && " · partner school"}
          </p>
        </div>
        {candidate.existingMatchStatus && (
          <Badge variant={connected ? "emerald" : "amber"}>{candidate.existingMatchStatus}</Badge>
        )}
      </div>

      {candidate.bio && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{candidate.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.sharedSubjects.map((s) => (
          <Badge key={s.id} variant="emerald">
            {s.name}
          </Badge>
        ))}
      </div>

      {!pending && !connected && (
        <div className="mt-4">
          {!open ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <MessageSquarePlus className="h-4 w-4" /> Send request
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Say hi to ${first}…`}
              />
              <div className="flex flex-wrap gap-2">
                {candidate.sharedSubjects.map((s) => (
                  <Button key={s.id} size="sm" variant="outline" onClick={() => send(s.id)} isLoading={sendRequest.isPending}>
                    Request about {s.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
