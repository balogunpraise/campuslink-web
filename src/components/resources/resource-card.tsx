import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResourceTypeIcon, resourceTypeLabel } from "@/components/resources/resource-type-label";
import type { ResourceSummary } from "@/lib/types/resources";

export function ResourceCard({ resource }: { resource: ResourceSummary }) {
  return (
    <Link href={`/resources/${resource.id}`}>
      <Card interactive className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint-500">
              <ResourceTypeIcon type={resource.type} className="h-4 w-4 text-white" />
            </span>
            <span className="text-xs font-semibold text-slate-500">{resourceTypeLabel(resource.type)}</span>
          </div>
          {!resource.isAvailable && <Badge variant="neutral">Unavailable</Badge>}
        </div>
        <h3 className="mt-3 line-clamp-2 font-bold text-slate-900 dark:text-slate-100">
          {resource.title}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{resource.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {resource.subject && <Badge variant="emerald">{resource.subject.name}</Badge>}
          <span>{resource.isSameInstitution ? resource.institutionName : `${resource.institutionName} (partner school)`}</span>
        </div>
        {resource.pickupLocation && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
            {resource.pickupLocation}
          </div>
        )}
      </Card>
    </Link>
  );
}
