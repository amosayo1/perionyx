"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, Filter } from "lucide-react";

interface ValidationIssue {
  id: string;
  companyId: string;
  instanceId: string;
  syncHistoryId: string | null;
  severity: string;
  category: string;
  code: string;
  message: string;
  affectedRecords: string[] | undefined;
  resolution: string | null;
  isResolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
}

interface ValidationCenterProps {
  issues: ValidationIssue[];
  onResolve: (id: string) => void;
  summary: { total: number; errors: number; warnings: number; info: number };
}

const SEVERITY_ORDER = ["error", "warning", "info"];

export function ValidationCenter({ issues, onResolve, summary }: ValidationCenterProps) {
  const grouped = useMemo(() => {
    const map: Record<string, ValidationIssue[]> = {};
    for (const s of SEVERITY_ORDER) {
      const items = issues.filter(i => i.severity === s && !i.isResolved);
      if (items.length > 0) map[s] = items;
    }
    const resolved = issues.filter(i => i.isResolved);
    if (resolved.length > 0) map["resolved"] = resolved;
    return map;
  }, [issues]);

  return (
    <div className="space-y-6">
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
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400" />
          <p className="text-sm text-zinc-400">No validation issues</p>
        </div>
      ) : (
        Object.entries(grouped).map(([severity, items]) => (
          <div key={severity} className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {severity === "error" ? <XCircle className="h-3 w-3 text-red-400" /> : severity === "warning" ? <AlertTriangle className="h-3 w-3 text-amber-400" /> : severity === "resolved" ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Filter className="h-3 w-3 text-blue-400" />}
              {severity === "resolved" ? "Resolved" : severity} ({items.length})
            </h3>
            {items.map((i, idx) => (
              <motion.div key={i.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                <div className="flex items-start gap-2">
                  {i.severity === "error" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> : i.severity === "warning" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium", i.severity === "error" ? "text-red-400" : i.severity === "warning" ? "text-amber-400" : "text-blue-400")}>{i.code}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{i.category}</span>
                      {i.isResolved && <span className="text-[10px] text-emerald-500">Resolved by {i.resolvedBy}</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">{i.message}</p>
                    {i.affectedRecords && i.affectedRecords.length > 0 && (
                      <p className="mt-1 text-[10px] text-zinc-600">{i.affectedRecords.length} affected records</p>
                    )}
                  </div>
                  {!i.isResolved && (
                    <button onClick={() => onResolve(i.id)} className="shrink-0 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-emerald-400">Resolve</button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
