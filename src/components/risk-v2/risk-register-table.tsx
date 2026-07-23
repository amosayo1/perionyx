"use client";

import { memo, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskRegister } from "./risk-types";

const LEVEL_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  closed: "text-emerald-400",
  mitigated: "text-blue-400",
  monitored: "text-cyan-400",
  assessed: "text-amber-400",
  identified: "text-zinc-400",
  "re-opened": "text-red-400",
};

const TREND_ICONS: Record<string, string> = {
  improving: "↓",
  stable: "→",
  deteriorating: "↑",
};

type SortField = "riskLevel" | "category" | "status" | "lastReviewed" | "trend";
type SortDir = "asc" | "desc";

interface RiskRegisterTableProps {
  registers: RiskRegister[];
  max?: number;
}

export const RiskRegisterTable = memo(function RiskRegisterTable({ registers, max = 20 }: RiskRegisterTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("lastReviewed");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let items = registers;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q));
    }
    items = [...items].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDir === "asc" ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      return 0;
    });
    return items.slice(0, max);
  }, [registers, search, sortField, sortDir, max]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search register..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-md border border-zinc-700/60 bg-zinc-800/40 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-600"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-800/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/60">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Title</th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500" onClick={() => toggleSort("category")}>
                <div className="flex items-center gap-1">Category <SortIcon field="category" /></div>
              </th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500" onClick={() => toggleSort("riskLevel")}>
                <div className="flex items-center gap-1">Level <SortIcon field="riskLevel" /></div>
              </th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500" onClick={() => toggleSort("status")}>
                <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Owner</th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500" onClick={() => toggleSort("trend")}>
                <div className="flex items-center gap-1">Trend <SortIcon field="trend" /></div>
              </th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500" onClick={() => toggleSort("lastReviewed")}>
                <div className="flex items-center gap-1">Reviewed <SortIcon field="lastReviewed" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  <div className="text-white">{r.title}</div>
                  <div className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{r.description}</div>
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.category}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded border px-2 py-0.5 text-xs font-medium", LEVEL_COLORS[r.riskLevel])}>{r.riskLevel}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-medium", STATUS_COLORS[r.status])}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.owner}</td>
                <td className={cn("px-4 py-3 text-sm", r.trend === "improving" ? "text-emerald-400" : r.trend === "deteriorating" ? "text-red-400" : "text-zinc-500")}>
                  {TREND_ICONS[r.trend]} {r.trend}
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.lastReviewed.toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">No risk register entries found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-right text-xs text-zinc-600">
        Showing {filtered.length} of {registers.length} entries
      </div>
    </div>
  );
});
