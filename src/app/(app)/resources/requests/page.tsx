"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { useShareRequests } from "@/hooks/use-resources";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { ShareRequestCard } from "@/components/resources/share-request-card";
import { cn } from "@/lib/utils";
import type { ShareRequestStatus } from "@/lib/types/resources";

const TABS: { label: string; status?: ShareRequestStatus }[] = [
  { label: "All" },
  { label: "Pending", status: "Pending" },
  { label: "On loan", status: "OnLoan" },
  { label: "Completed", status: "Completed" },
];

export default function ResourceRequestsPage() {
  const [tab, setTab] = useState(0);
  const { data, isLoading, isError } = useShareRequests(TABS[tab].status);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Share requests</h1>

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

      {isError && (
        <EmptyState
          icon={Inbox}
          title="Couldn't load requests"
          description="The resources API isn't available yet — this page is ready for it as soon as it is."
        />
      )}

      {data && data.length === 0 && <EmptyState icon={Inbox} title="No requests here" />}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((request) => (
            <ShareRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
