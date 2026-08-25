"use client";

import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall } from "@/providers/call-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

export function IncomingCallModal() {
  const { incomingCall, isBusy, answerCall, declineCall } = useCall();

  if (!incomingCall) return null;

  const [first, second] = incomingCall.startedByName.trim().split(/\s+/);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-mint-400/40" />
          <Avatar initials={initials(first, second)} size="lg" />
        </div>
        <p className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{incomingCall.startedByName}</p>
        <p className="text-sm text-slate-500">
          Incoming {incomingCall.type === "Video" ? "video" : "audio"} call…
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full"
            onClick={declineCall}
            disabled={isBusy}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="rounded-full bg-mint-500 hover:bg-mint-600"
            onClick={answerCall}
            isLoading={isBusy}
          >
            {incomingCall.type === "Video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
