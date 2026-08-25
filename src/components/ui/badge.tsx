import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        emerald: "bg-mint-100 text-mint-800 dark:bg-mint-950 dark:text-mint-200",
        amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
        gradient: "bg-mint-500 text-white",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function statusBadgeVariant(status: string): BadgeProps["variant"] {
  switch (status) {
    case "Accepted":
    case "Approved":
    case "Completed":
    case "OnLoan":
      return "emerald";
    case "Pending":
    case "AwaitingHandover":
    case "AwaitingReturn":
      return "amber";
    case "Declined":
    case "Rejected":
    case "Cancelled":
    case "Overdue":
    case "Disputed":
      return "red";
    default:
      return "neutral";
  }
}
