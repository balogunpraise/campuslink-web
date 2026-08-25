"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { usePeopleSearch } from "@/hooks/use-people";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { PersonCard } from "@/components/people/person-card";
import { cn } from "@/lib/utils";

export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sameInstitutionOnly, setSameInstitutionOnly] = useState(false);
  const [page, setPage] = useState(1);

  // A short debounce so search-as-you-type doesn't fire a request per
  // keystroke — the only place in this app that searches free text against a
  // person directory rather than a fixed list.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data, isLoading, isFetching, isError } = usePeopleSearch({
    search,
    sameInstitutionOnly,
    page,
    pageSize: 12,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        Find people
      </h1>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username…"
          className="pl-10"
          autoFocus
        />
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

      {!search && (
        <EmptyState
          icon={SearchIcon}
          title="Search for someone"
          description="Start typing a name or username to find people on CampusLink."
        />
      )}

      {search && isLoading && <FullPageSpinner />}

      {search && isError && (
        <EmptyState icon={SearchIcon} title="Couldn't search right now" description="Try again in a moment." />
      )}

      {search && data && data.items.length === 0 && !isFetching && (
        <EmptyState icon={SearchIcon} title="No one found" description="Try a different name or username." />
      )}

      {search && data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((person) => (
              <PersonCard key={person.userId} person={person} />
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
