"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain, BookOpen, User, MessageSquare, Lightbulb, Search, Clock, Target, Eye } from "lucide-react";

interface MemoryEntry {
  id: string;
  agentId: string;
  memoryType: string;
  category: string;
  key: string;
  value: unknown;
  importance: number;
  accessCount: number;
  lastAccessedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface MemoryExplorerProps {
  entries: MemoryEntry[];
  agentId: string;
  memoryType: string | null;
  category: string | null;
}

const TYPE_ICON: Record<string, typeof Brain> = {
  short_term: Brain,
  long_term: BookOpen,
  user_preference: User,
  conversation: MessageSquare,
  recommendation: Lightbulb,
};

const TYPE_COLORS: Record<string, string> = {
  short_term: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  long_term: "text-violet-400 border-violet-500/20 bg-violet-500/10",
  user_preference: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  conversation: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  recommendation: "text-rose-400 border-rose-500/20 bg-rose-500/10",
};

function formatTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function importanceBar(importance: number): string {
  const pct = Math.round(importance * 100);
  if (pct >= 80) return "bg-emerald-400";
  if (pct >= 50) return "bg-amber-400";
  return "bg-zinc-500";
}

export function MemoryExplorer({ entries, memoryType, category }: MemoryExplorerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.key.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.memoryType.toLowerCase().includes(q) ||
        JSON.stringify(e.value).toLowerCase().includes(q),
    );
  }, [entries, search]);

  const grouped = useMemo(() => {
    const map: Record<string, MemoryEntry[]> = {};
    for (const e of filtered) {
      const group = e.memoryType;
      if (!map[group]) map[group] = [];
      map[group].push(e);
    }
    return map;
  }, [filtered]);

  const groupOrder = ["short_term", "long_term", "user_preference", "conversation", "recommendation"];

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
        <Brain className="mb-3 h-8 w-8 text-zinc-500" />
        <p className="text-sm text-zinc-400">No memory entries found</p>
        <p className="mt-1 text-xs text-zinc-500">Try a different agent or adjust the category filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search memory entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.09] bg-[#101010] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-[#d4af37]/40"
        />
      </div>

      {groupOrder.map((type) => {
        const groupEntries = grouped[type];
        if (!groupEntries?.length) return null;
        const Icon = TYPE_ICON[type] ?? Brain;

        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", TYPE_COLORS[type])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-medium capitalize text-white">{type.replace("_", " ")}</h3>
              <span className="text-xs text-zinc-500">{groupEntries.length}</span>
            </div>

            <div className="space-y-2">
              {groupEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.01 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.1]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{entry.key}</span>
                        <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-500">
                          {entry.category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">
                        {typeof entry.value === "object"
                          ? JSON.stringify(entry.value).slice(0, 120)
                          : String(entry.value).slice(0, 120)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Target className="h-3 w-3" />
                          <span>{Math.round(entry.importance * 100)}%</span>
                        </div>
                        <div className={cn("mt-1 h-1 w-12 rounded-full bg-zinc-800")}>
                          <div
                            className={cn("h-full rounded-full", importanceBar(entry.importance))}
                            style={{ width: `${Math.round(entry.importance * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Eye className="h-3 w-3" />
                          <span>{entry.accessCount}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-zinc-600">{formatTime(entry.lastAccessedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created {formatTime(entry.createdAt)}
                    </span>
                    {entry.expiresAt && (
                      <span className="flex items-center gap-1 text-amber-500/60">
                        <Clock className="h-3 w-3" />
                        Expires {formatTime(entry.expiresAt)}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
