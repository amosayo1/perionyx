"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";

interface Zone1Props {
  userName?: string | null;
  companyName?: string;
  businessUnit?: string;
  className?: string;
}

export const Zone1ExecutiveGreeting = memo(function Zone1ExecutiveGreeting({
  userName,
  companyName,
  businessUnit,
  className,
}: Zone1Props) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const period = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <motion.div
      className={cn("col-span-full", className)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-zinc-800/40 bg-gradient-to-r from-zinc-900/60 to-zinc-900/20 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {greeting}, {userName ?? "Executive"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {companyName && (
              <span className="flex items-center gap-1.5 text-[13px] text-zinc-400">
                <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                {companyName}
              </span>
            )}
            {businessUnit && (
              <span className="flex items-center gap-1.5 text-[13px] text-zinc-400">
                <ChevronRight className="h-3 w-3 text-zinc-600" />
                {businessUnit}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[13px] text-zinc-500">
              <Calendar className="h-3.5 w-3.5 text-zinc-600" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-zinc-500">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              {timeStr}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 px-3 py-1.5">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Period</p>
            <p className="text-[13px] font-medium text-zinc-200">{period}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
