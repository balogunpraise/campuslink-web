import type { MeetingMode, PageRequest } from "./common";
import type { SubjectSummary } from "./subjects";

// Mirrors CampusLink.Core.Application.Dtos.People.PeopleDtos. Distinct from
// study-buddy candidates: that finds people who share your interests, this
// finds a specific person by name — see PeopleController.cs.
export interface PeopleSearchRequest extends PageRequest {
  /** Name, username, or a fragment of either. Typo-tolerant. */
  search?: string;
  institutionId?: string;
  sameInstitutionOnly?: boolean;
  department?: string;
  yearOfStudy?: number;
  subjectId?: string;
  studyBuddiesOnly?: boolean;
}

export interface PersonSummary {
  userId: string;
  userName: string;
  fullName: string;
  bio?: string;
  profilePictureUrl?: string;
  institutionId: string;
  institutionName: string;
  countryCode?: string;
  isSameInstitution: boolean;
  department?: string;
  yearOfStudy: number;
  hasStudyBuddyProfile: boolean;
  isOpenToStudyBuddies: boolean;
  sharedSubjects: SubjectSummary[];
  subjects: SubjectSummary[];
  existingMatchStatus?: string | null;
  canSendRequest: boolean;
  cannotSendReason?: string;
}

export interface SendPersonRequestBody {
  subjectId?: string;
  courseId?: string;
  meetingMode?: MeetingMode;
  message?: string;
}
