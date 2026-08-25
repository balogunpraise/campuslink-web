import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/types/chat";

function titleInitials(title: string): string {
  const [first, second] = title.trim().split(/\s+/);
  return `${first?.[0] ?? "?"}${second?.[0] ?? ""}`.toUpperCase();
}

export function ConversationListItem({ conversation }: { conversation: ConversationSummary }) {
  const preview = conversation.lastMessage
    ? conversation.lastMessage.isDeleted
      ? "Message deleted"
      : conversation.lastMessage.content
    : "No messages yet";

  return (
    <Link href={`/chat/${conversation.id}`}>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-colors hover:border-mint-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-mint-800">
        {conversation.type === "Group" ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800">
            <Users className="h-4 w-4 text-white" />
          </span>
        ) : (
          <Avatar initials={titleInitials(conversation.title)} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold text-slate-900 dark:text-slate-100">{conversation.title}</p>
            {conversation.lastMessageAt && (
              <span className="shrink-0 text-xs text-slate-400">{formatDate(conversation.lastMessageAt)}</span>
            )}
          </div>
          <p className="truncate text-sm text-slate-500">{preview}</p>
        </div>
        {conversation.unreadCount > 0 && (
          <Badge variant="gradient" className="shrink-0">
            {conversation.unreadCount}
          </Badge>
        )}
      </div>
    </Link>
  );
}
