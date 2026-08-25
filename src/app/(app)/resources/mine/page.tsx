"use client";

import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { useMyResources } from "@/hooks/use-resources";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageSpinner } from "@/components/ui/spinner";
import { ResourceCard } from "@/components/resources/resource-card";

export default function MyResourcesPage() {
  const { data, isLoading, isError } = useMyResources();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">My resources</h1>
        <Link href="/resources/new">
          <Button>
            <Plus className="h-4 w-4" /> Share a resource
          </Button>
        </Link>
      </div>

      {isLoading && <FullPageSpinner />}

      {isError && (
        <EmptyState
          icon={Package}
          title="Couldn't load your listings"
          description="The resources API isn't available yet — this page is ready for it as soon as it is."
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={Package}
          title="Nothing shared yet"
          description="List a textbook, your notes, or a digital file for classmates to find."
          action={
            <Link href="/resources/new">
              <Button size="sm">Share your first resource</Button>
            </Link>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
