import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type { PagedResult } from "@/lib/types/common";
import type {
  CreateResourceRequest,
  CreateShareRequestRequest,
  ResourceSearchRequest,
  ResourceShareRequestSummary,
  ResourceSummary,
  RespondToShareRequestRequest,
} from "@/lib/types/resources";

const SHARE_REQUESTS_KEY = ["resources", "share-requests"] as const;

export function useResourceSearch(request: ResourceSearchRequest) {
  return useQuery({
    queryKey: ["resources", "search", request],
    queryFn: async () => {
      const res = await apiClient.get<PagedResult<ResourceSummary>>("/resources", { params: request });
      return res.data;
    },
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ["resources", id],
    queryFn: async () => {
      const res = await apiClient.get<ResourceSummary>(`/resources/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useMyResources() {
  return useQuery({
    queryKey: ["resources", "mine"],
    queryFn: async () => {
      const res = await apiClient.get<PagedResult<ResourceSummary>>("/resources/mine");
      return res.data;
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateResourceRequest) => {
      const res = await apiClient.post<ResourceSummary>("/resources", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", "search"] });
      queryClient.invalidateQueries({ queryKey: ["resources", "mine"] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", "search"] });
      queryClient.invalidateQueries({ queryKey: ["resources", "mine"] });
    },
  });
}

export function useCreateShareRequest(resourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateShareRequestRequest) => {
      const res = await apiClient.post<ResourceShareRequestSummary>(
        `/resources/${resourceId}/share-requests`,
        body,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["resources", resourceId] });
    },
  });
}

export function useShareRequests(status?: string) {
  return useQuery({
    queryKey: [...SHARE_REQUESTS_KEY, status ?? "all"],
    queryFn: async () => {
      const res = await apiClient.get<ResourceShareRequestSummary[]>("/resources/share-requests", {
        params: status ? { status } : undefined,
      });
      return res.data;
    },
  });
}

function useShareRequestAction(action: "respond" | "handover" | "return" | "dispute") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body?: RespondToShareRequestRequest | { reason: string } }) => {
      const res = await apiClient.post<ResourceShareRequestSummary>(
        `/resources/share-requests/${id}/${action}`,
        body,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_REQUESTS_KEY });
    },
  });
}

export const useRespondToShareRequest = () => useShareRequestAction("respond");
export const useConfirmHandover = () => useShareRequestAction("handover");
export const useConfirmReturn = () => useShareRequestAction("return");
export const useDisputeShareRequest = () => useShareRequestAction("dispute");
