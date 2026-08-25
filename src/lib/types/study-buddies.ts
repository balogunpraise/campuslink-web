import type { MeetingMode, PageRequest, VisibilityScope } from "./common";
import type { SubjectSummary } from "./subjects";

export interface UpsertStudyBuddyProfileRequest {
  learningStyle?: string;
  availabilityNotes?: string;
  isActive: boolean;
  matchScope: VisibilityScope;
  preferredMeetingMode: MeetingMode;
  maxTimeZoneOffsetHours?: number;
  subjectIds: string[];
  languageCodes: string[];
}

export interface StudyBuddyProfileResponse {
  id: string;
  userId: string;
  userName: string;
  fullName: string;
  learningStyle?: string;
  availabilityNotes?: string;
  isActive: boolean;
  matchScope: string;
  preferredMeetingMode: string;
  maxTimeZoneOffsetHours?: number;
  institutionId: string;
  institutionName: string;
  subjects: SubjectSummary[];
  languageCodes: string[];
}

export interface StudyBuddyCandidateRequest extends PageRequest {
  subjectIds?: string[];
  meetingMode?: MeetingMode;
  sameInstitutionOnly?: boolean;
}

export interface StudyBuddyCandidate {
  userId: string;
  userName: string;
  fullName: string;
  bio?: string;
  profilePictureUrl?: string;
  institutionId: string;
  institutionName: string;
  isSameInstitution: boolean;
  learningStyle?: string;
  availabilityNotes?: string;
  preferredMeetingMode: string;
  sharedSubjects: SubjectSummary[];
  sharedSubjectCount: number;
  languageCodes: string[];
  existingMatchStatus?: string | null;
}

export interface SendStudyBuddyRequestRequest {
  recipientUserId: string;
  subjectId: string;
  courseId?: string;
  meetingMode?: MeetingMode;
  message?: string;
}

export type MatchStatus = "Pending" | "Accepted" | "Declined" | "Ended";

export interface StudyBuddyMatchResponse {
  id: string;
  status: MatchStatus;
  meetingMode: string;
  isCrossInstitution: boolean;
  // Null when the request was sent without picking a specific subject —
  // see PeopleController.SendRequest, which makes SubjectId optional.
  subject?: SubjectSummary;
  message?: string;
  counterpartUserId: string;
  counterpartUserName: string;
  counterpartFullName: string;
  counterpartInstitutionName: string;
  isOutgoing: boolean;
  requestedAt: string;
  respondedAt?: string;
  endedAt?: string;
}
