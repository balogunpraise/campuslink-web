"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, MessageCircle, Search, Sparkle, Users } from "lucide-react";
import { useMe, useLogout } from "@/hooks/use-auth";
import { useConversations } from "@/hooks/use-chat";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, initials } from "@/lib/utils";

// `mobileLabel` is shorter on purpose: the bottom tab bar gives each item a
// fifth of the screen width, and a two-word label like "Study Buddies" wraps
// there at 11px — which breaks the row's height and is the fastest way for a
// tab bar to stop reading as one. The top nav has room, so it keeps the full
// label.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/resources", label: "Resources", mobileLabel: "Resources", icon: BookOpen },
  { href: "/study-buddies", label: "Study Buddies", mobileLabel: "Buddies", icon: Users },
  { href: "/people", label: "People", mobileLabel: "People", icon: Search },
  { href: "/chat", label: "Chat", mobileLabel: "Chat", icon: MessageCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();
  const { data: conversations } = useConversations();
  const unreadCount = conversations?.reduce((total, c) => total + c.unreadCount, 0) ?? 0;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-500">
                <Sparkle className="h-4 w-4 text-white" fill="currentColor" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                CampusLink
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                    pathname.startsWith(href) && "bg-slate-800 text-white shadow-sm hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {href === "/chat" && unreadCount > 0 && <Badge variant="gradient">{unreadCount}</Badge>}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm font-medium text-slate-500 sm:inline">{user.institutionName}</span>
            )}
            <Avatar initials={user ? initials(user.firstName, user.lastName) : "?"} size="sm" />
            <button
              onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-slate-200/70 bg-white/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg sm:hidden dark:border-slate-800 dark:bg-slate-950/90">
        {NAV_ITEMS.map(({ href, mobileLabel, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-slate-500 dark:text-slate-400"
            >
              <span
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  active && "bg-slate-800 text-white",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {href === "/chat" && unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-mint-500" />
                )}
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-[11px] font-semibold",
                  active && "text-mint-700 dark:text-mint-400",
                )}
              >
                {mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
