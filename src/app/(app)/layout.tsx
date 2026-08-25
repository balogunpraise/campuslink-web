import { Navbar } from "@/components/layout/navbar";
import { RealtimeShell } from "@/providers/realtime-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-8">
        <RealtimeShell>{children}</RealtimeShell>
      </main>
    </div>
  );
}
