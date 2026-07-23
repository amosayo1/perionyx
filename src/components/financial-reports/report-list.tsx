"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";
import { AnimatedDialog } from "@/components/enterprise/motion/animated-dialog";
import type { ReportDefinition, ReportType } from "@/modules/financial-reporting/types";
import {
  Plus, Search, Play, Pencil, Copy, Trash2, FileText,
  TrendingUp, DollarSign, BookOpen, Banknote
} from "lucide-react";

interface ReportListProps {
  definitions: ReportDefinition[];
  onSelect: (def: ReportDefinition) => void;
  onCreate: () => void;
}

const typeIcons: Record<string, typeof FileText> = {
  "balance-sheet": FileText,
  "profit-loss": TrendingUp,
  "cash-flow": DollarSign,
  "general-ledger": BookOpen,
  "trial-balance": BookOpen,
  "treasury-report": Banknote,
  "cash-position": Banknote,
};

const reportTypeLabels: Record<string, string> = {
  "balance-sheet": "Balance Sheet",
  "profit-loss": "P&L",
  "cash-flow": "Cash Flow",
  "trial-balance": "Trial Balance",
  "general-ledger": "General Ledger",
  "journal-report": "Journal Report",
  "chart-of-accounts": "Chart of Accounts",
  "aged-receivables": "Aged Receivables",
  "aged-payables": "Aged Payables",
  "fixed-assets": "Fixed Assets",
  "equity-statement": "Equity Statement",
  "budget-vs-actual": "Budget vs Actual",
  "department-pl": "Dept P&L",
  "cost-center": "Cost Center",
  "consolidated-group": "Consolidated",
  "multi-company": "Multi-Company",
  "treasury-report": "Treasury",
  "fx-exposure": "FX Exposure",
  "cash-position": "Cash Position",
};

export function ReportList({ definitions, onSelect, onCreate }: ReportListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");
  const [deleteTarget, setDeleteTarget] = useState<ReportDefinition | null>(null);

  const types = useMemo(() => ["all", ...new Set(definitions.map((d) => d.reportType))] as const, [definitions]);

  const filtered = useMemo(() => {
    return definitions.filter((d) => {
      if (typeFilter !== "all" && d.reportType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [definitions, search, typeFilter]);

  const handleDelete = useCallback((id: string) => {
    setDeleteTarget(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-white/[0.1] bg-zinc-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 focus:border-amber-400/30 focus:outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | ReportType)}
            className="rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
          >
            {types.map((t) => (
              <option key={String(t)} value={String(t)}>
                {t === "all" ? "All Types" : reportTypeLabels[t] || t}
              </option>
            ))}
          </select>
        </div>
        <AnimatedButton onClick={onCreate} variant="primary" className="text-xs">
          <Plus className="h-3.5 w-3.5" />
          Create New
        </AnimatedButton>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">No reports found</p>
          <p className="mt-1 text-xs text-zinc-600">Create your first report to get started</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-900/60 text-[11px] text-zinc-500">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Audience</th>
                <th className="px-4 py-2.5 font-medium">Last Run</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((def) => {
                const Icon = typeIcons[def.reportType] || FileText;
                return (
                  <tr
                    key={def.id}
                    onClick={() => onSelect(def)}
                    className="cursor-pointer border-b border-white/[0.03] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{def.name}</p>
                          <p className="text-[11px] text-zinc-500">{def.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400 capitalize">{def.reportType.replace(/-/g, " ")}</td>
                    <td className="px-4 py-3">
                      {def.audience ? (
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] capitalize text-zinc-400">
                          {def.audience.replace(/-/g, " ")}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {def.lastRunAt
                        ? new Date(def.lastRunAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        def.isActive ? "bg-emerald-400/10 text-emerald-400" : "bg-zinc-800 text-zinc-500",
                      )}>
                        {def.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelect(def); }}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
                          title="Run"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(def); }}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatedDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Report"
        size="sm"
      >
        <div className="px-6 py-4">
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete <span className="font-medium text-white">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <AnimatedButton variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</AnimatedButton>
            <AnimatedButton
              variant="danger"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Delete
            </AnimatedButton>
          </div>
        </div>
      </AnimatedDialog>
    </div>
  );
}
