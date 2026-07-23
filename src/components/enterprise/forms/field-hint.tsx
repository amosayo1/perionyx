"use client";

import { cn } from "@/lib/utils";
import { Lightbulb, AlertCircle } from "lucide-react";

interface FieldHintProps {
  children: string;
  type?: "example" | "best-practice" | "regulatory" | "tip";
  className?: string;
}

const STYLES = {
  example: { icon: Lightbulb, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
  "best-practice": { icon: Lightbulb, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
  regulatory: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
  tip: { icon: Lightbulb, color: "text-zinc-400", bg: "bg-white/[0.02]", border: "border-white/[0.04]" },
};

export function FieldHint({ children, type = "tip", className }: FieldHintProps) {
  const style = STYLES[type];
  const Icon = style.icon;
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border p-2.5", style.border, style.bg, className)}>
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", style.color)} />
      <p className={cn("text-[11px] leading-relaxed", style.color.replace("text-", "text-").replace("400", "500"))}>
        {children}
      </p>
    </div>
  );
}
