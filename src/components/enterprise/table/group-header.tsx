"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface GroupHeaderProps {
  label: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function GroupHeader({ label, count, expanded, onToggle, className }: GroupHeaderProps) {
  return (
    <tr className={cn("group", className)}>
      <td
        colSpan={999}
        className="cursor-pointer border-b border-white/[0.06] bg-zinc-900/60 px-4 py-2 text-sm"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          )}
          <span className="font-medium text-white">{label}</span>
          <span className="text-xs text-zinc-500">({count})</span>
        </div>
      </td>
    </tr>
  );
}
