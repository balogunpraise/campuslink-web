import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 dark:bg-mint-950">
        <Icon className="h-7 w-7 text-mint-700 dark:text-mint-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
