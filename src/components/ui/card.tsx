import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-mint-300 hover:shadow-lg hover:shadow-mint-900/[0.06] dark:hover:border-mint-800",
        className,
      )}
      {...props}
    />
  );
}
