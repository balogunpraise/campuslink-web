import { BookOpen, FileText, Presentation, Video, Wrench } from "lucide-react";
import type { ResourceType } from "@/lib/types/resources";
import { isPhysicalResourceType } from "@/lib/types/resources";

const LABELS: Record<ResourceType, string> = {
  PhysicalBook: "Physical book",
  PhysicalNotes: "Physical notes",
  PhysicalEquipment: "Equipment",
  DigitalPdf: "PDF",
  DigitalSlides: "Slides",
  DigitalVideo: "Video",
  DigitalOther: "Digital file",
};

const ICONS: Record<ResourceType, typeof BookOpen> = {
  PhysicalBook: BookOpen,
  PhysicalNotes: FileText,
  PhysicalEquipment: Wrench,
  DigitalPdf: FileText,
  DigitalSlides: Presentation,
  DigitalVideo: Video,
  DigitalOther: FileText,
};

export function resourceTypeLabel(type: ResourceType) {
  return LABELS[type];
}

export function ResourceTypeIcon({ type, className }: { type: ResourceType; className?: string }) {
  const Icon = ICONS[type];
  return <Icon className={className} />;
}

export function ResourceTypeBadgeText(type: ResourceType) {
  return isPhysicalResourceType(type) ? `${LABELS[type]} · in person` : LABELS[type];
}
