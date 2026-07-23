"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";
import type { ConflictRecordData } from "./types";

interface ConflictResolverProps {
  conflicts: ConflictRecordData[];
  onResolve: (conflictId: string, resolution: string) => Promise<void>;
  onBulkResolve: (conflictIds: string[], resolution: string) => Promise<void>;
}

export function ConflictResolver({ conflicts, onResolve, onBulkResolve }: ConflictResolverProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [resolving, setResolving] = useState<string | null>(null);

  if (conflicts.length === 0) {
    return <p className="py-4 text-center text-sm text-zinc-500">No conflicts detected</p>;
  }

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const resolveSelected = async (resolution: string) => {
    await onBulkResolve(Array.from(selected), resolution);
    setSelected(new Set());
  };

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{selected.size} selected</span>
          <button onClick={() => resolveSelected("accept_source")} className="rounded bg-emerald-400/10 px-2 py-1 text-xs text-emerald-400">Accept Source</button>
          <button onClick={() => resolveSelected("accept_target")} className="rounded bg-blue-400/10 px-2 py-1 text-xs text-blue-400">Accept Target</button>
          <button onClick={() => resolveSelected("merge")} className="rounded bg-amber-400/10 px-2 py-1 text-xs text-amber-400">Merge</button>
        </div>
      )}
      <AnimatePresence>
        {conflicts.map(c => (
          <motion.div
            key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
            className={cn("rounded-xl border p-3 transition-all", selected.has(c.id) ? "border-amber-400/30 bg-amber-400/5" : "border-white/[0.06] bg-zinc-900/40")}
          >
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="mt-1 rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-amber-400" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-medium text-zinc-300">{c.entityType} / {c.entityId.slice(0, 12)}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px]", c.status === "open" ? "bg-amber-400/10 text-amber-400" : "bg-red-400/10 text-red-400")}>{c.status}</span>
                </div>
                {c.localValue && c.remoteValue && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-zinc-950 p-2">
                      <p className="text-zinc-600">Local</p>
                      <pre className="mt-0.5 text-zinc-300 whitespace-pre-wrap">{JSON.stringify(c.localValue, null, 1)}</pre>
                    </div>
                    <div className="rounded bg-zinc-950 p-2">
                      <p className="text-zinc-600">Remote</p>
                      <pre className="mt-0.5 text-zinc-300 whitespace-pre-wrap">{JSON.stringify(c.remoteValue, null, 1)}</pre>
                    </div>
                  </div>
                )}
                {c.resolvedAt ? (
                  <p className="mt-2 text-[10px] text-green-500">Resolved: {c.resolution} by {c.resolvedBy}</p>
                ) : c.resolvedAt === null && (
                  <div className="mt-2 flex gap-1">
                    <button onClick={() => { onResolve(c.id, "accept_source"); }} className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-emerald-400"><Check className="h-3 w-3" /> Accept Source</button>
                    <button onClick={() => { onResolve(c.id, "accept_target"); }} className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-blue-400"><Check className="h-3 w-3" /> Accept Target</button>
                    <button onClick={() => { onResolve(c.id, "merge"); }} className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-amber-400"><Check className="h-3 w-3" /> Merge</button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
