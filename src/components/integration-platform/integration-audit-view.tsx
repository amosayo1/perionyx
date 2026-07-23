"use client";

import { motion } from "framer-motion";
import type { AuditRecord } from "./types";

interface IntegrationAuditViewProps {
  records: AuditRecord[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export function IntegrationAuditView({ records, onLoadMore, hasMore }: IntegrationAuditViewProps) {
  if (records.length === 0) {
    return <p className="py-4 text-center text-sm text-zinc-500">No audit records found</p>;
  }
  return (
    <div className="space-y-2">
      {records.map((r, i) => (
        <motion.div
          key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
          className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-sm"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-400 uppercase">{r.entityType.slice(0, 2)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{r.action}</span>
              <span className="text-zinc-500">—</span>
              <span className="text-zinc-400">{r.entityType}</span>
              <span className="text-[10px] text-zinc-600">{r.userId}</span>
            </div>
            {r.changes && <p className="mt-0.5 text-xs text-zinc-500 truncate">{JSON.stringify(r.changes)}</p>}
          </div>
          <span className="shrink-0 text-[10px] text-zinc-600">{new Date(r.createdAt).toLocaleString()}</span>
        </motion.div>
      ))}
      {hasMore && (
        <button onClick={onLoadMore} className="w-full rounded-lg border border-zinc-800 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Load more
        </button>
      )}
    </div>
  );
}
