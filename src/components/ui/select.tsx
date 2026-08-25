import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          // See Input for why text-base below sm — same iOS zoom-on-focus issue.
          "h-10 w-full appearance-none rounded-2xl border border-transparent bg-slate-100 px-3.5 pr-8 text-base text-slate-900 transition-colors focus-visible:border-mint-300 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:bg-slate-900",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  ),
);
Select.displayName = "Select";
