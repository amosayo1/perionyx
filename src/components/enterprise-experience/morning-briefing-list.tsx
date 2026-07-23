"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { MorningBriefingData } from "@/modules/enterprise-experience/types";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";

interface MorningBriefingListProps {
  briefings: MorningBriefingData[];
  onSelect: (id: string) => void;
}

export function MorningBriefingList({ briefings, onSelect }: MorningBriefingListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">Morning Briefings</h2>
      <div className="space-y-2">
        {briefings.map((briefing) => (
          <motion.button
            key={briefing.id}
            variants={fadeInUp}
            onClick={() => onSelect(briefing.id)}
            className="flex w-full items-start gap-4 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-left transition-colors hover:bg-zinc-900/60"
          >
            <span className={cn(
              "mt-1.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full",
              briefing.isRead ? "bg-zinc-600" : "bg-amber-400",
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {briefing.title ?? "Morning Briefing"}
              </p>
              {briefing.summary && (
                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{briefing.summary}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(briefing.date).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </span>
                {briefing.highlights && briefing.highlights.length > 0 && (
                  <span className="flex items-center gap-1">
                    {briefing.highlights[0].direction === "up" ? (
                      <ArrowUp className="h-3 w-3 text-emerald-400" />
                    ) : briefing.highlights[0].direction === "down" ? (
                      <ArrowDown className="h-3 w-3 text-red-400" />
                    ) : null}
                    {briefing.highlights[0].label}: {briefing.highlights[0].value}
                  </span>
                )}
                <span>{briefing.pendingApprovals} pending</span>
              </div>
            </div>
          </motion.button>
        ))}
        {briefings.length === 0 && (
          <p className="py-4 text-center text-sm text-zinc-500">No briefings available</p>
        )}
      </div>
    </motion.div>
  );
}
