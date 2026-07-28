"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, TrendingUp, ShieldAlert, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InsightCardProps {
  title: string;
  description: string;
  type?: "insight" | "warning" | "recommendation" | "alert" | "info";
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const TYPE_STYLES: Record<string, { icon: LucideIcon; color: string; border: string; bg: string }> = {
  insight: { icon: Lightbulb, color: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  recommendation: { icon: TrendingUp, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  alert: { icon: ShieldAlert, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  info: { icon: Info, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
};

export function InsightCard({ title, description, type = "insight", icon, action, className }: InsightCardProps) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.insight;
  const Icon = icon ?? style.icon;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", style.bg)}>
            <Icon className={cn("h-4 w-4", style.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-xs font-medium text-gold hover:text-[#c7a961]"
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
