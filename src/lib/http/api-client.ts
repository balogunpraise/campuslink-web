import axios from "axios";

// Client-side axios instance. It only ever talks to our own same-origin
// /api/* Route Handlers — never the external CampusLink API directly — so
// there's no backend URL or bearer token in the browser bundle to leak.
//
// Same safety posture as the server client (see lib/server/backend-client.ts):
// a bounded timeout, and validateStatus left at axios's default (2xx only)
// since callers here use try/catch and want thrown errors for react-query.
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiErrorBody {
  title?: string;
  detail?: string;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError<ApiErrorBody>(error) && error.response) {
      const { status, data } = error.response;
      const message = data?.title || data?.detail || `Request failed with status ${status}`;
      return Promise.reject(new ApiError(status, message, data?.detail));
    }
    return Promise.reject(error);
  },
);
