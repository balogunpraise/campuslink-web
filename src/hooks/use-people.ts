import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type { PagedResult } from "@/lib/types/common";
import type { PeopleSearchRequest, PersonSummary, SendPersonRequestBody } from "@/lib/types/people";
import type { StudyBuddyMatchResponse } from "@/lib/types/study-buddies";

export function usePeopleSearch(request: PeopleSearchRequest) {
  return useQuery({
    queryKey: ["people", "search", request],
    queryFn: async () => {
      const res = await apiClient.get<PagedResult<PersonSummary>>("/people", { params: request });
      return res.data;
    },
    enabled: Boolean(request.search && request.search.trim().length > 0),
  });
}

export function useSendPersonStudyBuddyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, body }: { userId: string; body?: SendPersonRequestBody }) => {
      const res = await apiClient.post<StudyBuddyMatchResponse>(`/people/${userId}/study-buddy-request`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", "search"] });
      queryClient.invalidateQueries({ queryKey: ["study-buddies", "requests"] });
    },
  });
}
