"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, Play, ExternalLink } from "lucide-react";
import type { SyncHistoryData } from "./types";

interface SyncManagerProps {
  instanceId: string;
  history: SyncHistoryData[];
  onStartSync: () => Promise<void>;
  onViewDetails: (syncId: string) => void;
}

export function SyncManager({ instanceId, history, onStartSync, onViewDetails }: SyncManagerProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try { await onStartSync(); }
    finally { setSyncing(false); }
  };

  const latest = history[0];
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">Sync History</h3>
        <button
          onClick={handleSync} disabled={syncing}
          className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50"
        >
          <Play className={cn("h-3.5 w-3.5", syncing && "animate-pulse")} />
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>
      {latest && (
        <div className="mb-3 rounded-lg border border-white/[0.06] bg-zinc-950/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className={cn("rounded-full px-2 py-0.5 text-xs", latest.status === "completed" ? "bg-emerald-400/10 text-emerald-400" : latest.status === "failed" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400")}>{latest.status}</span>
            <span className="text-xs text-zinc-500">{new Date(latest.startedAt).toLocaleString()}</span>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-zinc-500">
            <span>{latest.inserted} inserted</span>
            <span>{latest.updated} updated</span>
            <span>{latest.skipped} skipped</span>
            <span>{latest.failed} failed</span>
          </div>
          {latest.error && <p className="mt-1 text-xs text-zinc-600">{latest.error}</p>}
        </div>
      )}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {history.slice(0, 10).map(s => (
          <button key={s.id} onClick={() => onViewDetails(s.id)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className={cn("inline-block h-1.5 w-1.5 rounded-full", s.status === "completed" ? "bg-emerald-400" : s.status === "failed" ? "bg-red-400" : "bg-amber-400")} />
              <span className="text-zinc-400">{new Date(s.startedAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">{s.inserted + s.updated} rec</span>
              <ExternalLink className="h-3 w-3 text-zinc-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
