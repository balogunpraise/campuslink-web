"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, UserPlus, Users } from "lucide-react";
import { useStudyBuddyCandidates, useStudyBuddyProfile } from "@/hooks/use-study-buddies";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { CandidateCard } from "@/components/study-buddies/candidate-card";
import { cn } from "@/lib/utils";

export default function StudyBuddiesPage() {
  const { data: profile, isLoading: profileLoading, isError: profileMissing } = useStudyBuddyProfile();
  const [sameInstitutionOnly, setSameInstitutionOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useStudyBuddyCandidates({
    sameInstitutionOnly,
    page,
    pageSize: 12,
  });

  if (profileLoading) return <FullPageSpinner />;

  if (profileMissing || !profile) {
    return (
      <EmptyState
        icon={Users}
        title="Set up your study buddy profile"
        description="Tell us what you're studying so we can match you with other students."
        action={
          <Link href="/study-buddies/profile">
            <Button size="sm">
              <UserPlus className="h-4 w-4" /> Create profile
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Study buddies</h1>
        <div className="flex gap-2">
          <Link href="/study-buddies/requests">
            <Button variant="outline">Requests</Button>
          </Link>
          <Link href="/study-buddies/profile">
            <Button variant="outline">
              <Settings className="h-4 w-4" /> My profile
            </Button>
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setSameInstitutionOnly((v) => !v);
          setPage(1);
        }}
        className={cn(
          "flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
          sameInstitutionOnly
            ? "border-transparent bg-slate-800 text-white"
            : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900",
        )}
      >
        My school only
      </button>

      {isLoading && <FullPageSpinner />}

      {isError && (
        <EmptyState icon={Users} title="Couldn't load candidates" description="Try again in a moment." />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No matches yet"
          description="Add more subjects to your profile to widen the search."
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((candidate) => (
              <CandidateCard key={candidate.userId} candidate={candidate} />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {data.page} of {data.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
