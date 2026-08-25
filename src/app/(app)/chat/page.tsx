"use client";

import { MessageCircle } from "lucide-react";
import { useConversations } from "@/hooks/use-chat";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { ConversationListItem } from "@/components/chat/conversation-list-item";

export default function ChatPage() {
  const { data: conversations, isLoading, isError } = useConversations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Chat</h1>

      {isLoading && <FullPageSpinner />}

      {isError && (
        <EmptyState icon={MessageCircle} title="Couldn't load conversations" description="Try again in a moment." />
      )}

      {conversations && conversations.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Message a study buddy or resource owner to get started."
        />
      )}

      {conversations && conversations.length > 0 && (
        <div className="space-y-2">
          {conversations
            .slice()
            .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt))
            .map((conversation) => (
              <ConversationListItem key={conversation.id} conversation={conversation} />
            ))}
        </div>
      )}
    </div>
  );
}
