"use client";

import { useEffect, useRef } from "react";
import { MicOff, ScreenShare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

export function ParticipantTile({
  name,
  stream,
  isLocal,
  isMuted,
  isVideoOn,
  isSharingScreen,
}: {
  name: string;
  stream: MediaStream | null;
  isLocal: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isSharingScreen?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const [first, second] = name.trim().split(/\s+/);

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-slate-800">
      {isVideoOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn("h-full w-full object-cover", isLocal && "-scale-x-100")}
        />
      ) : (
        <Avatar initials={initials(first, second)} size="lg" />
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent px-2.5 py-1.5">
        <span className="truncate text-xs font-semibold text-white">
          {isLocal ? "You" : name}
        </span>
        <div className="flex items-center gap-1">
          {isSharingScreen && <ScreenShare className="h-3.5 w-3.5 text-white" />}
          {isMuted && <MicOff className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
    </div>
  );
}
