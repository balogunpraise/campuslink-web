// Mirrors CampusLink.Core.Application.Dtos.Chat.ChatDtos. Unlike resources
// and study groups, chat has a real controller and hub on the backend — see
// CampusLink.Api/Controllers/ChatController.cs and Hubs/ChatHub.cs.
export type ConversationType = "Direct" | "Group";

export interface ChatParticipant {
  userId: string;
  userName: string;
  fullName: string;
  profilePictureUrl?: string;
  institutionName: string;
  role: string;
  hasLeft: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUserName: string;
  senderFullName: string;
  /** Null once deleted — the row survives for moderation, the text doesn't reach clients. */
  content?: string;
  sentAt: string;
  editedAt?: string;
  isDeleted: boolean;
  replyToMessageId?: string;
  clientMessageId?: string;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  /** For a direct thread this is the other student's name, resolved per-viewer. */
  title: string;
  studyGroupId?: string;
  createdAt: string;
  lastMessageAt?: string;
  unreadCount: number;
  lastReadAt?: string;
  isMuted: boolean;
  myRole: string;
  lastMessage?: ChatMessage;
  participants: ChatParticipant[];
}

/** Newest-first page plus the cursor for the next (older) one. */
export interface MessagePage {
  items: ChatMessage[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ReadReceiptEvent {
  conversationId: string;
  userId: string;
  readAt: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface StartDirectConversationRequest {
  recipientUserId: string;
}

export interface CreateGroupConversationRequest {
  title: string;
  participantUserIds: string[];
  studyGroupId?: string;
}

export interface SendMessageRequest {
  content: string;
  replyToMessageId?: string;
  /** Echoed back on the broadcast so the sender can match it to an optimistic bubble. */
  clientMessageId?: string;
}

export interface EditMessageRequest {
  content: string;
}
