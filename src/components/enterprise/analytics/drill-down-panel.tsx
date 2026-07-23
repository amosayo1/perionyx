"use client";

import { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, ArrowRight, ExternalLink, Filter, ChevronLeft } from "lucide-react";
import type { DrillDownConfig } from "./types";

interface DrillDownPanelProps {
  config: DrillDownConfig | null;
  onClose: () => void;
  className?: string;
}

export const DrillDownPanel = memo(function DrillDownPanel({
  config,
  onClose,
  className,
}: DrillDownPanelProps) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  if (!config) return null;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg transform transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        role="button"
        tabIndex={-1}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClose(); }}
        aria-label="Close panel"
      />
      <div className="relative ml-auto flex w-full flex-col border-l border-white/[0.06] bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors" aria-label="Go back">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold text-white">{config.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {config.onFilter && (
              <button
                onClick={() => config.onFilter!({})}
                className="rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                aria-label="Filter"
              >
                <Filter className="h-3.5 w-3.5" />
              </button>
            )}
            {config.onNavigate && (
              <button
                onClick={() => config.onNavigate!("/")}
                className="rounded-md px-2.5 py-1.5 text-xs text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                aria-label="Open in full view"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={handleClose} className="rounded-md p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors" aria-label="Close panel">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-400">
                <code className="text-[10px] text-zinc-600">{JSON.stringify(config.data).slice(0, 500)}</code>
              </p>
            </div>

            {config.onNavigate && (
              <button
                onClick={() => config.onNavigate!("/")}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-gradient-to-b from-zinc-900/60 to-black/40 px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.03] transition-colors"
              >
                <span>View full report</span>
                <ArrowRight className="h-4 w-4 text-[#c9a84c]" />
              </button>
            )}

            {config.onFilter && (
              <button
                onClick={() => config.onFilter!({})}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-gradient-to-b from-zinc-900/60 to-black/40 px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.03] transition-colors"
              >
                <span>Apply as filter</span>
                <Filter className="h-4 w-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
