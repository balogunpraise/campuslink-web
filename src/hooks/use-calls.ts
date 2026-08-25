import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/http/api-client";
import type { CallResponse, IceServersResponse } from "@/lib/types/calls";

// A live call in progress that the caller hasn't joined isn't an error state
// for this query — react-query would otherwise spend retries and log noise
// on the 404 every page-load produces when no call is active.
export function useActiveCallForConversation(conversationId: string) {
  return useQuery({
    queryKey: ["calls", "active", conversationId],
    queryFn: async () => {
      try {
        const res = await apiClient.get<CallResponse>(`/calls/conversations/${conversationId}/active`);
        return res.data;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: Boolean(conversationId),
    refetchInterval: 15_000,
  });
}

export function useCallHistory(conversationId: string) {
  return useQuery({
    queryKey: ["calls", "history", conversationId],
    queryFn: async () => {
      const res = await apiClient.get<CallResponse[]>(`/calls/conversations/${conversationId}/history`);
      return res.data;
    },
    enabled: Boolean(conversationId),
  });
}

// Not a hook: called imperatively right before building a peer connection,
// since ICE credentials are short-lived and per-call rather than something to
// hold in a cache.
export async function fetchIceServers(): Promise<IceServersResponse> {
  const res = await apiClient.get<IceServersResponse>("/calls/ice-servers");
  return res.data;
}
