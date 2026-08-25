import type { PageRequest } from "./common";

export interface InstitutionSearchRequest extends PageRequest {
  search?: string;
  countryCode?: string;
  verifiedOnly?: boolean;
}

export interface InstitutionSummary {
  id: string;
  name: string;
  slug: string;
  shortName?: string;
  type: string;
  countryCode: string;
  state?: string;
  city?: string;
  logoUrl?: string;
  isVerified: boolean;
}

export interface InstitutionDetail extends InstitutionSummary {
  websiteUrl?: string;
  timeZoneId?: string;
  allowsCrossInstitutionSharing: boolean;
  emailDomains: string[];
  memberCount: number;
}

export interface CountrySummary {
  countryCode: string;
  institutionCount: number;
}

export interface InstitutionResolveResponse {
  resolved: boolean;
  domain?: string;
  institution?: InstitutionSummary;
  message?: string;
}

export interface ProposeInstitutionRequest {
  name: string;
  countryCode: string;
  type?: string;
  shortName?: string;
  city?: string;
  state?: string;
  websiteUrl?: string;
  emailDomain?: string;
}
