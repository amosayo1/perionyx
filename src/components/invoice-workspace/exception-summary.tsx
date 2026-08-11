"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { InvoiceException } from "@/server/procurement/ap-repositories/types";

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-300",
  HIGH: "bg-orange-500/20 text-orange-300",
  MEDIUM: "bg-yellow-500/20 text-yellow-300",
  LOW: "bg-blue-500/20 text-blue-300",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-yellow-500/20 text-yellow-300",
  IN_REVIEW: "bg-blue-500/20 text-blue-300",
  RESOLVED: "bg-emerald-500/20 text-emerald-300",
  WAIVED: "bg-zinc-500/20 text-zinc-300",
  ESCALATED: "bg-red-500/20 text-red-300",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface ExceptionSummaryProps {
  exceptions: InvoiceException[];
}

export function ExceptionSummary({ exceptions }: ExceptionSummaryProps) {
  if (exceptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exceptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">No exceptions found for this invoice.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Exceptions</CardTitle>
          <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-300">
            {exceptions.length} {exceptions.length === 1 ? "exception" : "exceptions"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {exceptions.map((exc) => {
          const severityColor = SEVERITY_COLORS[exc.severity] ?? "bg-zinc-500/20 text-zinc-300";
          const statusColor = STATUS_COLORS[exc.status] ?? "bg-zinc-500/20 text-zinc-300";
          return (
            <div key={exc.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${severityColor}`}>
                    {exc.severity}
                  </span>
                  <span className="text-xs font-medium text-white">{exc.exceptionType.replace(/_/g, " ")}</span>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
                  {exc.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{exc.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                {exc.assignedTo && <span>Assigned to: {exc.assignedTo}</span>}
                {exc.resolvedAt && <span>Resolved: {formatDate(exc.resolvedAt)}</span>}
                {exc.resolution && <span>Resolution: {exc.resolution}</span>}
                {exc.escalatedAt && <span>Escalated: {formatDate(exc.escalatedAt)}</span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
