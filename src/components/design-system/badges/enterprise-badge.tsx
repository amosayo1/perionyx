"use client";

import { cn } from "@/lib/utils";

export type BadgeVariant = "priority" | "role" | "department" | "risk" | "workflow" | "treasury" | "ai" | "compliance" | "default";

interface EnterpriseBadgeProps {
  variant?: BadgeVariant;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  priority:   "bg-red-500/10 text-red-400 border-red-500/20",
  role:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  department: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  risk:       "bg-amber-500/10 text-amber-400 border-amber-500/20",
  workflow:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  treasury:   "bg-gold-500/10 text-[#d4a800] border-gold-500/20",
  ai:         "bg-violet-500/10 text-violet-400 border-violet-500/20",
  compliance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  default:    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const badgeSizes = {
  sm: "px-1.5 py-0.5 text-[9px]",
  md: "px-2 py-0.5 text-[10px]",
};

const variantIcons: Record<BadgeVariant, string> = {
  priority:   "!",
  role:       "@",
  department: "#",
  risk:       "⚠",
  workflow:   "→",
  treasury:   "$",
  ai:         "◈",
  compliance: "✓",
  default:    "",
};

export function EnterpriseBadge({ variant = "default", label, size = "md", className }: EnterpriseBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wider",
        badgeStyles[variant],
        badgeSizes[size],
        className,
      )}
    >
      <span className="opacity-70">{variantIcons[variant]}</span>
      {label}
    </span>
  );
}

interface PriorityBadgeProps {
  level: "critical" | "high" | "medium" | "low";
  className?: string;
}

export function PriorityBadge({ level, className }: PriorityBadgeProps) {
  const config = {
    critical: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Critical" },
    high:     { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "High" },
    medium:   { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Medium" },
    low:      { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", label: "Low" },
  };
  const c = config[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border", c.color, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", level === "critical" ? "bg-red-500" : level === "high" ? "bg-amber-500" : level === "medium" ? "bg-blue-500" : "bg-zinc-500")} />
      {c.label}
    </span>
  );
}
