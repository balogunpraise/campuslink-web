import { Navbar } from "@/components/layout/navbar";
import { ChatSocketProvider } from "@/providers/chat-socket-provider";
import { CallSocketProvider } from "@/providers/call-socket-provider";
import { CallProvider } from "@/providers/call-provider";
import { IncomingCallModal } from "@/components/calls/incoming-call-modal";
import { CallOverlay } from "@/components/calls/call-overlay";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatSocketProvider>
      <CallSocketProvider>
        <CallProvider>
          <div className="flex min-h-dvh flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-8">
              {children}
            </main>
          </div>
          <IncomingCallModal />
          <CallOverlay />
        </CallProvider>
      </CallSocketProvider>
    </ChatSocketProvider>
  );
}
