import { z } from "zod";

export const createResourceSchema = z.object({
  title: z.string().min(3, "At least 3 characters").max(200),
  description: z.string().min(1, "Required").max(2000),
  type: z.enum([
    "PhysicalBook",
    "PhysicalNotes",
    "PhysicalEquipment",
    "DigitalPdf",
    "DigitalSlides",
    "DigitalVideo",
    "DigitalOther",
  ]),
  fileUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  condition: z.enum(["New", "Good", "Fair", "Worn"]).optional(),
  pickupLocation: z.string().max(200).optional().or(z.literal("")),
  visibility: z.enum(["Institution", "PartnerInstitutions", "Global"]),
});

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>;
