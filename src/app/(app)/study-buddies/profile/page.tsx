"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStudyBuddyProfile, useUpsertStudyBuddyProfile } from "@/hooks/use-study-buddies";
import { ApiError } from "@/lib/http/api-client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/ui/spinner";
import { SubjectCombobox } from "@/components/shared/subject-combobox";
import type { SubjectSummary } from "@/lib/types/subjects";
import type { MeetingMode, VisibilityScope } from "@/lib/types/common";

export default function StudyBuddyProfilePage() {
  const { data: profile, isLoading } = useStudyBuddyProfile();
  const upsert = useUpsertStudyBuddyProfile();

  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [learningStyle, setLearningStyle] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [matchScope, setMatchScope] = useState<VisibilityScope>("Institution");
  const [preferredMeetingMode, setPreferredMeetingMode] = useState<MeetingMode>("InPerson");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (profile) {
      setSubjects(profile.subjects);
      setLearningStyle(profile.learningStyle ?? "");
      setAvailabilityNotes(profile.availabilityNotes ?? "");
      setMatchScope(profile.matchScope as VisibilityScope);
      setPreferredMeetingMode(profile.preferredMeetingMode as MeetingMode);
      setIsActive(profile.isActive);
    }
  }, [profile]);

  if (isLoading) return <FullPageSpinner />;

  async function save() {
    if (subjects.length === 0) {
      toast.error("Add at least one subject");
      return;
    }
    try {
      await upsert.mutateAsync({
        learningStyle: learningStyle || undefined,
        availabilityNotes: availabilityNotes || undefined,
        isActive,
        matchScope,
        preferredMeetingMode,
        subjectIds: subjects.map((s) => s.id),
        languageCodes: profile?.languageCodes ?? [],
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save your profile");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        Study buddy profile
      </h1>

      <Card className="space-y-4">
        <div>
          <Label>Subjects you want to study</Label>
          <SubjectCombobox selected={subjects} onChange={setSubjects} />
        </div>

        <div>
          <Label htmlFor="learningStyle">Learning style</Label>
          <Textarea
            id="learningStyle"
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            placeholder="e.g. I like working through problem sets together"
          />
        </div>

        <div>
          <Label htmlFor="availabilityNotes">Availability</Label>
          <Textarea
            id="availabilityNotes"
            value={availabilityNotes}
            onChange={(e) => setAvailabilityNotes(e.target.value)}
            placeholder="e.g. Weekday evenings, weekends"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="meetingMode">Preferred meeting mode</Label>
            <Select
              id="meetingMode"
              value={preferredMeetingMode}
              onChange={(e) => setPreferredMeetingMode(e.target.value as MeetingMode)}
            >
              <option value="InPerson">In person</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="matchScope">Who can find you</Label>
            <Select id="matchScope" value={matchScope} onChange={(e) => setMatchScope(e.target.value as VisibilityScope)}>
              <option value="Institution">My school only</option>
              <option value="PartnerInstitutions">My school + partner schools</option>
              <option value="Global">Every verified student</option>
            </Select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Actively looking for a study buddy
        </label>

        <Button className="w-full" onClick={save} isLoading={upsert.isPending}>
          Save profile
        </Button>
      </Card>
    </div>
  );
}
