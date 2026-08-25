"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-auth";
import { useCallSocket } from "@/providers/call-socket-provider";
import { fetchIceServers } from "@/hooks/use-calls";
import type { CallResponse, CallSignal, CallSignalKind, CallType } from "@/lib/types/calls";

interface CallContextValue {
  activeCall: CallResponse | null;
  incomingCall: CallResponse | null;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isBusy: boolean;
  startCall: (conversationId: string, type: CallType) => Promise<void>;
  joinCall: (call: CallResponse) => Promise<void>;
  answerCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used inside CallProvider");
  return ctx;
}

function mediaErrorMessage(err: unknown): string {
  if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
    return "Camera/microphone permission was denied.";
  }
  if (err instanceof DOMException && err.name === "NotFoundError") {
    return "No camera or microphone was found.";
  }
  return "Couldn't access the camera or microphone.";
}

// Orchestrates the WebRTC mesh (up to Call.MaxParticipants = 4 peers) on top
// of CallSocketProvider's hub connection. Signaling state (peer connections,
// pending ICE candidates) lives in refs, not React state, because it's
// imperative bookkeeping the UI never reads directly — only activeCall,
// incomingCall and remoteStreams need to trigger a render.
//
// Camera toggle and screen share are only offered on Video calls, which
// already carry a video track to flip or replace(); upgrading a live Audio
// call to Video would mean adding a track and renegotiating with every peer,
// which this first pass doesn't attempt.
export function CallProvider({ children }: { children: ReactNode }) {
  const { data: me } = useMe();
  const { connection, isConnected } = useCallSocket();

  const [activeCall, setActiveCall] = useState<CallResponse | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallResponse | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isBusy, setIsBusy] = useState(false);

  const meIdRef = useRef<string | undefined>(undefined);
  const activeCallRef = useRef<CallResponse | null>(null);
  const incomingCallRef = useRef<CallResponse | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    meIdRef.current = me?.id;
  }, [me?.id]);

  function closePeer(userId: string) {
    peersRef.current.get(userId)?.close();
    peersRef.current.delete(userId);
    pendingCandidatesRef.current.delete(userId);
    setRemoteStreams((prev) => {
      if (!(userId in prev)) return prev;
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }

  function closeAllPeers() {
    for (const userId of Array.from(peersRef.current.keys())) closePeer(userId);
  }

  function stopLocalMedia() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenTrackRef.current?.stop();
    localStreamRef.current = null;
    screenTrackRef.current = null;
    cameraTrackRef.current = null;
    setLocalStream(null);
  }

  function teardownActiveCall() {
    closeAllPeers();
    stopLocalMedia();
    activeCallRef.current = null;
    setActiveCall(null);
  }

  function sendSignal(targetUserId: string, kind: CallSignalKind, payload: string) {
    const call = activeCallRef.current;
    if (!connection || !call) return;
    connection
      .invoke("SendSignal", { callId: call.id, targetUserId, kind, payload })
      .catch((err) => console.error("SendSignal failed", err));
  }

  function createPeer(userId: string, iceServers: RTCIceServer[]): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers });

    const stream = localStreamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        const outgoing = track.kind === "video" && screenTrackRef.current ? screenTrackRef.current : track;
        pc.addTrack(outgoing, stream);
      }
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(userId, "candidate", JSON.stringify(e.candidate));
    };

    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [userId]: e.streams[0] }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") closePeer(userId);
    };

    peersRef.current.set(userId, pc);
    return pc;
  }

  async function flushPendingCandidates(userId: string, pc: RTCPeerConnection) {
    const pending = pendingCandidatesRef.current.get(userId);
    if (!pending) return;
    pendingCandidatesRef.current.delete(userId);
    for (const candidate of pending) {
      await pc.addIceCandidate(candidate).catch((err) => console.error("addIceCandidate failed", err));
    }
  }

  // Diffs the call's live participants against our peer connections and, for
  // anyone newly present, either offers or waits to receive one — whichever
  // side has the lexicographically smaller user id always initiates, so both
  // sides never race to send an offer at once (no glare, no coordinator).
  async function reconcilePeers(call: CallResponse) {
    const myId = meIdRef.current;
    if (!myId) return;

    const currentOtherIds = new Set(
      call.participants.filter((p) => p.userId !== myId && p.isInCall).map((p) => p.userId),
    );

    for (const userId of Array.from(peersRef.current.keys())) {
      if (!currentOtherIds.has(userId)) closePeer(userId);
    }

    const newIds = Array.from(currentOtherIds).filter((id) => !peersRef.current.has(id));
    if (newIds.length === 0) return;

    const { iceServers } = await fetchIceServers();
    const rtcIceServers: RTCIceServer[] = iceServers.map((s) => ({
      urls: s.urls,
      username: s.username,
      credential: s.credential,
    }));

    for (const otherId of newIds) {
      const pc = createPeer(otherId, rtcIceServers);
      if (myId < otherId) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(otherId, "offer", JSON.stringify({ type: offer.type, sdp: offer.sdp }));
      }
    }
  }

  async function handleSignal(signal: CallSignal) {
    if (activeCallRef.current?.id !== signal.callId) return;

    let pc = peersRef.current.get(signal.fromUserId);
    if (!pc) {
      const { iceServers } = await fetchIceServers();
      pc = createPeer(
        signal.fromUserId,
        iceServers.map((s) => ({ urls: s.urls, username: s.username, credential: s.credential })),
      );
    }

    if (signal.kind === "offer" || signal.kind === "renegotiate") {
      const offer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushPendingCandidates(signal.fromUserId, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(signal.fromUserId, "answer", JSON.stringify({ type: answer.type, sdp: answer.sdp }));
    } else if (signal.kind === "answer") {
      const answer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingCandidates(signal.fromUserId, pc);
    } else if (signal.kind === "candidate") {
      const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;
      if (pc.remoteDescription) {
        await pc.addIceCandidate(candidate).catch((err) => console.error("addIceCandidate failed", err));
      } else {
        const pending = pendingCandidatesRef.current.get(signal.fromUserId) ?? [];
        pending.push(candidate);
        pendingCandidatesRef.current.set(signal.fromUserId, pending);
      }
    }
  }

  useEffect(() => {
    if (!connection) return;

    const onIncomingCall = (call: CallResponse) => {
      // Already on a call — decline immediately rather than leaving the
      // caller hanging for a ring timeout we know we won't answer.
      if (activeCallRef.current) {
        connection.invoke("Decline", call.id).catch(() => {});
        return;
      }
      incomingCallRef.current = call;
      setIncomingCall(call);
    };

    const onCallUpdated = (call: CallResponse) => {
      const myId = meIdRef.current;
      const myParticipant = call.participants.find((p) => p.userId === myId);

      if (call.status === "Ended") {
        if (activeCallRef.current?.id === call.id) teardownActiveCall();
        if (incomingCallRef.current?.id === call.id) {
          incomingCallRef.current = null;
          setIncomingCall(null);
        }
        return;
      }

      if (myParticipant?.isInCall) {
        activeCallRef.current = call;
        setActiveCall(call);
        if (incomingCallRef.current?.id === call.id) {
          incomingCallRef.current = null;
          setIncomingCall(null);
        }
        void reconcilePeers(call);
      } else if (myParticipant && !myParticipant.declined) {
        incomingCallRef.current = call;
        setIncomingCall(call);
      } else if (incomingCallRef.current?.id === call.id) {
        incomingCallRef.current = null;
        setIncomingCall(null);
      }
    };

    const onCallSignal = (signal: CallSignal) => {
      void handleSignal(signal);
    };

    connection.on("IncomingCall", onIncomingCall);
    connection.on("CallUpdated", onCallUpdated);
    connection.on("CallSignal", onCallSignal);

    return () => {
      connection.off("IncomingCall", onIncomingCall);
      connection.off("CallUpdated", onCallUpdated);
      connection.off("CallSignal", onCallSignal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  // The hub drops a lost connection's call membership immediately (see
  // CallHub.OnDisconnectedAsync) — there's no grace period to reconnect
  // into, so a socket drop has to be treated as an immediate local hangup too.
  useEffect(() => {
    if (!isConnected && activeCallRef.current) {
      teardownActiveCall();
      toast.info("Call ended — connection lost.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  async function startCall(conversationId: string, type: CallType) {
    if (!connection || activeCallRef.current || incomingCallRef.current) return;
    setIsBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "Video" });
      localStreamRef.current = stream;
      setLocalStream(stream);
      const call = await connection.invoke<CallResponse>("StartCall", { conversationId, type });
      activeCallRef.current = call;
      setActiveCall(call);
    } catch (err) {
      stopLocalMedia();
      toast.error(mediaErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  // Shared by answering a ring (call comes from incomingCallRef) and joining
  // a call discovered via the "active" REST lookup (call comes from the
  // caller directly) — same steps either way.
  async function join(call: CallResponse) {
    if (!connection || activeCallRef.current) return;
    setIsBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.type === "Video" });
      localStreamRef.current = stream;
      setLocalStream(stream);
      await connection.invoke<CallResponse>("Join", call.id);
      // activeCall/incomingCall are set from the CallUpdated broadcast this
      // triggers, which also drives reconcilePeers — no need to duplicate it.
    } catch (err) {
      stopLocalMedia();
      toast.error(mediaErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  async function answerCall() {
    if (incomingCallRef.current) await join(incomingCallRef.current);
  }

  async function joinCall(call: CallResponse) {
    await join(call);
  }

  async function declineCall() {
    const call = incomingCallRef.current;
    if (!connection || !call) return;
    incomingCallRef.current = null;
    setIncomingCall(null);
    try {
      await connection.invoke("Decline", call.id);
    } catch (err) {
      console.error("Decline failed", err);
    }
  }

  async function leaveCall() {
    const call = activeCallRef.current;
    if (!connection || !call) return;
    try {
      await connection.invoke("Leave", call.id);
    } catch (err) {
      console.error("Leave failed", err);
    } finally {
      teardownActiveCall();
    }
  }

  async function toggleMute() {
    const call = activeCallRef.current;
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!connection || !call || !track) return;
    track.enabled = !track.enabled;
    try {
      await connection.invoke("UpdateMediaState", call.id, { isMuted: !track.enabled });
    } catch (err) {
      console.error("UpdateMediaState failed", err);
    }
  }

  async function toggleCamera() {
    const call = activeCallRef.current;
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!connection || !call || !track || call.type !== "Video") return;
    track.enabled = !track.enabled;
    try {
      await connection.invoke("UpdateMediaState", call.id, { isCameraOn: track.enabled });
    } catch (err) {
      console.error("UpdateMediaState failed", err);
    }
  }

  async function toggleScreenShare() {
    const call = activeCallRef.current;
    if (!connection || !call || call.type !== "Video") return;

    try {
      if (screenTrackRef.current) {
        const cameraTrack = cameraTrackRef.current;
        for (const pc of peersRef.current.values()) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          await sender?.replaceTrack(cameraTrack);
        }
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
        await connection.invoke("UpdateMediaState", call.id, { isSharingScreen: false });
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        cameraTrackRef.current ??= localStreamRef.current?.getVideoTracks()[0] ?? null;

        for (const pc of peersRef.current.values()) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          await sender?.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          if (screenTrackRef.current === screenTrack) void toggleScreenShare();
        };

        await connection.invoke("UpdateMediaState", call.id, { isSharingScreen: true });
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "NotAllowedError")) {
        console.error("Screen share failed", err);
      }
    }
  }

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        localStream,
        remoteStreams,
        isBusy,
        startCall,
        joinCall,
        answerCall,
        declineCall,
        leaveCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}
