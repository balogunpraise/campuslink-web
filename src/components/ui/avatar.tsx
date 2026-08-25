import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "h-8 w-8", text: "text-[10px]" },
  md: { box: "h-10 w-10", text: "text-xs" },
  lg: { box: "h-14 w-14", text: "text-base" },
};

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { box, text } = SIZES[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-slate-800 ring-2 ring-white dark:bg-slate-700 dark:ring-slate-900",
        box,
        className,
      )}
    >
      <span className={cn("font-bold text-white", text)}>{initials}</span>
    </div>
  );
}
