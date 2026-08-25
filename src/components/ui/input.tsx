import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        // text-base (16px) below sm: iOS Safari auto-zooms the page on focus
        // for any input under 16px, which reads as a website glitching, not
        // an app. Reverts to the tighter text-sm past the sm breakpoint.
        "h-10 w-full rounded-2xl border border-transparent bg-slate-100 px-3.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-mint-300 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:bg-slate-900",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
