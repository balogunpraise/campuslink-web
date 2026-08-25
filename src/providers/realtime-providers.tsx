"use client";

import type { ReactNode } from "react";
import { ChatSocketProvider } from "@/providers/chat-socket-provider";
import { CallSocketProvider } from "@/providers/call-socket-provider";
import { CallProvider } from "@/providers/call-provider";
import { IncomingCallModal } from "@/components/calls/incoming-call-modal";
import { CallOverlay } from "@/components/calls/call-overlay";

// Default export, not named — next/dynamic in realtime-shell.tsx loads this
// module by its default export.
export default function RealtimeProviders({ children }: { children: ReactNode }) {
  return (
    <ChatSocketProvider>
      <CallSocketProvider>
        <CallProvider>
          {children}
          <IncomingCallModal />
          <CallOverlay />
        </CallProvider>
      </CallSocketProvider>
    </ChatSocketProvider>
  );
}
