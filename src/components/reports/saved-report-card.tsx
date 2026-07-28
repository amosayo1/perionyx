import { cn } from "@/lib/utils";
import { Pin, Share2, Lock, History, Star, FileText } from "lucide-react";
import type { SavedReport } from "./types";

const typeConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pinned: { label: "Pinned", icon: <Pin className="h-3 w-3" />, className: "text-gold" },
  shared: { label: "Shared", icon: <Share2 className="h-3 w-3" />, className: "text-blue-400" },
  private: { label: "Private", icon: <Lock className="h-3 w-3" />, className: "text-amber-400" },
  recent: { label: "Recent", icon: <History className="h-3 w-3" />, className: "text-zinc-400" },
  favorite: { label: "Favorite", icon: <Star className="h-3 w-3" />, className: "text-amber-400" },
};

export function SavedReportCard({ report }: { report: SavedReport }) {
  const cfg = typeConfig[report.type];

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.02]">
      <FileText className="h-4 w-4 shrink-0 text-zinc-600" />
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-zinc-300">{report.title}</span>
      </div>
      <div className={cn("flex items-center gap-1 text-[10px] font-medium", cfg.className)}>
        {cfg.icon}
        {cfg.label}
      </div>
      <span className="text-[10px] text-zinc-700 shrink-0">{report.lastAccessed}</span>
    </div>
  );
}
