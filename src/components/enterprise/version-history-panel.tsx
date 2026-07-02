"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { History, RotateCcw, Eye, ChevronDown, ChevronRight, FileText, DollarSign, ShieldAlert, Banknote, CheckSquare, BookOpen } from "lucide-react";
import { StateComparison } from "./state-comparison";

interface VersionRecord {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  changedByUserId: string | null;
  changedByName: string | null;
  changeType: "CREATE" | "UPDATE" | "DELETE";
  changedFields: string[];
  previousVersionId: string | null;
  createdAt: string;
}

interface VersionHistoryPanelProps {
  entityType: string;
  entityId: string;
  className?: string;
  maxHeight?: string;
}

const changeTypeColors: Record<string, string> = {
  CREATE: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  UPDATE: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  DELETE: "text-red-400 border-red-500/30 bg-red-500/10",
};

const changeTypeLabels: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
};

const entityIcons: Record<string, React.ReactNode> = {
  Transaction: <DollarSign className="h-4 w-4" />,
  LedgerEntry: <BookOpen className="h-4 w-4" />,
  TransactionApproval: <CheckSquare className="h-4 w-4" />,
  Policy: <ShieldAlert className="h-4 w-4" />,
  RiskIncident: <ShieldAlert className="h-4 w-4" />,
  TreasuryAccount: <Banknote className="h-4 w-4" />,
};

const entityLabels: Record<string, string> = {
  Transaction: "Transaction",
  LedgerEntry: "Ledger Entry",
  TransactionApproval: "Approval",
  Policy: "Policy",
  RiskIncident: "Risk Incident",
  TreasuryAccount: "Treasury Account",
};

export function VersionHistoryPanel({ entityType, entityId, className, maxHeight = "480px" }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [diffView, setDiffView] = useState<{ v1: string; v2: string; open: boolean } | null>(null);
  const [diffData, setDiffData] = useState<{ diffs: unknown[]; version1: VersionRecord; version2: VersionRecord } | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/v1/enterprise/versions?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`, {
      credentials: "include",
    })
      .then((r) => { if (!r.ok) throw new Error("Failed to load versions"); return r.json(); })
      .then((data) => { setVersions(data.items ?? []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [entityType, entityId]);

  const openDiff = useCallback((v1Id: string, v2Id: string) => {
    setDiffView({ v1: v1Id, v2: v2Id, open: true });
    setDiffLoading(true);
    fetch(`/api/v1/enterprise/versions/diff?v1=${encodeURIComponent(v1Id)}&v2=${encodeURIComponent(v2Id)}`, {
      credentials: "include",
    })
      .then((r) => { if (!r.ok) throw new Error("Failed to load diff"); return r.json(); })
      .then((data) => { setDiffData(data); setDiffLoading(false); })
      .catch(() => setDiffLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-white/[0.06] bg-white/[0.02] p-4", className)}>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500 animate-pulse" />
          <span className="text-xs text-zinc-500">Loading version history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-red-500/20 bg-red-500/5 p-4", className)}>
        <p className="text-xs text-red-400">Failed to load version history: {error}</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={cn("rounded-lg border border-white/[0.06] bg-white/[0.02] p-4", className)}>
        <div className="flex items-center gap-2 text-zinc-500">
          <History className="h-4 w-4" />
          <span className="text-xs">No version history for this {entityLabels[entityType] ?? entityType}</span>
        </div>
      </div>
    );
  }

  const sorted = [...versions].reverse();

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-white/[0.02]", className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        {entityIcons[entityType] ?? <History className="h-4 w-4" />}
        <span className="text-xs font-medium text-white">Version History</span>
        <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-500">{versions.length} version{versions.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight }}>
        {sorted.map((version, idx) => {
          const isSelected = selectedVersion === version.id;
          const isLatest = idx === 0;
          const prevVersion = idx < sorted.length - 1 ? sorted[idx + 1] : null;

          return (
            <div key={version.id}>
              <button
                onClick={() => setSelectedVersion(isSelected ? null : version.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]",
                  isSelected && "bg-[#d4af37]/5",
                )}
              >
                <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold", changeTypeColors[version.changeType] ?? "text-zinc-500 border-zinc-600 bg-zinc-800")}>
                  v{version.version}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded px-1 py-0.5 text-[9px] font-medium uppercase", changeTypeColors[version.changeType])}>
                      {changeTypeLabels[version.changeType] ?? version.changeType}
                    </span>
                    {isLatest && (
                      <span className="rounded bg-blue-500/10 px-1 py-0.5 text-[9px] text-blue-400">current</span>
                    )}
                    <span className="ml-auto text-[10px] text-zinc-600">{new Date(version.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {version.changedByName ? `by ${version.changedByName}` : "System change"}
                    {version.changedFields.length > 0 && ` · ${version.changedFields.join(", ")}`}
                  </p>
                </div>
                {isSelected ? <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" /> : <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />}
              </button>

              {isSelected && (
                <div className="space-y-2 border-t border-white/[0.04] bg-black/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <FileText className="h-3 w-3" />
                    <span>Snapshot (v{version.version})</span>
                    {prevVersion && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openDiff(prevVersion.id, version.id); }}
                        className="ml-auto flex items-center gap-1 rounded bg-white/[0.06] px-2 py-1 text-[10px] text-amber-400 hover:bg-white/[0.1]"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Diff with v{prevVersion.version}
                      </button>
                    )}
                  </div>
                  <pre className="overflow-auto rounded bg-black/40 p-2 text-[10px] leading-relaxed text-zinc-400 max-h-48">
                    {JSON.stringify(version.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {diffView && diffData && (
        <div className="border-t border-white/[0.06] p-3">
          <div className="mb-2 flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="text-[11px] font-medium text-white">Difference View</span>
            <button
              onClick={() => { setDiffView(null); setDiffData(null); }}
              className="ml-auto text-[10px] text-zinc-600 hover:text-zinc-400"
            >
              Close
            </button>
          </div>
          {diffLoading ? (
            <p className="text-[10px] text-zinc-500">Loading diff...</p>
          ) : (
            <StateComparison
              diffs={diffData.diffs as any}
              version1={{ ...diffData.version1, createdAt: diffData.version1.createdAt }}
              version2={{ ...diffData.version2, createdAt: diffData.version2.createdAt }}
            />
          )}
        </div>
      )}
    </div>
  );
}
