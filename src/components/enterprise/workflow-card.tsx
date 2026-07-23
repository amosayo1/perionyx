"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

interface WorkflowCardProps {
  name: string;
  status: "active" | "running" | "completed" | "failed" | "waiting" | "draft";
  description?: string;
  instanceCount?: number;
  lastRun?: string;
  onClick?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<string, { badge: "success" | "warning" | "danger" | "secondary" | "default"; icon: typeof Play; text: string }> = {
  active: { badge: "success", icon: Play, text: "Active" },
  running: { badge: "success", icon: Play, text: "Running" },
  completed: { badge: "success", icon: CheckCircle2, text: "Completed" },
  failed: { badge: "danger", icon: XCircle, text: "Failed" },
  waiting: { badge: "warning", icon: Clock, text: "Waiting" },
  draft: { badge: "default", icon: Clock, text: "Draft" },
};

export function WorkflowCard({ name, status, description, instanceCount, lastRun, onClick, className }: WorkflowCardProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(onClick && "cursor-pointer", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <Badge variant={config.badge}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {config.text}
              </Badge>
            </div>
            {description && (
              <p className="mt-1 text-xs text-zinc-400">{description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
              {instanceCount !== undefined && (
                <span>{instanceCount} instances</span>
              )}
              {lastRun && (
                <span>Last run: {lastRun}</span>
              )}
            </div>
          </div>
          {onClick && (
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
