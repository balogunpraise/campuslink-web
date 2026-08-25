export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PageRequest {
  page?: number;
  pageSize?: number;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

export type VisibilityScope = "Institution" | "PartnerInstitutions" | "Global";
export type MeetingMode = "InPerson" | "Online" | "Hybrid";
