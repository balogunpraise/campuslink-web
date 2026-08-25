"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSubjectSearch } from "@/hooks/use-subjects";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SubjectSummary } from "@/lib/types/subjects";

interface SubjectComboboxProps {
  selected: SubjectSummary[];
  onChange: (subjects: SubjectSummary[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

// Free-text search against /api/subjects (SubjectsController.Search), the
// shared taxonomy study-buddy matching and resource tagging both key off.
export function SubjectCombobox({
  selected,
  onChange,
  multiple = true,
  placeholder = "Search subjects…",
}: SubjectComboboxProps) {
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useSubjectSearch(query);
  const selectedIds = new Set(selected.map((s) => s.id));

  function toggle(subject: SubjectSummary) {
    if (selectedIds.has(subject.id)) {
      onChange(selected.filter((s) => s.id !== subject.id));
    } else {
      onChange(multiple ? [...selected, subject] : [subject]);
      if (!multiple) setQuery("");
    }
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge key={s.id} variant="emerald" className="gap-1">
              {s.name}
              <button type="button" onClick={() => toggle(s)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
      {isFetching && <p className="text-xs text-slate-500">Searching…</p>}
      {results && results.length > 0 && (
        <ul className="max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {results.map((subject) => (
            <li key={subject.id}>
              <button
                type="button"
                onClick={() => toggle(subject)}
                className={`w-full px-3.5 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900 ${
                  selectedIds.has(subject.id) ? "bg-mint-50 font-medium text-mint-800 dark:bg-mint-950 dark:text-mint-300" : ""
                }`}
              >
                {subject.name}
                {subject.field && <span className="text-slate-400"> · {subject.field}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
