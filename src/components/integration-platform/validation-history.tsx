"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ValidationIssueData } from "./types";

interface ValidationHistoryProps {
  issues: ValidationIssueData[];
  summary: { total: number; errors: number; warnings: number; info: number };
  onViewInstance: (instanceId: string) => void;
}

export function ValidationHistory({ issues, summary, onViewInstance }: ValidationHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 flex-1">
          <p className="text-xs text-zinc-500">Errors</p>
          <p className="text-xl font-bold text-red-400">{summary.errors}</p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex-1">
          <p className="text-xs text-zinc-500">Warnings</p>
          <p className="text-xl font-bold text-amber-400">{summary.warnings}</p>
        </div>
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-3 flex-1">
          <p className="text-xs text-zinc-500">Info</p>
          <p className="text-xl font-bold text-blue-400">{summary.info}</p>
        </div>
      </div>
      {issues.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500">No validation issues found</p>
      ) : (
        <div className="space-y-2">
          {issues.map(i => (
            <div key={i.id} className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="flex items-start gap-2">
                {i.severity === "error" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> : i.severity === "warning" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-medium", i.severity === "error" ? "text-red-400" : i.severity === "warning" ? "text-amber-400" : "text-blue-400")}>{i.code}</span>
                    {i.instanceId && <button onClick={() => onViewInstance(i.instanceId!)} className="text-[10px] text-zinc-500 hover:text-zinc-300">View instance</button>}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{i.message}</p>
                  {i.category && <p className="mt-0.5 text-[10px] text-zinc-600">Category: {i.category} | Code: {i.code}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
