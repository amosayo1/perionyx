import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import type { SyncEvent } from "./types";

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircle2 className="h-3 w-3" />, color: "text-gold" },
  failed: { icon: <XCircle className="h-3 w-3" />, color: "text-red-400" },
  "in-progress": { icon: <RefreshCw className="h-3 w-3 animate-spin" />, color: "text-amber-400" },
};

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function SyncEventItem({ event }: { event: SyncEvent }) {
  const stat = statusConfig[event.status] ?? statusConfig.success;

  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.02]">
      <div className="mt-0.5 shrink-0 text-zinc-500">
        <RefreshCw className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">{event.integrationName}</span>
          <span className="text-[10px] text-zinc-700">{event.category}</span>
        </div>
        <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{event.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("shrink-0", stat.color)}>{stat.icon}</span>
        <span className="text-[10px] text-zinc-700">{formatTime(event.timestamp)}</span>
      </div>
    </div>
  );
}
