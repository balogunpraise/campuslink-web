// Mirrors CampusLink.Core.Application.Dtos.Calls.CallDtos. A call always
// happens inside a chat conversation — see CampusLink.Api/Controllers/CallsController.cs
// and Hubs/CallHub.cs. Media is peer-to-peer (mesh, up to 4 participants);
// the server only relays the WebRTC handshake and tracks lifecycle state.
export type CallType = "Audio" | "Video" | "ScreenShare";
export type CallStatus = "Ringing" | "Active" | "Ended";
export type CallEndReason = "Completed" | "NoAnswer" | "Declined" | "Cancelled" | "Failed";

export interface CallParticipant {
  userId: string;
  userName: string;
  fullName: string;
  joinedAt?: string;
  leftAt?: string;
  isInCall: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isSharingScreen: boolean;
  declined: boolean;
}

export interface CallResponse {
  id: string;
  conversationId: string;
  startedById: string;
  startedByName: string;
  type: CallType;
  status: CallStatus;
  endReason?: CallEndReason;
  startedAt: string;
  connectedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  participants: CallParticipant[];
}

export interface StartCallRequest {
  conversationId: string;
  type?: CallType;
}

export interface UpdateMediaStateRequest {
  isMuted?: boolean;
  isCameraOn?: boolean;
  isSharingScreen?: boolean;
}

export type CallSignalKind = "offer" | "answer" | "candidate" | "renegotiate";

// One envelope for every WebRTC handshake message. The server never parses
// SDP or candidates — it checks both parties are in the call and forwards
// the blob (see CallSignal in CallDtos.cs).
export interface CallSignal {
  callId: string;
  targetUserId: string;
  kind: CallSignalKind;
  payload: string;
  fromUserId: string;
}

export interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface IceServersResponse {
  iceServers: IceServer[];
  expiresAt: string;
}
