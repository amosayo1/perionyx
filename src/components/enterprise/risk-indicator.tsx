"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RiskIndicatorProps {
  level: RiskLevel | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const RISK_CONFIG: Record<string, { badge: "success" | "warning" | "danger"; icon: typeof AlertTriangle; text: string }> = {
  low: { badge: "success", icon: Info, text: "Low Risk" },
  medium: { badge: "warning", icon: AlertTriangle, text: "Medium Risk" },
  high: { badge: "danger", icon: AlertTriangle, text: "High Risk" },
  critical: { badge: "danger", icon: ShieldAlert, text: "Critical Risk" },
};

export function RiskIndicator({ level, label, showIcon = true, className }: RiskIndicatorProps) {
  const config = RISK_CONFIG[level.toLowerCase()] ?? RISK_CONFIG.medium;
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {showIcon && <Icon className="h-4 w-4 text-inherit" />}
      <Badge variant={config.badge}>{label ?? config.text}</Badge>
    </div>
  );
}
