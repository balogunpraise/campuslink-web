"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, UserPlus } from "lucide-react";
import { useSendPersonStudyBuddyRequest } from "@/hooks/use-people";
import { useStartDirectConversation } from "@/hooks/use-chat";
import { ApiError } from "@/lib/http/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { PersonSummary } from "@/lib/types/people";

export function PersonCard({ person }: { person: PersonSummary }) {
  const router = useRouter();
  const sendRequest = useSendPersonStudyBuddyRequest();
  const startConversation = useStartDirectConversation();

  const [first, last] = person.fullName.split(" ");
  const pending = person.existingMatchStatus === "Pending";
  const connected = person.existingMatchStatus === "Accepted";

  async function requestStudyBuddy() {
    try {
      await sendRequest.mutateAsync({ userId: person.userId });
      toast.success("Request sent");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send request");
    }
  }

  async function message() {
    try {
      const conversation = await startConversation.mutateAsync({ recipientUserId: person.userId });
      router.push(`/chat/${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't open that conversation");
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar initials={initials(first, last)} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-slate-100">{person.fullName}</p>
          <p className="text-xs text-slate-500">
            {person.institutionName}
            {!person.isSameInstitution && " · partner school"}
            {person.department && ` · ${person.department}`}
            {person.yearOfStudy > 0 && ` · Year ${person.yearOfStudy}`}
          </p>
        </div>
        {person.existingMatchStatus && (
          <Badge variant={connected ? "emerald" : "amber"}>{person.existingMatchStatus}</Badge>
        )}
      </div>

      {person.bio && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{person.bio}</p>}

      {(person.sharedSubjects.length > 0 || person.subjects.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(person.sharedSubjects.length > 0 ? person.sharedSubjects : person.subjects).map((s) => (
            <Badge key={s.id} variant="emerald">
              {s.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={message} isLoading={startConversation.isPending}>
          <MessageCircle className="h-4 w-4" /> Message
        </Button>

        {!pending && !connected && person.canSendRequest && (
          <Button size="sm" onClick={requestStudyBuddy} isLoading={sendRequest.isPending}>
            <UserPlus className="h-4 w-4" /> Study buddy request
          </Button>
        )}

        {!pending && !connected && !person.canSendRequest && person.cannotSendReason && (
          <span className="text-xs text-slate-400">{person.cannotSendReason}</span>
        )}
      </div>
    </Card>
  );
}
