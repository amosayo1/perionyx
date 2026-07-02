import { cn } from "@/lib/utils";
import type { PlatformEvent } from "./types";
import { Info, AlertTriangle, XCircle, CheckCircle2, Activity } from "lucide-react";

const severityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info className="h-3.5 w-3.5" />, color: "text-blue-400" },
  warning: { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-amber-400" },
  error: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-red-400" },
  success: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-[#d4af37]" },
};

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function PlatformEventItem({ event }: { event: PlatformEvent }) {
  const cfg = severityConfig[event.severity] ?? severityConfig.info;

  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.02]">
      <div className={cn("mt-0.5 shrink-0", cfg.color)}>{cfg.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">{event.title}</span>
          <span className="text-[10px] text-zinc-700 font-mono">{event.service}</span>
        </div>
        <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{event.description}</p>
      </div>
      <span className="text-[10px] text-zinc-700 shrink-0">{formatTime(event.timestamp)}</span>
    </div>
  );
}
