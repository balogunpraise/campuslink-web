"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useStudyBuddyRequests } from "@/hooks/use-study-buddies";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { MatchCard } from "@/components/study-buddies/match-card";
import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/lib/types/study-buddies";

const TABS: { label: string; status?: MatchStatus }[] = [
  { label: "All" },
  { label: "Pending", status: "Pending" },
  { label: "Accepted", status: "Accepted" },
];

export default function StudyBuddyRequestsPage() {
  const [tab, setTab] = useState(0);
  const { data, isLoading, isError } = useStudyBuddyRequests(TABS[tab].status);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Study buddy requests</h1>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium text-slate-500",
              tab === i && "border-mint-600 text-mint-700 dark:text-mint-400",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <FullPageSpinner />}
      {isError && <EmptyState icon={Users} title="Couldn't load requests" />}
      {data && data.length === 0 && <EmptyState icon={Users} title="No requests here" />}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
