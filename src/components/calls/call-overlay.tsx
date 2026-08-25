"use client";

import { useEffect, useState } from "react";
import {
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Phone,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useMe } from "@/hooks/use-auth";
import { useCall } from "@/providers/call-provider";
import { Button } from "@/components/ui/button";
import { ParticipantTile } from "@/components/calls/participant-tile";
import { cn } from "@/lib/utils";
import type { CallResponse } from "@/lib/types/calls";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Starts at 0 and ticks up once a second while `connectedAt` is set. Each
// call gets its own CallPanel instance (keyed by call id), so there's no
// case where `connectedAt` needs to reset mid-instance — it's set at most
// once per call, never cleared.
function useElapsedSeconds(connectedAt?: string): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!connectedAt) return;
    const startedMs = new Date(connectedAt).getTime();
    const interval = setInterval(() => setElapsed(Math.max(0, (Date.now() - startedMs) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [connectedAt]);

  return elapsed;
}

// Circular, always-dark call-screen control — deliberately not the shared
// Button component: these render over a fixed dark backdrop regardless of
// the site's own light/dark theme, so they don't want Button's themed
// variants fighting that.
function CallControlButton({
  onClick,
  active,
  destructive,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  destructive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors",
        destructive
          ? "bg-red-600 hover:bg-red-500 active:bg-red-700"
          : active
            ? "bg-mint-500 hover:bg-mint-400 active:bg-mint-600"
            : "bg-white/10 hover:bg-white/20 active:bg-white/25",
      )}
    >
      {children}
    </button>
  );
}

export function CallOverlay() {
  const { activeCall } = useCall();
  if (!activeCall) return null;
  // Keying on the call id remounts the panel (and resets its minimize state)
  // whenever a new call starts, without needing an effect to do it.
  return <CallPanel key={activeCall.id} call={activeCall} />;
}

function CallPanel({ call }: { call: CallResponse }) {
  const { data: me } = useMe();
  const { localStream, remoteStreams, leaveCall, toggleMute, toggleCamera, toggleScreenShare } = useCall();
  const [minimized, setMinimized] = useState(false);
  const elapsed = useElapsedSeconds(call.connectedAt);

  const me_ = call.participants.find((p) => p.userId === me?.id);
  const others = call.participants.filter((p) => p.userId !== me?.id);
  const inCallOthers = others.filter((p) => p.isInCall);
  const isRingingOut = call.status === "Ringing" && inCallOthers.length === 0;
  const isVideoCall = call.type === "Video";
  const isSharingScreen = me_?.isSharingScreen ?? false;

  const statusLabel = isRingingOut
    ? `Calling ${others[0]?.fullName ?? "…"}…`
    : inCallOthers.map((p) => p.fullName).join(", ") || "In call";

  const tiles = (
    <>
      <ParticipantTile
        name="You"
        stream={localStream}
        isLocal
        isMuted={me_?.isMuted ?? false}
        isVideoOn={isVideoCall && (me_?.isCameraOn ?? true)}
      />
      {inCallOthers.map((p) => (
        <ParticipantTile
          key={p.userId}
          name={p.fullName}
          stream={remoteStreams[p.userId] ?? null}
          isLocal={false}
          isMuted={p.isMuted}
          isVideoOn={isVideoCall && p.isCameraOn}
          isSharingScreen={p.isSharingScreen}
        />
      ))}
    </>
  );

  if (minimized) {
    return (
      <>
        {/* Mobile: a full-width "tap to return" bar pinned to the top, the
            way a native in-call status bar works — not a corner widget that
            would sit on top of the bottom tab bar. */}
        <button
          onClick={() => setMinimized(false)}
          className="fixed inset-x-0 top-0 z-40 flex w-full items-center gap-3 bg-mint-500 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-left text-white shadow-lg sm:hidden"
        >
          <Phone className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{statusLabel}</span>
          {call.connectedAt && (
            <span className="shrink-0 text-xs font-medium text-mint-50">{formatElapsed(elapsed)}</span>
          )}
        </button>

        {/* Desktop: floating pill, bottom-right. */}
        <div className="fixed bottom-4 right-4 z-40 hidden items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-lg sm:flex dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-2 w-2 rounded-full bg-mint-500" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{statusLabel}</p>
            {call.connectedAt && <p className="text-xs text-slate-400">{formatElapsed(elapsed)}</p>}
          </div>
          <button
            onClick={() => setMinimized(false)}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Expand"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <Button variant="destructive" size="sm" className="rounded-full" onClick={leaveCall}>
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile: a full-screen takeover, like an actual call screen, rather
          than a small floating card. Always dark, independent of the site's
          own theme — that's how every call UI (FaceTime, WhatsApp…) does it. */}
      <div className="fixed inset-0 z-40 flex flex-col bg-slate-950 sm:hidden">
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-white">{statusLabel}</p>
            <p className="text-sm text-slate-400">{call.connectedAt ? formatElapsed(elapsed) : "Ringing…"}</p>
          </div>
          <button
            onClick={() => setMinimized(true)}
            className="shrink-0 rounded-full p-2.5 text-slate-300 hover:bg-white/10 active:bg-white/15"
            title="Minimize"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>

        <div
          className={cn(
            "grid flex-1 content-start gap-2 overflow-y-auto px-3 pb-3",
            isVideoCall ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {tiles}
        </div>

        <div className="flex items-center justify-center gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
          <CallControlButton title="Mute" active={false} onClick={toggleMute}>
            {me_?.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </CallControlButton>
          {isVideoCall && (
            <CallControlButton title="Camera" onClick={toggleCamera}>
              {me_?.isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </CallControlButton>
          )}
          {isVideoCall && (
            <CallControlButton title="Share screen" active={isSharingScreen} onClick={toggleScreenShare}>
              {isSharingScreen ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
            </CallControlButton>
          )}
          <CallControlButton title="Hang up" destructive onClick={leaveCall}>
            <PhoneOff className="h-5 w-5" />
          </CallControlButton>
        </div>
      </div>

      {/* Desktop: floating panel, bottom-right. */}
      <div className="fixed bottom-4 right-4 z-40 hidden w-[22rem] max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200/80 bg-white p-4 shadow-2xl sm:block dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{statusLabel}</p>
            <p className="text-xs text-slate-400">{call.connectedAt ? formatElapsed(elapsed) : "Ringing…"}</p>
          </div>
          <button
            onClick={() => setMinimized(true)}
            className="shrink-0 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("mt-3 grid gap-2", isVideoCall ? "grid-cols-2" : "grid-cols-1")}>{tiles}</div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={toggleMute}>
            {me_?.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          {isVideoCall && (
            <Button variant="outline" size="sm" className="rounded-full" onClick={toggleCamera}>
              {me_?.isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          )}
          {isVideoCall && (
            <Button
              variant={isSharingScreen ? "secondary" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={toggleScreenShare}
            >
              {isSharingScreen ? <ScreenShareOff className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="destructive" size="sm" className="rounded-full" onClick={leaveCall}>
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
