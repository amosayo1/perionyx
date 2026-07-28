"use client";

import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw, Pin, Maximize2, Minimize2, Download, MoreHorizontal,
  AlertCircle, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardCardProps } from "./types";

const cardMotion = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -1 },
  transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
};

export const DashboardCard = memo(function DashboardCard({
  title,
  description,
  size = "full",
  isLoading,
  error,
  isEmpty,
  emptyMessage = "No data available",
  onRefresh,
  onPin,
  onExport,
  pinned,
  fullscreen,
  onFullscreen,
  className,
  children,
  action,
}: DashboardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const sizeClass = cn(
    size === "full" && "col-span-full",
    size === "half" && "col-span-full lg:col-span-3",
    size === "third" && "col-span-full lg:col-span-2",
    size === "two-thirds" && "col-span-full lg:col-span-4",
    size === "quarter" && "col-span-full lg:col-span-1",
  );

  return (
    <motion.div
      className={cn(
        "group relative rounded-xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-5 shadow-lg backdrop-blur-sm transition-colors",
        sizeClass,
        className,
      )}
      initial="rest"
      whileHover="hover"
      variants={cardMotion}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-zinc-200">{title}</h3>
            {pinned && <Pin className="h-3 w-3 fill-gold text-gold" />}
          </div>
          {description && (
            <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
              aria-label="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          {onPin && (
            <button
              onClick={onPin}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-all",
                pinned
                  ? "text-gold opacity-100"
                  : "text-zinc-600 opacity-0 hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100",
              )}
              aria-label={pinned ? "Unpin" : "Pin"}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
              aria-label="Export"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
              aria-label="Card menu"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                  {onPin && (
                    <button
                      onClick={() => { onPin(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    >
                      <Pin className="h-3 w-3" />
                      {pinned ? "Unpin" : "Pin card"}
                    </button>
                  )}
                  {onExport && (
                    <button
                      onClick={() => { onExport(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    >
                      <Download className="h-3 w-3" />
                      Export data
                    </button>
                  )}
                  {onFullscreen && (
                    <button
                      onClick={() => { onFullscreen(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    >
                      <Maximize2 className="h-3 w-3" />
                      {fullscreen ? "Exit fullscreen" : "Fullscreen"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {action}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-8 w-1/2 rounded bg-zinc-800/60" />
          <div className="h-4 w-3/4 rounded bg-zinc-800/40" />
          <div className="h-24 rounded bg-zinc-800/30" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-400/60" />
          <p className="text-[13px] text-zinc-500">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 rounded-md bg-zinc-800 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-700"
            >
              Retry
            </button>
          )}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Inbox className="h-8 w-8 text-zinc-600" />
          <p className="text-[13px] text-zinc-500">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
});
