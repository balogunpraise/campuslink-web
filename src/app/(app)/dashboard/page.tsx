"use client";

import Link from "next/link";
import { BookOpen, Handshake, Users } from "lucide-react";
import { useMe } from "@/hooks/use-auth";
import { useShareRequests } from "@/hooks/use-resources";
import { useStudyBuddyRequests } from "@/hooks/use-study-buddies";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TILES = [
  {
    href: "/resources",
    icon: BookOpen,
    title: "Browse resources",
    chip: "bg-mint-500",
  },
  {
    href: "/study-buddies",
    icon: Users,
    title: "Find a study buddy",
    chip: "bg-slate-800",
  },
  {
    href: "/resources/requests",
    icon: Handshake,
    title: "Pending requests",
    chip: "bg-tangerine-500",
  },
];

export default function DashboardPage() {
  const { data: user } = useMe();
  const { data: shareRequests } = useShareRequests("Pending");
  const { data: matchRequests } = useStudyBuddyRequests("Pending");

  const pendingIncomingShares = shareRequests?.filter((r) => !r.isOutgoing).length ?? 0;
  const pendingIncomingMatches = matchRequests?.filter((r) => !r.isOutgoing).length ?? 0;
  const pendingTotal = pendingIncomingShares + pendingIncomingMatches;

  const descriptions: Record<string, string> = {
    "/resources": "Find notes, textbooks, and study materials.",
    "/study-buddies": "Pair up with students who share your interests.",
    "/resources/requests": `${pendingTotal} awaiting your response`,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome{user ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {user?.institutionName}
          {user && !user.isVerifiedMember && (
            <Badge variant="amber">Unverified — limited to your own school</Badge>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TILES.map(({ href, icon: Icon, title, chip }) => (
          <Link key={href} href={href}>
            <Card interactive className="h-full">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${chip}`}>
                <Icon className="h-5.5 w-5.5 text-white" />
              </div>
              <p className="mt-4 font-bold text-slate-900 dark:text-slate-100">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{descriptions[href]}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
