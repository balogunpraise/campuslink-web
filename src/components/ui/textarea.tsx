import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        // See Input for why text-base below sm — same iOS zoom-on-focus issue.
        "min-h-24 w-full rounded-2xl border border-transparent bg-slate-100 px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-mint-300 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:bg-slate-900",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
