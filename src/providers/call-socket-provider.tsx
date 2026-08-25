"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import { useMe } from "@/hooks/use-auth";
import { fetchSocketToken } from "@/lib/http/socket-token";

interface CallSocketContextValue {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const CallSocketContext = createContext<CallSocketContextValue>({ connection: null, isConnected: false });

export function useCallSocket() {
  return useContext(CallSocketContext);
}

// A second, independent hub connection alongside ChatSocketProvider's — calls
// and chat are separate SignalR hubs (/hubs/calls vs /hubs/chat) so an
// incoming call can reach a user who has the app open but no conversation on
// screen. Unlike chat, nothing here syncs a React Query cache: call state is
// live orchestration (WebRTC peers, media), owned by CallProvider, which
// reads events off this connection directly.
export function CallSocketProvider({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
  const [isConnected, setIsConnected] = useState(false);

  const [connection] = useState<signalR.HubConnection | null>(() => {
    const hubUrl = process.env.NEXT_PUBLIC_CALL_HUB_URL;
    if (!hubUrl) {
      console.error("NEXT_PUBLIC_CALL_HUB_URL is not set — calls will not work.");
      return null;
    }

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: fetchSocketToken })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hub.onreconnected(() => setIsConnected(true));
    hub.onreconnecting(() => setIsConnected(false));
    hub.onclose(() => setIsConnected(false));

    return hub;
  });

  useEffect(() => {
    if (!connection || !user?.id) return;

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error("Call socket failed to connect", err));

    return () => {
      setIsConnected(false);
      connection.stop();
    };
  }, [connection, user?.id]);

  return (
    <CallSocketContext.Provider value={{ connection, isConnected }}>{children}</CallSocketContext.Provider>
  );
}
