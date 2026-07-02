"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Minus, Edit3 } from "lucide-react";

interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

interface VersionSnapshot {
  id: string;
  version: number;
  data: Record<string, unknown>;
  changedFields: string[];
  createdAt: string;
  changedByName: string | null;
  changeType: string;
}

interface StateComparisonProps {
  diffs: VersionDiff[];
  version1: VersionSnapshot;
  version2: VersionSnapshot;
  className?: string;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val, null, 2);
  return String(val);
}

function isJsonValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  return typeof val === "object" || String(val).length > 40;
}

export function StateComparison({ diffs, version1, version2, className }: StateComparisonProps) {
  if (diffs.length === 0) {
    return (
      <div className={cn("rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center", className)}>
        <p className="text-sm text-zinc-500">No differences between versions</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
        <Edit3 className="h-4 w-4 text-[#d4af37]" />
        <span className="text-xs font-medium text-zinc-400">
          Comparing v{version1.version} → v{version2.version}
        </span>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-zinc-600">
          <span>{version1.changedByName ?? "System"}</span>
          <ArrowRight className="h-3 w-3" />
          <span>{version2.changedByName ?? "System"}</span>
        </div>
      </div>

      <div className="space-y-1">
        {diffs.map((diff) => (
          <div key={diff.field} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center gap-2">
              {diff.oldValue === null || diff.oldValue === undefined ? (
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
              ) : diff.newValue === null || diff.newValue === undefined ? (
                <Minus className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Edit3 className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span className="text-xs font-medium text-white">{diff.field}</span>
              {diff.oldValue === null || diff.oldValue === undefined ? (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">added</span>
              ) : diff.newValue === null || diff.newValue === undefined ? (
                <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">removed</span>
              ) : (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">modified</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="mb-1 block text-[10px] font-medium text-zinc-600">Before (v{version1.version})</span>
                {isJsonValue(diff.oldValue) ? (
                  <pre className="overflow-auto rounded bg-black/30 p-2 text-[11px] text-zinc-400">{formatValue(diff.oldValue)}</pre>
                ) : (
                  <span className="text-sm text-zinc-400">{formatValue(diff.oldValue)}</span>
                )}
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-medium text-zinc-600">After (v{version2.version})</span>
                {isJsonValue(diff.newValue) ? (
                  <pre className="overflow-auto rounded bg-black/30 p-2 text-[11px] text-[#d4af37]">{formatValue(diff.newValue)}</pre>
                ) : (
                  <span className="text-sm text-[#d4af37]">{formatValue(diff.newValue)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 border-t border-white/[0.06] pt-2 text-[10px] text-zinc-600">
        <span>{diffs.length} field{diffs.length !== 1 ? "s" : ""} changed</span>
        <span>v{version1.version} — {new Date(version1.createdAt).toLocaleString()}</span>
        <span>v{version2.version} — {new Date(version2.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
