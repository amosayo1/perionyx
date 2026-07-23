"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface QuickActionGroupProps {
  title: string;
  actions: QuickAction[];
  className?: string;
}

export function QuickActionGroup({ title, actions, className }: QuickActionGroupProps) {
  if (actions.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "group flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 text-left transition-all duration-100",
                "hover:border-zinc-700/60 hover:bg-zinc-900/60",
                action.href ? "cursor-pointer" : "cursor-pointer",
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700/50 bg-zinc-800/50">
                <Icon className="h-4 w-4 text-zinc-400 group-hover:text-[#c9a84c]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white">{action.label}</p>
                <p className="text-[11px] text-zinc-500">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
