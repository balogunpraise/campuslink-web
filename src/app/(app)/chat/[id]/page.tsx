"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, History, MessageCircle, Phone, PhoneCall, Users, Video } from "lucide-react";
import { useMe } from "@/hooks/use-auth";
import {
  useConversation,
  useConversationMessages,
  useDeleteChatMessage,
  useEditChatMessage,
  useMarkConversationRead,
  useSendChatMessage,
} from "@/hooks/use-chat";
import { useActiveCallForConversation, useCallHistory } from "@/hooks/use-calls";
import { useChatSocket } from "@/providers/chat-socket-provider";
import { useCall } from "@/providers/call-provider";
import { ApiError } from "@/lib/http/api-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner, Spinner } from "@/components/ui/spinner";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
import { CallHistoryList } from "@/components/calls/call-history-list";
import type { ChatMessage, TypingEvent } from "@/lib/types/chat";

function titleInitials(title: string): string {
  const [first, second] = title.trim().split(/\s+/);
  return `${first?.[0] ?? "?"}${second?.[0] ?? ""}`.toUpperCase();
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: me } = useMe();
  const { connection } = useChatSocket();

  const { data: conversation, isLoading: conversationLoading, isError: conversationError } = useConversation(id);
  const {
    data: messagePages,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessages(id);

  const sendMessage = useSendChatMessage(id);
  const editMessage = useEditChatMessage();
  const deleteMessage = useDeleteChatMessage();
  const markRead = useMarkConversationRead(id);

  const { activeCall, isBusy: callBusy, startCall, joinCall } = useCall();
  const { data: liveCall } = useActiveCallForConversation(id);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { data: callHistory } = useCallHistory(historyOpen ? id : "");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const newestPageLength = messagePages?.pages[0]?.items.length ?? 0;
  const prevNewestLength = useRef(0);

  const messages = useMemo<ChatMessage[]>(
    () => (messagePages ? [...messagePages.pages].reverse().flatMap((page) => [...page.items].reverse()) : []),
    [messagePages],
  );

  useEffect(() => {
    if (newestPageLength > prevNewestLength.current) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
    prevNewestLength.current = newestPageLength;
  }, [newestPageLength]);

  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markRead.mutate();
    }
    // Only re-run when a fresh conversation loads or a new message bumps unreadCount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.unreadCount]);

  useEffect(() => {
    if (!connection) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handler = (event: TypingEvent) => {
      if (event.conversationId !== id || event.userId === me?.id) return;
      if (timeout) clearTimeout(timeout);
      if (event.isTyping) {
        setTypingUser(event.userName);
        timeout = setTimeout(() => setTypingUser(null), 5000);
      } else {
        setTypingUser(null);
      }
    };

    connection.on("UserTyping", handler);
    return () => {
      connection.off("UserTyping", handler);
      if (timeout) clearTimeout(timeout);
    };
  }, [connection, id, me?.id]);

  if (conversationLoading || messagesLoading) return <FullPageSpinner />;

  if (conversationError || !conversation) {
    return (
      <EmptyState icon={MessageCircle} title="Conversation not found" description="It may have been removed." />
    );
  }

  async function send(content: string) {
    try {
      await sendMessage.mutateAsync({ content });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send that message");
    }
  }

  async function saveEdit() {
    if (!editingId || !editValue.trim()) return;
    try {
      await editMessage.mutateAsync({ messageId: editingId, content: editValue.trim() });
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save that edit");
    }
  }

  async function remove(messageId: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete that message");
    }
  }

  return (
    // Height math, mobile: header (4rem) + main's top padding (2rem) + main's
    // bottom padding (6rem, clears the fixed bottom tab bar) = 12rem of
    // chrome above and below this card. Desktop drops the tab bar, so main's
    // bottom padding shrinks to 2rem — 4+2+2 = 8rem.
    <div className="-mx-4 flex h-[calc(100dvh-12rem-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-white dark:bg-slate-900 sm:mx-auto sm:h-[calc(100dvh-8rem)] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-slate-200/80 dark:sm:border-slate-800">
      <div className="flex items-center gap-3 border-b border-slate-200/80 p-4 dark:border-slate-800">
        <Link
          href="/chat"
          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {conversation.type === "Group" ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800">
            <Users className="h-4 w-4 text-white" />
          </span>
        ) : (
          <Avatar initials={titleInitials(conversation.title)} size="sm" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900 dark:text-slate-100">{conversation.title}</p>
          <p className="truncate text-xs text-slate-500">
            {conversation.type === "Group"
              ? `${conversation.participants.filter((p) => !p.hasLeft).length} members`
              : conversation.participants.find((p) => p.userId !== me?.id)?.institutionName}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Call history"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => startCall(id, "Audio")}
            disabled={Boolean(activeCall) || callBusy}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-slate-800"
            title="Audio call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => startCall(id, "Video")}
            disabled={Boolean(activeCall) || callBusy}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-slate-800"
            title="Video call"
          >
            <Video className="h-4 w-4" />
          </button>
        </div>
      </div>

      {historyOpen && (
        <div className="max-h-56 overflow-y-auto border-b border-slate-200/80 px-3 dark:border-slate-800">
          <CallHistoryList calls={callHistory ?? []} />
        </div>
      )}

      {liveCall && liveCall.status !== "Ended" && activeCall?.id !== liveCall.id && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-mint-50 px-4 py-2.5 text-sm dark:border-slate-800 dark:bg-mint-950">
          <span className="font-medium text-mint-800 dark:text-mint-200">
            {liveCall.type === "Video" ? "Video call" : "Call"} in progress
          </span>
          <Button size="sm" onClick={() => joinCall(liveCall)} isLoading={callBusy} disabled={Boolean(activeCall)}>
            <PhoneCall className="h-4 w-4" /> Join
          </Button>
        </div>
      )}

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {hasNextPage && (
          <div className="flex justify-center pb-2">
            <Button variant="outline" size="sm" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
              Load earlier messages
            </Button>
          </div>
        )}

        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-slate-400">Say hello 👋</p>
        )}

        {messages.map((message, index) => {
          const isMine = message.senderId === me?.id;
          const showSender =
            conversation.type === "Group" && !isMine && messages[index - 1]?.senderId !== message.senderId;

          if (editingId === message.id) {
            return (
              <div key={message.id} className="space-y-2 rounded-2xl border border-mint-300 p-3">
                <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={2} />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveEdit} isLoading={editMessage.isPending}>
                    Save
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={isMine}
              showSender={showSender}
              onEdit={
                isMine
                  ? () => {
                      setEditingId(message.id);
                      setEditValue(message.content ?? "");
                    }
                  : undefined
              }
              onDelete={isMine ? () => remove(message.id) : undefined}
            />
          );
        })}

        {typingUser && (
          <div className="flex items-center gap-1.5 px-1 text-xs text-slate-400">
            <Spinner className="h-3 w-3" />
            {typingUser} is typing…
          </div>
        )}
      </div>

      <MessageComposer
        conversationId={id}
        connection={connection}
        onSend={send}
        isSending={sendMessage.isPending}
      />
    </div>
  );
}
