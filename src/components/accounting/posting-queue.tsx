"use client";

import type { PostingBatch } from "./accounting-types";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PostingQueueProps {
  batches: PostingBatch[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, color: "text-amber-400" },
  validated: { icon: <Loader2 className="h-3 w-3" />, color: "text-blue-400" },
  posting: { icon: <Loader2 className="h-3 w-3 animate-spin" />, color: "text-blue-400" },
  posted: { icon: <CheckCircle className="h-3 w-3" />, color: "text-emerald-400" },
  failed: { icon: <XCircle className="h-3 w-3" />, color: "text-red-400" },
  reversed: { icon: <XCircle className="h-3 w-3" />, color: "text-gray-500" },
};

export function PostingQueue({ batches }: PostingQueueProps) {
  const sorted = [...batches].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-200">Posting Queue</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">No posting batches</div>
        ) : (
          sorted.map((b) => {
            const cfg = statusConfig[b.status] || statusConfig.pending;
            return (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
                <div className="flex items-center gap-3">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.mode} • {b.totalJournals} journals • {b.startedBy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-200">{b.postedJournals}/{b.totalJournals}</p>
                  <p className="text-xs text-gray-500">{b.failedJournals > 0 ? `${b.failedJournals} failed` : b.startedAt.toLocaleDateString()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
