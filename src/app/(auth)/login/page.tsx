"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { ApiError } from "@/lib/http/api-client";
import { Sparkle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      router.push(searchParams.get("next") || "/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed");
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-[max(1.5rem,env(safe-area-inset-top))] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-500">
              <Sparkle className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">CampusLink</p>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to keep sharing and studying together</p>
        </div>

        <Card className="rounded-3xl shadow-lg shadow-slate-900/[0.04]">
          <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Username, email, or phone</Label>
            <Input id="identifier" {...register("identifier")} />
            {errors.identifier && <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" isLoading={login.isPending}>
            Sign in
          </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to CampusLink?{" "}
          <Link href="/register" className="font-semibold text-mint-700 hover:underline dark:text-mint-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
