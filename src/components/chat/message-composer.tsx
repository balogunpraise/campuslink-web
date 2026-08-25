"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import type { HubConnection } from "@microsoft/signalr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TYPING_IDLE_MS = 3000;

export function MessageComposer({
  conversationId,
  connection,
  onSend,
  isSending,
}: {
  conversationId: string;
  connection: HubConnection | null;
  onSend: (content: string) => void;
  isSending: boolean;
}) {
  const [value, setValue] = useState("");
  const isTypingRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setTyping(isTyping: boolean) {
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;
    connection?.invoke("Typing", conversationId, isTyping).catch(() => {});
  }

  function handleChange(next: string) {
    setValue(next);

    if (next.trim()) {
      setTyping(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setTyping(false), TYPING_IDLE_MS);
    } else {
      setTyping(false);
    }
  }

  function send() {
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue("");
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setTyping(false);
  }

  return (
    <div className="flex items-end gap-2 border-t border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder="Write a message…"
        rows={1}
        className="min-h-11 flex-1 resize-none py-2.5"
      />
      <Button size="md" onClick={send} disabled={!value.trim()} isLoading={isSending}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
