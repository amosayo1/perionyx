"use client";

import { Clock, FileText, GitBranch } from "lucide-react";
import type { WorkflowDefinitionSummary } from "@/modules/workflow/types";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

interface VersionInfo {
  version: number;
  name: string;
  status: string;
  stepCount: number;
  createdAt: string;
}

interface Props {
  currentVersion: number;
  name: string;
  category: string;
  description: string | null;
  definitions: WorkflowDefinitionSummary[];
  onViewVersion?: (version: number) => void;
}

export function VersionHistory({ currentVersion, name, category, description, definitions, onViewVersion }: Props) {
  const olderVersions = definitions.filter((d) => d.version < currentVersion);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">v{currentVersion} — Current</p>
            <p className="text-xs text-zinc-500">{name} &middot; {category} &middot; {description ?? ""}</p>
          </div>
          <div className="ml-auto">
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-medium text-gold">Active</span>
          </div>
        </div>
      </div>

      {olderVersions.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">Version History</h4>
          {olderVersions.map((v) => (
            <div key={v.version} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3 transition-colors hover:border-white/[0.12]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">v{v.version}</p>
                <p className="text-xs text-zinc-500">{v.stepCount} steps &middot; {v.status}</p>
              </div>
              {v.status === "ACTIVE" && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Active</span>
              )}
              {onViewVersion && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => onViewVersion(v.version)}>
                  View
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : definitions.length <= 1 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-zinc-900/20 py-10 text-center">
          <Clock className="mb-3 h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">No version history yet</p>
          <p className="text-xs text-zinc-600 mt-1">Version history will appear as you make changes</p>
        </div>
      ) : null}
    </div>
  );
}
