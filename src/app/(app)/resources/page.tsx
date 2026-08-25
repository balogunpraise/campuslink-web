"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Inbox } from "lucide-react";
import { useResourceSearch } from "@/hooks/use-resources";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceCard } from "@/components/resources/resource-card";
import { cn } from "@/lib/utils";
import type { ResourceType } from "@/lib/types/resources";

const TYPE_OPTIONS: { value: ResourceType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "PhysicalBook", label: "Physical book" },
  { value: "PhysicalNotes", label: "Physical notes" },
  { value: "PhysicalEquipment", label: "Equipment" },
  { value: "DigitalPdf", label: "PDF" },
  { value: "DigitalSlides", label: "Slides" },
  { value: "DigitalVideo", label: "Video" },
  { value: "DigitalOther", label: "Digital file" },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ResourceType | "">("");
  const [sameInstitutionOnly, setSameInstitutionOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useResourceSearch({
    search: search || undefined,
    type: type || undefined,
    sameInstitutionOnly,
    page,
    pageSize: 12,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Resources</h1>
        <Link href="/resources/new">
          <Button>
            <Plus className="h-4 w-4" /> Share a resource
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by title or description"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="sm:w-48"
          value={type}
          onChange={(e) => {
            setType(e.target.value as ResourceType | "");
            setPage(1);
          }}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => {
            setSameInstitutionOnly((v) => !v);
            setPage(1);
          }}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors sm:h-10",
            sameInstitutionOnly
              ? "border-transparent bg-slate-800 text-white"
              : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900",
          )}
        >
          My school only
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Inbox}
          title="Couldn't load resources"
          description="The resources API isn't available yet — this page is ready for it as soon as it is."
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState icon={Inbox} title="No resources found" description="Try a different search or filter." />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
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
