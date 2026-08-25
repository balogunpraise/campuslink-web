import type { PageRequest, VisibilityScope } from "./common";
import type { SubjectSummary } from "./subjects";

// Mirrors CampusLink.Core.Domain.Enums.ResourceType / ResourceCondition /
// ShareRequestStatus. Kept in lockstep with the backend enum until it has its
// own DTO layer — see README "Backend gaps".
export type ResourceType =
  | "PhysicalBook"
  | "PhysicalNotes"
  | "PhysicalEquipment"
  | "DigitalPdf"
  | "DigitalSlides"
  | "DigitalVideo"
  | "DigitalOther";

export type ResourceCondition = "New" | "Good" | "Fair" | "Worn";

export type ShareRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled"
  | "Overdue"
  | "AwaitingHandover"
  | "OnLoan"
  | "AwaitingReturn"
  | "Disputed";

export const PHYSICAL_RESOURCE_TYPES: ResourceType[] = [
  "PhysicalBook",
  "PhysicalNotes",
  "PhysicalEquipment",
];

export function isPhysicalResourceType(type: ResourceType): boolean {
  return (PHYSICAL_RESOURCE_TYPES as string[]).includes(type);
}

export interface ResourceOwnerSummary {
  userId: string;
  fullName: string;
  userName: string;
  profilePictureUrl?: string;
}

export interface ResourceSummary {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  fileUrl?: string;
  condition?: ResourceCondition;
  owner: ResourceOwnerSummary;
  institutionId: string;
  institutionName: string;
  subject?: SubjectSummary;
  visibility: VisibilityScope;
  pickupLocation?: string;
  isAvailable: boolean;
  isSameInstitution: boolean;
  createdAt: string;
}

export interface ResourceSearchRequest extends PageRequest {
  search?: string;
  type?: ResourceType;
  subjectId?: string;
  sameInstitutionOnly?: boolean;
  availableOnly?: boolean;
}

export interface CreateResourceRequest {
  title: string;
  description: string;
  type: ResourceType;
  fileUrl?: string;
  condition?: ResourceCondition;
  courseId?: string;
  subjectId?: string;
  visibility: VisibilityScope;
  pickupLocation?: string;
}

export interface ResourceShareRequestSummary {
  id: string;
  resourceId: string;
  resourceTitle: string;
  resourceType: ResourceType;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  isCrossInstitution: boolean;
  status: ShareRequestStatus;
  requestedAt: string;
  respondedAt?: string;
  ownerConfirmedHandoverAt?: string;
  borrowerConfirmedReceiptAt?: string;
  borrowerConfirmedReturnAt?: string;
  ownerConfirmedReturnAt?: string;
  dueDate?: string;
  returnedAt?: string;
  disputedAt?: string;
  disputeReason?: string;
  notes?: string;
  isOutgoing: boolean;
}

export interface CreateShareRequestRequest {
  message?: string;
  dueDate?: string;
}

export interface RespondToShareRequestRequest {
  accept: boolean;
}

export interface RaiseDisputeRequest {
  reason: string;
}
