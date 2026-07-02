"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { KnowledgeSource } from "./types";

const statusIcons: Record<string, React.ReactNode> = {
  synced: <CheckCircle className="h-3 w-3 text-[#d4af37]" />,
  syncing: <Clock className="h-3 w-3 text-amber-400" />,
  pending: <AlertCircle className="h-3 w-3 text-zinc-500" />,
};

export function KnowledgeSourceCard({ source }: { source: KnowledgeSource }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.02]">
      {statusIcons[source.status]}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-zinc-400 truncate">{source.name}</p>
        <p className="text-[9px] text-zinc-700">{source.recordsAvailable}</p>
      </div>
      <span className="text-[9px] text-zinc-700 shrink-0">{source.lastIndexed}</span>
    </div>
  );
}
