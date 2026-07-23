"use client";

import { cn } from "@/lib/utils";

interface DashboardDividerProps {
  className?: string;
  label?: string;
}

export function DashboardDivider({ className, label }: DashboardDividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/60 to-zinc-800/20" />
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-l from-zinc-800/60 to-zinc-800/20" />
      </div>
    );
  }

  return (
    <div className={cn("h-px bg-zinc-800/40", className)} />
  );
}
