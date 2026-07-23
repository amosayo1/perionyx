"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/modules/financial-reporting/types";
import { Download, FileText, FileSpreadsheet, FileType, Presentation, Check, ChevronDown } from "lucide-react";

interface ReportExportActionsProps {
  executionId: string;
  onExport: (format: ExportFormat) => void;
}

const exportOptions: { format: ExportFormat; label: string; icon: typeof FileText; description: string }[] = [
  { format: "pdf", label: "PDF", icon: FileText, description: "Portable Document Format" },
  { format: "excel", label: "Excel", icon: FileSpreadsheet, description: "Microsoft Excel (.xlsx)" },
  { format: "csv", label: "CSV", icon: FileType, description: "Comma Separated Values" },
  { format: "powerpoint", label: "PowerPoint", icon: Presentation, description: "Microsoft PowerPoint (.pptx)" },
];

export function ReportExportActions({ executionId, onExport }: ReportExportActionsProps) {
  const [open, setOpen] = useState(false);
  const [lastExport, setLastExport] = useState<ExportFormat | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleExport = useCallback((format: ExportFormat) => {
    onExport(format);
    setLastExport(format);
    setDownloadCount((c) => c + 1);
    setOpen(false);
  }, [onExport]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3 text-zinc-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isLastExport = lastExport === option.format;
            return (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors hover:bg-white/[0.04]",
                  option.format === "pdf" && "border-l-2 border-amber-400",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0",
                  option.format === "pdf" ? "text-amber-400" : "text-zinc-500",
                )} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">{option.label}</span>
                    {option.format === "pdf" && (
                      <span className="rounded bg-amber-400/10 px-1 py-0.5 text-[9px] text-amber-400">Most common</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600">{option.description}</p>
                </div>
                {isLastExport && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
            );
          })}

          {downloadCount > 0 && (
            <div className="border-t border-white/[0.06] px-4 py-2 text-[10px] text-zinc-600">
              {downloadCount} download{downloadCount !== 1 ? "s" : ""}
              {lastExport && ` · Last: ${lastExport.toUpperCase()}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
