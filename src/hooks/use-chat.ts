import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type {
  ChatMessage,
  ConversationSummary,
  CreateGroupConversationRequest,
  EditMessageRequest,
  MessagePage,
  SendMessageRequest,
  StartDirectConversationRequest,
} from "@/lib/types/chat";

export const CONVERSATIONS_KEY = ["chat", "conversations"] as const;
const conversationKey = (id: string) => [...CONVERSATIONS_KEY, id] as const;
const messagesKey = (conversationId: string) => ["chat", "messages", conversationId] as const;

// Shared by the mutation that sends a message and the socket listener that
// receives the broadcast of it — whichever arrives first wins, the other is
// a no-op, so a message never gets duplicated regardless of connection
// timing.
export function upsertMessageInCache(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<{ pages: MessagePage[]; pageParams: unknown[] }>(
    messagesKey(message.conversationId),
    (data) => {
      if (!data) return data;

      const alreadyPresent = data.pages.some((page) => page.items.some((m) => m.id === message.id));
      if (alreadyPresent) {
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((m) => (m.id === message.id ? message : m)),
          })),
        };
      }

      // Newest message goes at the front of the newest (first) page.
      const [newest, ...rest] = data.pages;
      return {
        ...data,
        pages: [{ ...newest, items: [message, ...newest.items] }, ...rest],
      };
    },
  );

  queryClient.setQueryData<ConversationSummary>(conversationKey(message.conversationId), (prev) =>
    prev ? { ...prev, lastMessage: message, lastMessageAt: message.sentAt } : prev,
  );
}

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ConversationSummary[]>("/chat/conversations");
      return res.data;
    },
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKey(id),
    queryFn: async () => {
      const res = await apiClient.get<ConversationSummary>(`/chat/conversations/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

// Newest-first pages; `before` is the previous page's cursor, so "next page"
// here means "older messages".
export function useConversationMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messagesKey(conversationId),
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const res = await apiClient.get<MessagePage>(`/chat/conversations/${conversationId}/messages`, {
        params: pageParam ? { before: pageParam } : undefined,
      });
      return res.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: Boolean(conversationId),
  });
}

export function useStartDirectConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: StartDirectConversationRequest) => {
      const res = await apiClient.post<ConversationSummary>("/chat/conversations/direct", body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(conversationKey(data.id), data);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateGroupConversationRequest) => {
      const res = await apiClient.post<ConversationSummary>("/chat/conversations/group", body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(conversationKey(data.id), data);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useSendChatMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SendMessageRequest) => {
      const res = await apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, body);
      return res.data;
    },
    onSuccess: (message) => {
      upsertMessageInCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useEditChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, ...body }: EditMessageRequest & { messageId: string }) => {
      const res = await apiClient.put<ChatMessage>(`/chat/messages/${messageId}`, body);
      return res.data;
    },
    onSuccess: (message) => {
      upsertMessageInCache(queryClient, message);
    },
  });
}

export function useDeleteChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.delete<ChatMessage>(`/chat/messages/${messageId}`);
      return res.data;
    },
    onSuccess: (message) => {
      upsertMessageInCache(queryClient, message);
    },
  });
}

export function useMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/chat/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.setQueryData<ConversationSummary>(conversationKey(conversationId), (prev) =>
        prev ? { ...prev, unreadCount: 0 } : prev,
      );
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useAddChatParticipants(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const res = await apiClient.post<ConversationSummary>(
        `/chat/conversations/${conversationId}/participants`,
        { userIds },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(conversationKey(conversationId), data);
    },
  });
}

export function useRemoveChatParticipant(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}
