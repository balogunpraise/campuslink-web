import { Phone, PhoneMissed, Video } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { CallResponse } from "@/lib/types/calls";

function endReasonLabel(call: CallResponse): string {
  if (call.status !== "Ended") return "In progress";
  switch (call.endReason) {
    case "NoAnswer":
      return "No answer";
    case "Declined":
      return "Declined";
    case "Cancelled":
      return "Cancelled";
    case "Failed":
      return "Failed";
    default:
      return call.durationSeconds ? `${Math.round(call.durationSeconds / 60)} min` : "Completed";
  }
}

function isMissed(call: CallResponse): boolean {
  return call.status === "Ended" && (call.endReason === "NoAnswer" || call.endReason === "Declined");
}

export function CallHistoryList({ calls }: { calls: CallResponse[] }) {
  if (calls.length === 0) {
    return <p className="px-1 py-6 text-center text-sm text-slate-400">No calls yet</p>;
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {calls.map((call) => {
        const missed = isMissed(call);
        const Icon = call.type === "Video" ? Video : Phone;
        return (
          <div key={call.id} className="flex items-center gap-3 px-1 py-2.5">
            <span
              className={
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
                (missed ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
              }
            >
              {missed ? <PhoneMissed className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {call.startedByName}
              </p>
              <p className="text-xs text-slate-400">{formatDateTime(call.startedAt)}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-500">{endReasonLabel(call)}</span>
          </div>
        );
      })}
    </div>
  );
}
