"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, XCircle } from "lucide-react";

interface ConflictRecord {
  id: string;
  companyId: string;
  instanceId: string;
  entityType: string;
  entityId: string;
  localValue: unknown;
  remoteValue: unknown;
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  status: string;
  instanceName?: string;
}

interface ConflictResolutionCenterProps {
  conflicts: ConflictRecord[];
  onResolve: (conflictId: string) => void;
  onBulkResolve: (conflictIds: string[], resolution: string) => void;
}

export function ConflictResolutionCenter({ conflicts, onResolve, onBulkResolve }: ConflictResolutionCenterProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("open");

  const filtered = conflicts.filter(c => filter === "all" || c.status === filter);
  const openCount = conflicts.filter(c => c.status === "open").length;

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">{openCount} unresolved</span>
          <span className="text-xs text-zinc-600">|</span>
          <span className="text-sm text-zinc-500">{conflicts.length} total</span>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-400">{selected.size} selected</span>
              <button onClick={() => { onBulkResolve(Array.from(selected), "accept_source"); setSelected(new Set()); }} className="rounded bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">Accept Source</button>
              <button onClick={() => { onBulkResolve(Array.from(selected), "accept_target"); setSelected(new Set()); }} className="rounded bg-blue-400/10 px-2 py-1 text-[10px] text-blue-400">Accept Target</button>
            </div>
          )}
          <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400">
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Check className="mb-3 h-10 w-10 text-emerald-400" />
          <p className="text-sm text-zinc-400">No {filter} conflicts</p>
        </div>
      ) : (
        <AnimatePresence>
          {filtered.map((c, idx) => (
            <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }} className={cn("rounded-xl border p-4 transition-all", selected.has(c.id) ? "border-amber-400/30 bg-amber-400/5" : "border-white/[0.06] bg-zinc-900/40")}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="mt-1 rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-amber-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {c.resolvedAt ? <Check className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                    <span className="text-xs font-medium text-zinc-300">{c.entityType}</span>
                    <span className="text-[10px] text-zinc-500">#{c.entityId.slice(0, 12)}</span>
                    {c.instanceName && <span className="text-[10px] text-zinc-600">via {c.instanceName}</span>}
                  </div>
                  {c.localValue !== null && c.remoteValue !== null && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded bg-zinc-950 p-2">
                        <p className="text-[10px] text-zinc-600">Local (target)</p>
                        <pre className="mt-0.5 text-xs text-zinc-300 whitespace-pre-wrap">{typeof c.localValue === "object" ? JSON.stringify(c.localValue, null, 1) : String(c.localValue)}</pre>
                      </div>
                      <div className="rounded bg-zinc-950 p-2">
                        <p className="text-[10px] text-zinc-600">Remote (source)</p>
                        <pre className="mt-0.5 text-xs text-zinc-300 whitespace-pre-wrap">{typeof c.remoteValue === "object" ? JSON.stringify(c.remoteValue, null, 1) : String(c.remoteValue)}</pre>
                      </div>
                    </div>
                  )}
                  {c.resolvedAt ? (
                    <p className="mt-2 text-[10px] text-emerald-500">Resolved: {c.resolution} by {c.resolvedBy}</p>
                  ) : (
                    <div className="mt-2 flex gap-1">
                      <button onClick={() => onResolve(c.id)} className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-emerald-400">Accept Source</button>
                      <button onClick={() => onResolve(c.id)} className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-blue-400">Accept Target</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
