"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { FullPageSpinner } from "@/components/ui/spinner";

// @microsoft/signalr does isomorphic transport detection (browser WebSocket
// vs. Node's `ws`) via a dynamic require, which Next's server bundler can't
// statically analyze — even though ChatSocketProvider/CallSocketProvider are
// client components, the file importing signalr still gets processed by the
// server compiler to produce their client reference, and that's where it
// trips. `ssr: false` is the documented fix for a dependency the server
// bundler can't handle: it's loaded only as a client-side chunk, so the
// server never touches it. `next/dynamic` with `ssr: false` isn't allowed
// directly inside a Server Component (AppLayout), which is why this thin
// client wrapper exists — see the "Skipping SSR" note in Next's lazy-loading
// guide.
const RealtimeProviders = dynamic(() => import("@/providers/realtime-providers"), {
  ssr: false,
  loading: () => <FullPageSpinner />,
});

export function RealtimeShell({ children }: { children: ReactNode }) {
  return <RealtimeProviders>{children}</RealtimeProviders>;
}
