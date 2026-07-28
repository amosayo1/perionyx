"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ExecutiveSummaryCardProps {
  title: string;
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function ExecutiveSummaryCard({ title, children, action, className }: ExecutiveSummaryCardProps) {
  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-zinc-900/40", className)}>
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-0.5 text-[11px] text-gold hover:text-gold/80 active:text-gold/60"
          >
            {action.label}
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="p-4 pt-3">{children}</div>
    </div>
  );
}
