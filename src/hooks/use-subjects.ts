import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type { SubjectSummary } from "@/lib/types/subjects";

export function useSubjectSearch(search: string, field?: string) {
  return useQuery({
    queryKey: ["subjects", "search", search, field],
    queryFn: async () => {
      const res = await apiClient.get<SubjectSummary[]>("/subjects", {
        params: { search, field },
      });
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useSubjectFields() {
  return useQuery({
    queryKey: ["subjects", "fields"],
    queryFn: async () => {
      const res = await apiClient.get<string[]>("/subjects/fields");
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}
