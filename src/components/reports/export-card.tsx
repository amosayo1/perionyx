import { cn } from "@/lib/utils";
import { FileText, FileSpreadsheet, FileCode, FileJson, Presentation } from "lucide-react";
import type { ExportOption } from "./types";

const iconMap: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5" />,
  excel: <FileSpreadsheet className="h-5 w-5" />,
  csv: <FileCode className="h-5 w-5" />,
  json: <FileJson className="h-5 w-5" />,
  powerpoint: <Presentation className="h-5 w-5" />,
};

const statusConfig: Record<string, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-gold/10 text-gold border-gold/20" },
  generating: { label: "Generating", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  unavailable: { label: "Unavailable", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

export function ExportCard({ option }: { option: ExportOption }) {
  const cfg = statusConfig[option.status];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-zinc-400">{iconMap[option.format] ?? <FileText className="h-5 w-5" />}</div>
          <div>
            <span className="text-sm font-medium text-white">{option.label}</span>
            <span className={cn("block text-[10px] font-semibold", option.status === "ready" ? "text-gold" : option.status === "unavailable" ? "text-zinc-600" : "text-amber-400")}>
              {cfg.label}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>Last export: {option.lastExport}</span>
        <span>Size: {option.fileSize}</span>
      </div>
    </div>
  );
}
