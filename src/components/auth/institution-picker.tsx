"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { useInstitutionSearch, useResolveInstitution } from "@/hooks/use-institutions";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { InstitutionSummary } from "@/lib/types/institutions";

interface InstitutionPickerProps {
  email: string;
  value?: string;
  onChange: (institution: InstitutionSummary | undefined) => void;
}

// Mirrors the sign-up flow the backend was built for: resolve the school from
// the student's email domain first (InstitutionsController.Resolve), and only
// fall back to a manual search when that comes back empty.
export function InstitutionPicker({ email, value, onChange }: InstitutionPickerProps) {
  const [manualSearch, setManualSearch] = useState(false);
  const [query, setQuery] = useState("");

  const { data: resolved, isFetching: isResolving } = useResolveInstitution(email, !manualSearch);
  const { data: results, isFetching: isSearching } = useInstitutionSearch(
    { search: query, pageSize: 8 },
    manualSearch && query.length > 1,
  );

  useEffect(() => {
    if (!manualSearch && resolved?.resolved && resolved.institution) {
      onChange(resolved.institution);
    }
    // Only re-run when the resolved institution identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved?.institution?.id, resolved?.resolved, manualSearch]);

  if (!manualSearch && resolved?.resolved && resolved.institution) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-mint-300 bg-mint-50 px-3.5 py-2.5 text-sm dark:border-mint-900 dark:bg-mint-950">
        <span className="flex items-center gap-2 text-mint-800 dark:text-mint-300">
          <CheckCircle2 className="h-4 w-4" />
          Detected school: <strong>{resolved.institution.name}</strong>
        </span>
        <button
          type="button"
          onClick={() => setManualSearch(true)}
          className="text-xs font-semibold text-mint-700 underline dark:text-mint-400"
        >
          Not this?
        </button>
      </div>
    );
  }

  if (!manualSearch && isResolving && email.includes("@")) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner className="h-4 w-4" /> Looking up your school…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!manualSearch && email.includes("@") && (
        <p className="text-xs text-slate-500">
          We couldn&apos;t match your school from that email. Search for it below.
        </p>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search for your school"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setManualSearch(true);
          }}
        />
      </div>
      {isSearching && <p className="text-xs text-slate-500">Searching…</p>}
      {results && results.items.length > 0 && (
        <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {results.items.map((institution) => (
            <li key={institution.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(institution);
                  setQuery(institution.name);
                }}
                className={`w-full px-3.5 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900 ${
                  value === institution.id ? "bg-mint-50 font-medium text-mint-800 dark:bg-mint-950 dark:text-mint-300" : ""
                }`}
              >
                {institution.name}
                {institution.city && (
                  <span className="text-slate-400"> · {institution.city}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {manualSearch && query.length > 1 && results && results.items.length === 0 && !isSearching && (
        <p className="text-xs text-slate-500">
          No matches. If your school really isn&apos;t listed, you can add it after signing up.
        </p>
      )}
    </div>
  );
}
