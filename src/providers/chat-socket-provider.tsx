"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/hooks/use-auth";
import { fetchSocketToken } from "@/lib/http/socket-token";
import { CONVERSATIONS_KEY, upsertMessageInCache } from "@/hooks/use-chat";
import type { ChatMessage, ConversationSummary, ReadReceiptEvent } from "@/lib/types/chat";
import type { UserSummary } from "@/lib/types/auth";

interface ChatSocketContextValue {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({ connection: null, isConnected: false });

export function useChatSocket() {
  return useContext(ChatSocketContext);
}

// Owns the one SignalR connection for the whole authenticated app shell, and
// keeps React Query's chat caches in sync with the events it receives —
// components just read query data as usual and don't need to know a socket
// is involved. Anything ephemeral (typing indicators) is left for the
// consuming component to subscribe to directly via `connection`.
export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  const [connection] = useState<signalR.HubConnection | null>(() => {
    const hubUrl = process.env.NEXT_PUBLIC_CHAT_HUB_URL;
    if (!hubUrl) {
      console.error("NEXT_PUBLIC_CHAT_HUB_URL is not set — chat will not receive real-time updates.");
      return null;
    }

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: fetchSocketToken })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hub.on("ReceiveMessage", (message: ChatMessage) => {
      upsertMessageInCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    });

    hub.on("MessageUpdated", (message: ChatMessage) => {
      upsertMessageInCache(queryClient, message);
    });

    // Fired after the REST/hub side adds this connection's user to a new or
    // existing thread — join the group on this open socket too, so future
    // events for it arrive without a reconnect.
    hub.on("ConversationChanged", ({ conversationId }: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      hub.invoke("JoinConversation", conversationId).catch(() => {});
    });

    hub.on("ReadReceipt", (receipt: ReadReceiptEvent) => {
      const myId = queryClient.getQueryData<UserSummary>(["auth", "me"])?.id;
      queryClient.setQueryData<ConversationSummary>(["chat", "conversations", receipt.conversationId], (prev) =>
        prev && receipt.userId === myId ? { ...prev, lastReadAt: receipt.readAt, unreadCount: 0 } : prev,
      );
    });

    hub.onreconnected(() => {
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    });
    hub.onreconnecting(() => setIsConnected(false));
    hub.onclose(() => setIsConnected(false));

    return hub;
  });

  useEffect(() => {
    if (!connection || !user?.id) return;

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error("Chat socket failed to connect", err));

    return () => {
      setIsConnected(false);
      connection.stop();
    };
  }, [connection, user?.id]);

  return (
    <ChatSocketContext.Provider value={{ connection, isConnected }}>{children}</ChatSocketContext.Provider>
  );
}
