"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthIndicator } from "./health-indicator";
import { Plug, RefreshCw, Clock, ExternalLink } from "lucide-react";

interface ConnectionStatusCardProps {
  name: string;
  type: string;
  status: string;
  lastHealthCheckAt?: string | null;
  lastSyncAt?: string | null;
  errorMessage?: string | null;
  active: boolean;
  onReconnect?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Unknown";
  }
}

export function ConnectionStatusCard({ name, type, status, lastHealthCheckAt, lastSyncAt, errorMessage, active, onReconnect, onViewDetails, className }: ConnectionStatusCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              active ? "border-[#d4af37]/20 bg-[#d4af37]/10" : "border-white/[0.06] bg-zinc-900/40",
            )}>
              <Plug className={cn("h-4 w-4", active ? "text-[#d4af37]" : "text-zinc-500")} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">{name}</p>
                <Badge variant={active ? "success" : "default"}>{type}</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <HealthIndicator status={status} size="sm" />
                {!active && <span className="text-xs text-zinc-500">Disabled</span>}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Health: {formatDate(lastHealthCheckAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sync: {formatDate(lastSyncAt)}
                </span>
              </div>
              {errorMessage && (
                <p role="alert" className="mt-1 text-xs text-red-400">{errorMessage}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            {onReconnect && (
              <button
                onClick={onReconnect}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                title="Reconnect"
                aria-label="Reconnect"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                title="View details"
                aria-label="View details"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
