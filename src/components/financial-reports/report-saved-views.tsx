"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, X, Save, Bookmark } from "lucide-react";

interface SavedView {
  id: string;
  name: string;
  isDefault?: boolean;
  [key: string]: unknown;
}

interface ReportSavedViewsProps {
  views: SavedView[];
  currentView?: string;
  onSelect: (view: SavedView) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}

export function ReportSavedViews({ views, currentView, onSelect, onSave, onDelete }: ReportSavedViewsProps) {
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");

  const handleSave = useCallback(() => {
    const name = saveName.trim();
    if (!name) return;
    onSave(name);
    setSaveName("");
    setSaving(false);
  }, [saveName, onSave]);

  if (views.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.06] px-4 py-3">
        <Bookmark className="h-4 w-4 text-zinc-600" />
        <span className="text-sm text-zinc-500">No saved views</span>
        {!saving && (
          <button
            onClick={() => setSaving(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-400/20"
          >
            <Save className="h-3 w-3" />
            Save Current
          </button>
        )}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="ml-auto flex items-center gap-2 overflow-hidden"
            >
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="View name..."
                className="w-36 rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/30 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="rounded-lg bg-amber-400 px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:bg-amber-500"
              >
                Save
              </button>
              <button
                onClick={() => { setSaving(false); setSaveName(""); }}
                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {views.map((view) => {
          const isActive = view.id === currentView;
          return (
            <div
              key={view.id}
              className="group relative"
            >
              <button
                onClick={() => onSelect(view)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "border border-amber-400/40 bg-amber-400/10 text-amber-400"
                    : "border border-transparent bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300",
                )}
              >
                {view.isDefault && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                {!view.isDefault && <Bookmark className="h-3 w-3 text-zinc-600" />}
                {view.name}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(view.id); }}
                className={cn(
                  "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100",
                  isActive && "bg-zinc-700",
                )}
                title={`Delete ${view.name}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {!saving && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setSaving(true)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            <Save className="h-3 w-3" />
            Save
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="View name..."
              className="w-36 rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/30 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="rounded-lg bg-amber-400 px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:bg-amber-500"
            >
              Save
            </button>
            <button
              onClick={() => { setSaving(false); setSaveName(""); }}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
