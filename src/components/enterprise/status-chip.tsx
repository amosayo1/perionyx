"use client";

import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: "success" | "warning" | "error" | "neutral" | "info" | "gold";
  label?: string;
  className?: string;
  dotOnly?: boolean;
}

const config = {
  success: { dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Active" },
  warning: { dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Warning" },
  error: { dot: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Error" },
  neutral: { dot: "bg-zinc-500", text: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20", label: "Idle" },
  info: { dot: "bg-blue-500", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Info" },
  gold: { dot: "bg-[#c9a84c]", text: "text-[#c9a84c]", bg: "bg-gold-500/10", border: "border-gold-500/20", label: "Active" },
};

export function StatusChip({ status, label, className, dotOnly }: StatusChipProps) {
  const c = config[status];

  if (dotOnly) {
    return <span className={cn("h-2 w-2 rounded-full", c.dot, className)} title={label ?? c.label} />;
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none",
      c.bg, c.border, c.text, className,
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {label ?? c.label}
    </span>
  );
}
