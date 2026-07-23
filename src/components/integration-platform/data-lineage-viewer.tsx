"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GitBranch, Search, ArrowRight, Shield, Hash } from "lucide-react";

interface LineageRecord {
  id: string;
  companyId: string;
  instanceId: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  parentId: string | null;
  lineageDepth: number;
  transformation: string | null;
  checksum: string | null;
  metadata: unknown;
  createdAt: string;
  instanceName?: string;
}

interface DataLineageViewerProps {
  records: LineageRecord[];
  onDrillDown: (recordId: string) => void;
}

export function DataLineageViewer({ records, onDrillDown }: DataLineageViewerProps) {
  const [search, setSearch] = useState("");
  const [filterDepth, setFilterDepth] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let items = records;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(r => r.targetType.toLowerCase().includes(s) || r.targetId.toLowerCase().includes(s) || r.sourceType.toLowerCase().includes(s) || r.sourceId.toLowerCase().includes(s));
    }
    if (filterDepth !== null) {
      items = items.filter(r => r.lineageDepth === filterDepth);
    }
    return items;
  }, [records, search, filterDepth]);

  const maxDepth = useMemo(() => Math.max(...records.map(r => r.lineageDepth), 0), [records]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <GitBranch className="mb-3 h-10 w-10 text-zinc-600" />
        <p className="text-sm text-zinc-500">No lineage records</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search by entity type or ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none" />
        </div>
        <select value={filterDepth ?? ""} onChange={e => setFilterDepth(e.target.value ? parseInt(e.target.value) : null)} className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-400">
          <option value="">All depths</option>
          {Array.from({ length: maxDepth + 1 }, (_, i) => (
            <option key={i} value={i}>Depth {i}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((r, idx) => (
          <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.015 }} className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium", r.sourceType === "sync" ? "bg-emerald-400/10 text-emerald-400" : "bg-blue-400/10 text-blue-400")}>{r.sourceType === "sync" ? "S" : "I"}</div>
                <span className="text-xs text-zinc-300">{r.targetType}</span>
                <span className="text-[10px] text-zinc-600">#{r.targetId.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">depth {r.lineageDepth}</span>
                <button onClick={() => onDrillDown(r.id)} className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-amber-400 transition-colors">View</button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
              <span className="flex items-center gap-1"><span className="w-12 text-zinc-600">Source:</span> {r.sourceId.slice(0, 20)}</span>
              {r.transformation && <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> {r.transformation}</span>}
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-600">
              {r.instanceName && <span>via {r.instanceName}</span>}
              {r.checksum && <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {r.checksum.slice(0, 12)}</span>}
              <span>{new Date(r.createdAt).toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No records match your filters</p>
      )}
    </div>
  );
}
