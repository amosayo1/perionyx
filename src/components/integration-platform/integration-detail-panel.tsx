"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Lock, RefreshCw, Activity, Calendar } from "lucide-react";
import type { IntegrationInstanceData, SyncHistoryData } from "./types";

interface DetailPanelProps {
  instance: IntegrationInstanceData;
  syncs: SyncHistoryData[];
  onClose: () => void;
  onStartSync: () => void;
  onViewSync: (id: string) => void;
}

export function IntegrationDetailPanel({ instance, syncs, onClose, onStartSync, onViewSync }: DetailPanelProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className="fixed right-0 top-0 z-40 h-full w-96 border-l border-white/[0.06] bg-zinc-950 p-6 shadow-2xl overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">{instance.name}</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">&times;</button>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-zinc-300">{instance.connectorDefId}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <Lock className="h-3 w-3" />
            <span>{instance.authMethod} auth</span>
          </div>
          <StatusBadge status={instance.status} />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-xs font-medium text-zinc-400">Quick Actions</h3>
          <div className="flex gap-2">
            <button onClick={onStartSync} className="flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-500"><RefreshCw className="h-3 w-3" /> Sync Now</button>
            <button className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"><Activity className="h-3 w-3 inline mr-1" /> Health</button>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-xs font-medium text-zinc-400">Recent Syncs</h3>
          {syncs.length === 0 ? (
            <p className="text-xs text-zinc-500">No syncs yet</p>
          ) : (
            <div className="space-y-2">
              {syncs.slice(0, 5).map(s => (
                <button key={s.id} onClick={() => onViewSync(s.id)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    <span className="text-zinc-400">{new Date(s.startedAt).toLocaleDateString()}</span>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px]", s.status === "completed" ? "bg-emerald-400/10 text-emerald-400" : s.status === "failed" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400")}>{s.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <h3 className="mb-2 text-xs font-medium text-zinc-400">Configuration</h3>
          {Object.entries(instance.config ?? {}).filter(([k]) => !k.toLowerCase().includes("secret") && !k.toLowerCase().includes("password") && !k.toLowerCase().includes("key")).map(([k, v]) => (
            <div key={k} className="flex justify-between py-1 text-xs">
              <span className="text-zinc-500">{k}</span>
              <span className="text-zinc-300 truncate max-w-[180px]">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px]",
      status === "connected" ? "bg-emerald-400/10 text-emerald-400" :
      status === "disconnected" ? "bg-zinc-800 text-zinc-400" :
      status === "error" ? "bg-red-400/10 text-red-400" :
      "bg-amber-400/10 text-amber-400"
    )}>{status}</span>
  );
}
