import axios from "axios";

// Server-only. Never prefixed with NEXT_PUBLIC_, so it can't end up in the
// client bundle — the browser only ever talks to our own /api/* routes.
const BACKEND_API_URL = process.env.BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is not set");
}

// One axios instance, used only from Route Handlers (Node runtime), for
// calling the external CampusLink .NET API.
//
// Safety choices, deliberate:
// - maxRedirects: 0 — the backend URL is trusted, but a client that silently
//   follows redirects is how axios SSRF/credential-leak CVEs happen; there's
//   no legitimate reason our own API host would redirect us anywhere.
// - validateStatus always true — we forward the backend's status code as-is
//   instead of throwing, so route handlers use one plain if/else instead of
//   try/catch-and-guess, and never leak an axios stack trace to the client.
// - a hard timeout — an external call must never hang a request indefinitely.
export const backendClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10_000,
  maxRedirects: 0,
  validateStatus: () => true,
  headers: {
    "Content-Type": "application/json",
  },
});
