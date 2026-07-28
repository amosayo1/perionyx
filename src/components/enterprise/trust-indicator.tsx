"use client";

import { cn } from "@/lib/utils";
import { ShieldCheck, Clock, Database, AlertCircle, RefreshCw } from "lucide-react";

type TrustLevel = "high" | "medium" | "low" | "simulated";

interface TrustIndicatorProps {
  level: TrustLevel;
  source: string;
  lastRefreshed?: string;
  version?: string;
  auditAvailable?: boolean;
  className?: string;
  showLabel?: boolean;
}

const levelConfig: Record<TrustLevel, { icon: React.ReactNode; label: string; color: string }> = {
  high: {
    icon: <ShieldCheck className="h-3 w-3" />,
    label: "Verified",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  },
  medium: {
    icon: <Clock className="h-3 w-3" />,
    label: "Cached",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  },
  low: {
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Stale",
    color: "text-red-400 border-red-500/20 bg-red-500/10",
  },
  simulated: {
    icon: <RefreshCw className="h-3 w-3" />,
    label: "Simulated",
    color: "text-gold border-gold/20 bg-gold/10",
  },
};

export function TrustIndicator({
  level,
  source,
  lastRefreshed,
  version,
  auditAvailable,
  className,
  showLabel = true,
}: TrustIndicatorProps) {
  const cfg = levelConfig[level];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        cfg.color,
      )}>
        {cfg.icon}
        {showLabel && cfg.label}
      </span>
      <span className="text-[10px] text-zinc-500">{source}</span>
      {lastRefreshed && (
        <span className="text-[9px] text-zinc-700">{lastRefreshed}</span>
      )}
      {auditAvailable && (
        <span className="text-[9px] text-zinc-600 underline decoration-dotted cursor-help" title="Audit trail available">
          auditable
        </span>
      )}
      {version && (
        <span className="text-[9px] text-zinc-700">v{version}</span>
      )}
    </div>
  );
}
