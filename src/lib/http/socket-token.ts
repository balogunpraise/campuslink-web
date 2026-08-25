import { apiClient } from "@/lib/http/api-client";

// Used as a SignalR `accessTokenFactory` — called on connect and on every
// reconnect, so the hub always signs in with a fresh token rather than one
// held (and potentially expired) in memory for the connection's lifetime.
export async function fetchSocketToken(): Promise<string> {
  const res = await apiClient.get<{ accessToken: string }>("/socket-token");
  return res.data.accessToken;
}
