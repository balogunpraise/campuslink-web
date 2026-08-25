import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import type { LoginRequest, RegisterRequest, SessionResponse } from "@/lib/types/auth";

const ME_KEY = ["auth", "me"] as const;

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      const res = await apiClient.get<SessionResponse["user"]>("/auth/me");
      return res.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const res = await apiClient.post<SessionResponse>("/auth/login", body);
      return res.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(ME_KEY, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const res = await apiClient.post<SessionResponse>("/auth/register", body);
      return res.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(ME_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(ME_KEY, null);
      queryClient.clear();
    },
  });
}
