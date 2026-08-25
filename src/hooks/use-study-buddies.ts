import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type { PagedResult } from "@/lib/types/common";
import type {
  MatchStatus,
  SendStudyBuddyRequestRequest,
  StudyBuddyCandidate,
  StudyBuddyCandidateRequest,
  StudyBuddyMatchResponse,
  StudyBuddyProfileResponse,
  UpsertStudyBuddyProfileRequest,
} from "@/lib/types/study-buddies";

const PROFILE_KEY = ["study-buddies", "profile"] as const;
const MATCHES_KEY = ["study-buddies", "requests"] as const;

export function useStudyBuddyProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await apiClient.get<StudyBuddyProfileResponse>("/study-buddies/profile");
      return res.data;
    },
    retry: false,
  });
}

export function useUpsertStudyBuddyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpsertStudyBuddyProfileRequest) => {
      const res = await apiClient.put<StudyBuddyProfileResponse>("/study-buddies/profile", body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_KEY, data);
    },
  });
}

// Repeated query keys (subjectIds) are built as a URLSearchParams instance so
// each id is sent as its own `subjectIds=` entry — matching how ASP.NET Core
// model-binds a List<Guid> from [FromQuery]. A plain object here would only
// keep the last value.
export function useStudyBuddyCandidates(request: StudyBuddyCandidateRequest) {
  return useQuery({
    queryKey: ["study-buddies", "candidates", request],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (request.page) params.set("page", String(request.page));
      if (request.pageSize) params.set("pageSize", String(request.pageSize));
      if (request.meetingMode) params.set("meetingMode", request.meetingMode);
      if (request.sameInstitutionOnly) params.set("sameInstitutionOnly", "true");
      for (const id of request.subjectIds ?? []) params.append("subjectIds", id);

      const res = await apiClient.get<PagedResult<StudyBuddyCandidate>>("/study-buddies/candidates", {
        params,
      });
      return res.data;
    },
  });
}

export function useStudyBuddyRequests(status?: MatchStatus) {
  return useQuery({
    queryKey: [...MATCHES_KEY, status ?? "all"],
    queryFn: async () => {
      const res = await apiClient.get<StudyBuddyMatchResponse[]>("/study-buddies/requests", {
        params: status ? { status } : undefined,
      });
      return res.data;
    },
  });
}

export function useSendStudyBuddyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SendStudyBuddyRequestRequest) => {
      const res = await apiClient.post<StudyBuddyMatchResponse>("/study-buddies/requests", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: ["study-buddies", "candidates"] });
    },
  });
}

export function useRespondToStudyBuddyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const res = await apiClient.post<StudyBuddyMatchResponse>(
        `/study-buddies/requests/${id}/respond`,
        { accept },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}

export function useEndStudyBuddyMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<StudyBuddyMatchResponse>(`/study-buddies/requests/${id}/end`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}
