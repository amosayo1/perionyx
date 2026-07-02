"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GripVertical, X, Pin, PinOff } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "compact" | "full";
  status?: "healthy" | "warning" | "critical" | "neutral";
  pinned?: boolean;
  onPin?: () => void;
  onHide?: () => void;
  className?: string;
  headerAction?: ReactNode;
}

const STATUS_COLORS: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-zinc-500",
};

export function WidgetCard({
  title, description, children, variant = "default",
  status, pinned, onPin, onHide, className, headerAction,
}: WidgetCardProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <Card
      className={cn(
        "relative group transition-shadow duration-300",
        status === "warning" && "ring-1 ring-amber-500/20",
        status === "critical" && "ring-1 ring-red-500/20",
        className,
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {onPin || onHide ? (
        <div className={cn(
          "absolute top-3 right-3 flex gap-1 transition-opacity duration-200",
          hovering ? "opacity-100" : "opacity-0",
        )}>
          {onPin && (
            <button onClick={onPin} className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" aria-label={pinned ? "Unpin widget" : "Pin widget"}>
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
          {onHide && (
            <button onClick={onHide} className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" aria-label="Hide widget">
              <X size={14} />
            </button>
          )}
        </div>
      ) : null}

      <CardHeader className={cn(
        variant === "compact" ? "px-4 py-3" : "px-5 py-4",
        "flex flex-row items-center justify-between gap-2",
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {status && <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_COLORS[status])} />}
          <div className="min-w-0">
            <CardTitle className={cn("text-sm font-semibold text-white truncate", variant === "compact" && "text-xs")}>{title}</CardTitle>
            {description && <CardDescription className="text-xs text-zinc-500 truncate">{description}</CardDescription>}
          </div>
        </div>
        {headerAction}
      </CardHeader>

      <CardContent className={cn(variant === "compact" ? "px-4 pb-4" : "px-5 pb-5")}>
        {children}
      </CardContent>
    </Card>
  );
}

export function KpiCard({
  label, value, change, direction, status,
}: {
  label: string; value: string; change?: string; direction?: "up" | "down" | "stable"; status?: "healthy" | "warning" | "critical" | "neutral";
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">{label}</p>
        {status && (
          <span className={cn(
            "h-2 w-2 rounded-full shrink-0 mt-1",
            status === "healthy" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
            status === "warning" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
            status === "critical" && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
            status === "neutral" && "bg-zinc-500",
          )} />
        )}
      </div>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
      {(change || direction) && (
        <div className="mt-1 flex items-center gap-1">
          {direction && (
            <span className={cn(
              "text-xs",
              direction === "up" && "text-emerald-400",
              direction === "down" && "text-red-400",
              direction === "stable" && "text-zinc-400",
            )}>
              {direction === "up" && "↑"} {direction === "down" && "↓"} {direction === "stable" && "→"}
            </span>
          )}
          {change && <span className="text-xs text-zinc-400">{change}</span>}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const variant = status === "healthy" ? "success" as const : status === "warning" ? "warning" as const : status === "critical" ? "danger" as const : "secondary" as const;
  return <Badge variant={variant} className="text-[10px] px-1.5 py-0">{label}</Badge>;
}

export function WidgetGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {children}
    </div>
  );
}
