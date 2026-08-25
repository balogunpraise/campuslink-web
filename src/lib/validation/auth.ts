import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your username, email, or phone number"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "Required").max(64),
  lastName: z.string().min(1, "Required").max(64),
  userName: z.string().min(3, "At least 3 characters").max(64),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().max(32).optional().or(z.literal("")),
  password: z.string().min(8, "At least 8 characters").max(128),
  institutionId: z.string().uuid().optional(),
  studentNumber: z.string().max(32).optional().or(z.literal("")),
  department: z.string().max(128).optional().or(z.literal("")),
  yearOfStudy: z.coerce.number().int().min(0).max(10).optional(),
});

// z.coerce.number() (for yearOfStudy, since a native number input hands
// react-hook-form a string) makes this schema's input and output types
// diverge: the field holds a string pre-validation and a number after.
// zodResolver needs both — see register/page.tsx's useForm<Input, ..., Output>.
export type RegisterFormValues = z.input<typeof registerSchema>;
export type RegisterFormOutput = z.output<typeof registerSchema>;
