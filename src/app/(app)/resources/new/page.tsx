"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateResource } from "@/hooks/use-resources";
import { createResourceSchema, type CreateResourceFormValues } from "@/lib/validation/resources";
import { isPhysicalResourceType } from "@/lib/types/resources";
import { ApiError } from "@/lib/http/api-client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubjectCombobox } from "@/components/shared/subject-combobox";
import type { SubjectSummary } from "@/lib/types/subjects";

export default function NewResourcePage() {
  const router = useRouter();
  const createResource = useCreateResource();
  const [subject, setSubject] = useState<SubjectSummary>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { type: "DigitalPdf", visibility: "Institution" },
  });

  const type = watch("type");
  const isPhysical = isPhysicalResourceType(type);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createResource.mutateAsync({
        ...values,
        fileUrl: values.fileUrl || undefined,
        pickupLocation: values.pickupLocation || undefined,
        subjectId: subject?.id,
        // Physical items can only realistically hand off in person, so the
        // backend (Resource.CanBeSharedAcrossInstitutions) pins them to the
        // owner's own campus regardless of what's picked here.
        visibility: isPhysical ? "Institution" : values.visibility,
      });
      toast.success("Resource shared");
      router.push("/resources/mine");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create this listing");
    }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Share a resource</h1>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="e.g. Intro to Algorithms, 3rd ed." />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" {...register("type")}>
              <optgroup label="Digital">
                <option value="DigitalPdf">PDF</option>
                <option value="DigitalSlides">Slides</option>
                <option value="DigitalVideo">Video</option>
                <option value="DigitalOther">Other digital file</option>
              </optgroup>
              <optgroup label="Physical (in-person hand-off)">
                <option value="PhysicalBook">Book</option>
                <option value="PhysicalNotes">Notes</option>
                <option value="PhysicalEquipment">Equipment</option>
              </optgroup>
            </Select>
          </div>

          {isPhysical ? (
            <>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select id="condition" {...register("condition")}>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Worn">Worn</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="pickupLocation">Pickup location</Label>
                <Input id="pickupLocation" {...register("pickupLocation")} placeholder="e.g. Library, Block C" />
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="fileUrl">File link</Label>
              <Input id="fileUrl" {...register("fileUrl")} placeholder="https://…" />
              {errors.fileUrl && <p className="mt-1 text-xs text-red-600">{errors.fileUrl.message}</p>}
            </div>
          )}

          <div>
            <Label>Subject</Label>
            <SubjectCombobox
              selected={subject ? [subject] : []}
              onChange={(subs) => setSubject(subs[0])}
              multiple={false}
              placeholder="What subject is this for?"
            />
          </div>

          {!isPhysical && (
            <div>
              <Label htmlFor="visibility">Who can see this</Label>
              <Select id="visibility" {...register("visibility")}>
                <option value="Institution">My school only</option>
                <option value="PartnerInstitutions">My school + partner schools</option>
                <option value="Global">Every verified student</option>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={createResource.isPending}>
            Share resource
          </Button>
        </form>
      </Card>
    </div>
  );
}
