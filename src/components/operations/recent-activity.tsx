"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { recentActivity } from "./data";
import { SectionHeader } from "./section-header";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import {
  CheckCircle2,
  Shield,
  BookOpen,
  Landmark,
  ScrollText,
  AlertTriangle,
  Activity,
} from "lucide-react";

const eventIcons: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 className="h-3.5 w-3.5 text-gold" />,
  policy: <Shield className="h-3.5 w-3.5 text-amber-400" />,
  posted: <BookOpen className="h-3.5 w-3.5 text-blue-400" />,
  treasury: <Landmark className="h-3.5 w-3.5 text-gold" />,
  audit: <ScrollText className="h-3.5 w-3.5 text-zinc-400" />,
  risk: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />,
  exception: <Activity className="h-3.5 w-3.5 text-red-400" />,
};

export function RecentActivity() {
  const sorted = [...recentActivity].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Recent Activity"
        description="Latest operational events from across the platform"
        action={
          <Button asChild variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-white">
            <Link href="/audit-logs">View All</Link>
          </Button>
        }
      />

      <div className="space-y-1">
        {sorted.map((event, idx) => {
          const isLast = idx === sorted.length - 1;
          return (
            <Link
              key={event.id}
              href={event.href}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
            >
              {/* Timeline line + icon */}
              <div className="relative flex flex-col items-center">
                <div className="relative z-10 flex h-[15px] w-[15px] items-center justify-center shrink-0">
                  {eventIcons[event.type] ?? (
                    <Activity className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                </div>
                {!isLast && (
                  <div className="absolute top-4 h-full w-px bg-zinc-800" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {event.label}
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <span className="text-[10px] text-zinc-700 shrink-0 mt-0.5">
                {formatDateTime(event.timestamp)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
