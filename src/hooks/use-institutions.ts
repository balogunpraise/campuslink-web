import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type { PagedResult } from "@/lib/types/common";
import type {
  InstitutionResolveResponse,
  InstitutionSearchRequest,
  InstitutionSummary,
  ProposeInstitutionRequest,
} from "@/lib/types/institutions";

export function useInstitutionSearch(request: InstitutionSearchRequest, enabled = true) {
  return useQuery({
    queryKey: ["institutions", "search", request],
    queryFn: async () => {
      const res = await apiClient.get<PagedResult<InstitutionSummary>>("/institutions", {
        params: request,
      });
      return res.data;
    },
    enabled,
  });
}

export function useResolveInstitution(email: string, enabled: boolean) {
  return useQuery({
    queryKey: ["institutions", "resolve", email],
    queryFn: async () => {
      const res = await apiClient.get<InstitutionResolveResponse>("/institutions/resolve", {
        params: { email },
      });
      return res.data;
    },
    enabled: enabled && email.includes("@"),
    staleTime: 60_000,
  });
}

export function useProposeInstitution() {
  return useMutation({
    mutationFn: async (body: ProposeInstitutionRequest) => {
      const res = await apiClient.post<InstitutionSummary>("/institutions/proposals", body);
      return res.data;
    },
  });
}
