"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, PackageX, Trash2 } from "lucide-react";
import { useMe } from "@/hooks/use-auth";
import { useCreateShareRequest, useDeleteResource, useResource } from "@/hooks/use-resources";
import { ApiError } from "@/lib/http/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceTypeIcon, resourceTypeLabel } from "@/components/resources/resource-type-label";
import { isPhysicalResourceType } from "@/lib/types/resources";
import { formatDate, initials } from "@/lib/utils";

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: me } = useMe();
  const { data: resource, isLoading, isError } = useResource(id);
  const createShareRequest = useCreateShareRequest(id);
  const deleteResource = useDeleteResource();

  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (isLoading) return <FullPageSpinner />;

  if (isError || !resource) {
    return (
      <EmptyState
        icon={PackageX}
        title="Resource not found"
        description="It may have been removed, or the resources API isn't wired up yet."
      />
    );
  }

  const isOwner = me?.id === resource.owner.userId;
  const isPhysical = isPhysicalResourceType(resource.type);

  async function requestAccess() {
    try {
      await createShareRequest.mutateAsync({
        message: message || undefined,
        dueDate: isPhysical && dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      toast.success(isPhysical ? "Borrow request sent" : "Access request sent");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send request");
    }
  }

  async function remove() {
    if (!confirm("Remove this listing?")) return;
    try {
      await deleteResource.mutateAsync(resource!.id);
      toast.success("Listing removed");
      router.push("/resources/mine");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove this listing");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ResourceTypeIcon type={resource.type} className="h-4 w-4" />
            {resourceTypeLabel(resource.type)}
          </div>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={remove} isLoading={deleteResource.isPending}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>

        <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {resource.title}
        </h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
          {resource.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {resource.subject && <Badge variant="emerald">{resource.subject.name}</Badge>}
          {resource.condition && <Badge variant="neutral">Condition: {resource.condition}</Badge>}
          <Badge variant={resource.isAvailable ? "emerald" : "neutral"}>
            {resource.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>

        {resource.pickupLocation && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4" /> {resource.pickupLocation}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Avatar
            size="sm"
            initials={(() => {
              const [first, last] = resource.owner.fullName.split(" ");
              return initials(first, last);
            })()}
          />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {resource.owner.fullName}
            </p>
            <p className="text-xs text-slate-500">
              {resource.institutionName} · Shared {formatDate(resource.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {!isOwner && resource.isAvailable && (
        <Card>
          <h2 className="font-medium text-slate-900 dark:text-slate-100">
            {isPhysical ? "Request to borrow" : "Request access"}
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let them know why you need it…"
              />
            </div>
            {isPhysical && (
              <div>
                <Label htmlFor="dueDate">When will you return it?</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            )}
            <Button onClick={requestAccess} isLoading={createShareRequest.isPending}>
              Send request
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
