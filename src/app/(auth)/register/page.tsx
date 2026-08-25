"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkle } from "lucide-react";
import { useRegister } from "@/hooks/use-auth";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { ApiError } from "@/lib/http/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InstitutionPicker } from "@/components/auth/institution-picker";
import type { InstitutionSummary } from "@/lib/types/institutions";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [institution, setInstitution] = useState<InstitutionSummary>();

  const {
    register: field,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const email = watch("email") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register.mutateAsync({
        ...values,
        institutionId: institution?.id,
      });
      toast.success("Welcome to CampusLink!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-[max(3rem,env(safe-area-inset-top))] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-500">
              <Sparkle className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">CampusLink</p>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Share resources and find study buddies on your campus, or beyond it.
          </p>
        </div>

        <Card className="rounded-3xl shadow-lg shadow-slate-900/[0.04]">
          <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...field("firstName")} />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...field("lastName")} />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="userName">Username</Label>
            <Input id="userName" {...field("userName")} />
            {errors.userName && <p className="mt-1 text-xs text-red-600">{errors.userName.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">School or personal email</Label>
            <Input id="email" type="email" {...field("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Label>School</Label>
            <InstitutionPicker
              email={email}
              value={institution?.id}
              onChange={(inst) => {
                setInstitution(inst);
                setValue("institutionId", inst?.id);
              }}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...field("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...field("department")} />
            </div>
            <div>
              <Label htmlFor="yearOfStudy">Year of study</Label>
              <Input id="yearOfStudy" type="number" min={0} max={10} {...field("yearOfStudy")} />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={register.isPending}>
            Create account
          </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-mint-700 hover:underline dark:text-mint-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
