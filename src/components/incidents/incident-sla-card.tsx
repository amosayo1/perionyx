"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, Timer } from "lucide-react";
import type { Incident } from "./types";

function calcProgress(deadline: string, resolvedAt?: string): number {
  if (resolvedAt) return 100;
  const now = Date.now();
  const deadlineMs = new Date(deadline).getTime();
  const createdMs = new Date(deadline).getTime() - 4 * 3600000;
  const elapsed = now - createdMs;
  const total = deadlineMs - createdMs;
  return Math.min(Math.round((elapsed / total) * 100), 100);
}

function calcRemaining(deadline: string, resolvedAt?: string): string {
  if (resolvedAt) return "Completed";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Breached";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function isBreached(deadline: string, resolvedAt?: string): boolean {
  if (resolvedAt) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function IncidentSlaCard({ incident }: { incident: Incident }) {
  const responseProgress = calcProgress(incident.slaResponseDeadline, incident.slaRespondedAt);
  const resolutionProgress = calcProgress(incident.slaResolutionDeadline, incident.slaResolvedAt);
  const responseRemaining = calcRemaining(incident.slaResponseDeadline, incident.slaRespondedAt);
  const resolutionRemaining = calcRemaining(incident.slaResolutionDeadline, incident.slaResolvedAt);
  const responseBreached = isBreached(incident.slaResponseDeadline, incident.slaRespondedAt);
  const resolutionBreached = isBreached(incident.slaResolutionDeadline, incident.slaResolvedAt);

  return (
    <div className="space-y-4">
      {/* Response SLA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-300">Response SLA</span>
          </div>
          <div className="flex items-center gap-1.5">
            {responseBreached && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            )}
            {incident.slaRespondedAt && !responseBreached && (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#d4af37]" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                responseBreached && "text-red-400",
                responseRemaining === "Completed" && "text-[#d4af37]",
                !responseBreached && responseRemaining !== "Completed" && "text-zinc-400",
              )}
            >
              {responseRemaining}
            </span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              responseBreached
                ? "bg-red-500"
                : responseProgress > 80
                  ? "bg-amber-500"
                  : "bg-[#d4af37]",
            )}
            style={{ width: `${Math.min(responseProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Resolution SLA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-300">Resolution SLA</span>
          </div>
          <div className="flex items-center gap-1.5">
            {resolutionBreached && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            )}
            {incident.slaResolvedAt && !resolutionBreached && (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#d4af37]" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                resolutionBreached && "text-red-400",
                resolutionRemaining === "Completed" && "text-[#d4af37]",
                !resolutionBreached && resolutionRemaining !== "Completed" && "text-zinc-400",
              )}
            >
              {resolutionRemaining}
            </span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              resolutionBreached
                ? "bg-red-500"
                : resolutionProgress > 80
                  ? "bg-amber-500"
                  : "bg-[#d4af37]",
            )}
            style={{ width: `${Math.min(resolutionProgress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
