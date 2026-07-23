"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface SyncRecord {
  id: string;
  instanceId: string;
  instance?: { name: string } | null;
  syncType: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  totalRecords: number | null;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  error: string | null;
  details: unknown;
}

interface SyncHistoryViewProps {
  history: SyncRecord[];
  onRefresh: () => void;
}

export function SyncHistoryView({ history, onRefresh }: SyncHistoryViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{history.length} total syncs</p>
        <button onClick={onRefresh} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"><RefreshCw className="h-3 w-3" /> Refresh</button>
      </div>
      {history.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No sync history</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-900/60 text-left text-xs text-zinc-500">
                <th className="px-4 py-3 font-medium">Instance</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Inserted</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {history.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-zinc-300">{s.instance?.name ?? s.instanceId.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-xs capitalize text-zinc-400">{s.syncType}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px]", s.status === "completed" ? "bg-emerald-400/10 text-emerald-400" : s.status === "failed" ? "bg-red-400/10 text-red-400" : s.status === "running" ? "bg-amber-400/10 text-amber-400" : "bg-zinc-800 text-zinc-400")}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{new Date(s.startedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{s.durationMs ? formatDuration(s.durationMs) : "—"}</td>
                  <td className="px-4 py-3 text-xs text-emerald-400">{s.inserted}</td>
                  <td className="px-4 py-3 text-xs text-blue-400">{s.updated}</td>
                  <td className="px-4 py-3 text-xs text-red-400">{s.failed}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(1)}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  if (ms >= 1000) return `${Math.round(ms / 1000)}s`;
  return `${ms}ms`;
}
