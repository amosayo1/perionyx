"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Hash, Shield } from "lucide-react";
import type { LineageRecordData } from "./types";

interface DataLineageViewProps {
  lineage: LineageRecordData[];
  onRefresh: () => void;
}

export function DataLineageView({ lineage, onRefresh }: DataLineageViewProps) {
  if (lineage.length === 0) {
    return <p className="py-4 text-center text-sm text-zinc-500">No lineage records found</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{lineage.length} records</p>
        <button onClick={onRefresh} className="text-xs text-amber-400 hover:text-amber-300">Refresh</button>
      </div>
      {lineage.map((r, i) => (
        <motion.div
          key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400")}>{r.sourceType}</span>
              <span className="text-xs text-zinc-300">{r.sourceId.slice(0, 12)}...</span>
            </div>
            <div className="flex items-center gap-2">
              {r.sourceType === "sync" ? <ArrowDown className="h-3 w-3 text-emerald-400" /> : <ArrowUp className="h-3 w-3 text-blue-400" />}
              <span className="text-[10px] text-zinc-500">{r.sourceType}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /> {r.sourceId.slice(0, 8)}...</span>
            <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {r.checksum?.slice(0, 10)}...</span>
            {r.checksum && <span className="flex items-center gap-1 text-emerald-500"><Shield className="h-3 w-3" /> Verified</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
