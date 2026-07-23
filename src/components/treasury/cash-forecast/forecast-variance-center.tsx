"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, HelpCircle, Search } from "lucide-react";
import { MOCK_VARIANCES } from "./data";
import type { VarianceRecord, CashCategory } from "./types";
import { EnterpriseTable } from "@/components/enterprise/table/data-table";
import type { Column, FilterDef, FilterValue } from "@/components/enterprise/table/types";

const CATEGORIES: CashCategory[] = ["operating", "investing", "financing", "fx", "tax"];
const STATUSES: VarianceRecord["status"][] = ["open", "investigating", "explained", "resolved"];
const ENTITIES = [...new Set(MOCK_VARIANCES.map((v) => v.entity))];

const STATUS_CONFIG: Record<VarianceRecord["status"], { label: string; className: string }> = {
  open: { label: "Open", className: "bg-red-500/15 text-red-400 border-red-500/25" },
  investigating: { label: "Investigating", className: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  explained: { label: "Explained", className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  resolved: { label: "Resolved", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
};

const VARIANCE_PCT_CLASS = (pct: number) => {
  const abs = Math.abs(pct);
  if (abs < 5) return "text-emerald-400";
  if (abs < 10) return "text-amber-400";
  return "text-red-400";
};

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

const FILTER_DEFS: FilterDef[] = [
  {
    id: "entity",
    label: "Entity",
    type: "select",
    options: ENTITIES.map((e) => ({ value: e, label: e })),
    placeholder: "All Entities",
  },
  {
    id: "category",
    label: "Category",
    type: "select",
    options: CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
    placeholder: "All Categories",
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
    placeholder: "All Statuses",
  },
  {
    id: "period",
    label: "Period",
    type: "date-range",
    placeholder: "Period range",
  },
];

const columns: Column<VarianceRecord>[] = [
  {
    id: "period",
    header: "Period",
    accessor: (r) => <span className="text-zinc-300 whitespace-nowrap">{r.period}</span>,
    sortKey: "period",
    comparator: (a, b) => a.period.localeCompare(b.period),
  },
  {
    id: "entity",
    header: "Entity",
    accessor: (r) => <span className="text-white whitespace-nowrap">{r.entity}</span>,
    sortKey: "entity",
    comparator: (a, b) => a.entity.localeCompare(b.entity),
  },
  {
    id: "currency",
    header: "Currency",
    accessor: (r) => <span className="text-zinc-300">{r.currency}</span>,
    sortKey: "currency",
    comparator: (a, b) => a.currency.localeCompare(b.currency),
  },
  {
    id: "category",
    header: "Category",
    accessor: (r) => (
      <span className="text-xs text-zinc-400">
        {r.category.charAt(0).toUpperCase() + r.category.slice(1)}
      </span>
    ),
    sortKey: "category",
    comparator: (a, b) => a.category.localeCompare(b.category),
  },
  {
    id: "forecasted",
    header: "Forecasted",
    accessor: (r) => <span className="text-zinc-300 whitespace-nowrap">${fmt(r.forecasted)}</span>,
    sortKey: "forecasted",
    comparator: (a, b) => a.forecasted - b.forecasted,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "actual",
    header: "Actual",
    accessor: (r) => <span className="text-zinc-300 whitespace-nowrap">${fmt(r.actual)}</span>,
    sortKey: "actual",
    comparator: (a, b) => a.actual - b.actual,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "variance",
    header: "Variance",
    accessor: (r) => (
      <div className="flex flex-col items-end gap-1">
        <span className={cn("font-medium whitespace-nowrap", r.variance >= 0 ? "text-emerald-400" : "text-red-400")}>
          ${fmt(r.variance)}
        </span>
        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", r.variance >= 0 ? "bg-emerald-500" : "bg-red-500")}
            style={{ width: `${Math.min(Math.abs(r.variancePercent), 100)}%` }}
          />
        </div>
      </div>
    ),
    sortKey: "variance",
    comparator: (a, b) => Math.abs(a.variance) - Math.abs(b.variance),
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "variancePercent",
    header: "Var %",
    accessor: (r) => (
      <span className={cn("font-medium whitespace-nowrap", VARIANCE_PCT_CLASS(r.variancePercent))}>
        {r.variancePercent >= 0 ? "+" : ""}{r.variancePercent.toFixed(1)}%
      </span>
    ),
    sortKey: "variancePercent",
    comparator: (a, b) => Math.abs(a.variancePercent) - Math.abs(b.variancePercent),
  },
  {
    id: "reason",
    header: "Reason",
    accessor: (r) => <span className="text-zinc-400 max-w-[200px] truncate block" title={r.reason}>{r.reason}</span>,
    sortKey: "reason",
    comparator: (a, b) => a.reason.localeCompare(b.reason),
  },
  {
    id: "owner",
    header: "Owner",
    accessor: (r) => <span className="text-zinc-400 whitespace-nowrap">{r.owner}</span>,
    sortKey: "owner",
    comparator: (a, b) => a.owner.localeCompare(b.owner),
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => (
      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border", STATUS_CONFIG[r.status].className)}>
        {r.status === "open" && <AlertTriangle className="w-3 h-3" />}
        {r.status === "investigating" && <Search className="w-3 h-3" />}
        {r.status === "explained" && <HelpCircle className="w-3 h-3" />}
        {r.status === "resolved" && <CheckCircle2 className="w-3 h-3" />}
        {STATUS_CONFIG[r.status].label}
      </span>
    ),
    sortKey: "status",
    comparator: (a, b) => a.status.localeCompare(b.status),
    cellConfig: { type: "status" },
  },
];

export function ForecastVarianceCenter() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("period");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  const filtered = useMemo(() => {
    let data = [...MOCK_VARIANCES];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (v) =>
          v.entity.toLowerCase().includes(q) ||
          v.reason.toLowerCase().includes(q) ||
          v.owner.toLowerCase().includes(q),
      );
    }

    for (const fv of filterValues) {
      if (!fv.value.trim()) continue;
      if (fv.id === "period" && fv.operator === "between") {
        if (fv.value) data = data.filter((v) => v.period >= fv.value);
        if (fv.value2 && fv.value2.length > 0) data = data.filter((v) => v.period <= fv.value2!);
        continue;
      }
      data = data.filter((v) => {
        const cellVal = String((v as unknown as Record<string, unknown>)[fv.id] ?? "").toLowerCase();
        const filterVal = fv.value.toLowerCase();
        switch (fv.operator) {
          case "eq": return cellVal === filterVal;
          case "neq": return cellVal !== filterVal;
          case "contains": return cellVal.includes(filterVal);
          case "gt": return Number(cellVal) > Number(filterVal);
          case "gte": return Number(cellVal) >= Number(filterVal);
          case "lt": return Number(cellVal) < Number(filterVal);
          case "lte": return Number(cellVal) <= Number(filterVal);
          default: return true;
        }
      });
    }

    return data;
  }, [search, filterValues]);

  const summary = useMemo(() => {
    if (!filtered.length) return null;
    const totalVariance = filtered.reduce((s, v) => s + v.variance, 0);
    const avgVarPct = filtered.reduce((s, v) => s + v.variancePercent, 0) / filtered.length;
    const positive = filtered.filter((v) => v.variance >= 0).length;
    const negative = filtered.filter((v) => v.variance < 0).length;
    const largest = filtered.reduce((max, v) => Math.abs(v.variance) > Math.abs(max.variance) ? v : max);
    return { totalVariance, avgVarPct, positive, negative, largest };
  }, [filtered]);

  const categorySubtotals = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const records = filtered.filter((v) => v.category === cat);
      const total = records.reduce((s, v) => s + v.variance, 0);
      const count = records.length;
      return { category: cat, total, count };
    }).filter((g) => g.count > 0);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Variance Analysis Center</h2>
        <span className="text-sm text-zinc-400">{filtered.length} records</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {summary && (
          <>
            <div className="bg-zinc-900/50 border border-white/[0.06] rounded-lg p-3">
              <span className="text-xs text-zinc-500">Total Variance</span>
              <div className={cn("text-lg font-semibold mt-0.5", summary.totalVariance >= 0 ? "text-emerald-400" : "text-red-400")}>
                ${fmt(summary.totalVariance)}
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/[0.06] rounded-lg p-3">
              <span className="text-xs text-zinc-500">Avg Variance %</span>
              <div className={cn("text-lg font-semibold mt-0.5", VARIANCE_PCT_CLASS(summary.avgVarPct))}>
                {summary.avgVarPct.toFixed(1)}%
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/[0.06] rounded-lg p-3">
              <span className="text-xs text-zinc-500">Positive</span>
              <div className="text-lg font-semibold mt-0.5 text-emerald-400">{summary.positive}</div>
            </div>
            <div className="bg-zinc-900/50 border border-white/[0.06] rounded-lg p-3">
              <span className="text-xs text-zinc-500">Negative</span>
              <div className="text-lg font-semibold mt-0.5 text-red-400">{summary.negative}</div>
            </div>
            <div className="bg-zinc-900/50 border border-white/[0.06] rounded-lg p-3">
              <span className="text-xs text-zinc-500">Largest Variance</span>
              <div className="text-sm font-semibold mt-0.5 text-white truncate">{summary.largest.entity}</div>
              <div className={cn("text-xs", summary.largest.variance >= 0 ? "text-emerald-400" : "text-red-400")}>
                ${fmt(summary.largest.variance)}
              </div>
            </div>
          </>
        )}
      </div>

      {categorySubtotals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categorySubtotals.map((g) => (
            <div
              key={g.category}
              className={cn(
                "text-xs px-2 py-1 rounded border",
                g.total >= 0
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                  : "text-red-400 border-red-500/20 bg-red-500/10",
              )}
            >
              {g.category.charAt(0).toUpperCase() + g.category.slice(1)}: ${fmt(g.total)} ({g.count})
            </div>
          ))}
        </div>
      )}

      <EnterpriseTable
        data={filtered}
        columns={columns}
        keyExtractor={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search entity, reason, owner..."
        filterDefs={FILTER_DEFS}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        emptyTitle="No variance records"
        emptyDescription="No records match your filters"
        stickyHeader
        exportable
        exportFilename="forecast-variance"
      />
    </div>
  );
}
