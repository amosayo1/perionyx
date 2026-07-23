"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { TrendingDown, Droplets, Wallet, AlertTriangle } from "lucide-react";
import { MOCK_LIQUIDITY } from "./data";
import type { LiquidityProjection } from "./types";
import { EnterpriseTable } from "@/components/enterprise/table/data-table";
import type { Column } from "@/components/enterprise/table/types";

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function ratioColor(r: number): string {
  if (r >= 2) return "text-emerald-400";
  if (r >= 1.5) return "text-blue-400";
  if (r >= 1) return "text-amber-400";
  return "text-red-400";
}

function coverageColor(d: number): string {
  if (d >= 180) return "text-emerald-400";
  if (d >= 90) return "text-amber-400";
  return "text-red-400";
}

const STATUS_STYLES: Record<string, string> = {
  healthy: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  warning: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  critical: "border-red-500/30 text-red-400 bg-red-500/10",
};

const columns: Column<LiquidityProjection>[] = [
  {
    id: "period",
    header: "Period",
    accessor: (r) => <span className="text-zinc-200">{r.period}</span>,
    sortKey: "period",
    comparator: (a, b) => a.period.localeCompare(b.period),
  },
  {
    id: "entity",
    header: "Entity",
    accessor: (r) => <span className="text-zinc-300">{r.entity}</span>,
    sortKey: "entity",
    comparator: (a, b) => a.entity.localeCompare(b.entity),
  },
  {
    id: "currency",
    header: "Ccy",
    accessor: (r) => <span className="text-zinc-400">{r.currency}</span>,
    sortKey: "currency",
    comparator: (a, b) => a.currency.localeCompare(b.currency),
  },
  {
    id: "projectedLiquidity",
    header: "Projected",
    accessor: (r) => <span className="text-right tabular-nums text-zinc-200">{fmt(r.projectedLiquidity)}</span>,
    sortKey: "projectedLiquidity",
    comparator: (a, b) => a.projectedLiquidity - b.projectedLiquidity,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "minimumLiquidity",
    header: "Minimum Required",
    accessor: (r) => <span className="text-right tabular-nums text-zinc-300">{fmt(r.minimumLiquidity)}</span>,
    sortKey: "minimumLiquidity",
    comparator: (a, b) => a.minimumLiquidity - b.minimumLiquidity,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "liquidityBuffer",
    header: "Buffer",
    accessor: (r) => <span className="text-right tabular-nums text-zinc-200">{fmt(r.liquidityBuffer)}</span>,
    sortKey: "liquidityBuffer",
    comparator: (a, b) => a.liquidityBuffer - b.liquidityBuffer,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "availableCash",
    header: "Available Cash",
    accessor: (r) => <span className="text-right tabular-nums text-emerald-400">{fmt(r.availableCash)}</span>,
    sortKey: "availableCash",
    comparator: (a, b) => a.availableCash - b.availableCash,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "restrictedCash",
    header: "Restricted",
    accessor: (r) => <span className="text-right tabular-nums text-zinc-400">{fmt(r.restrictedCash)}</span>,
    sortKey: "restrictedCash",
    comparator: (a, b) => a.restrictedCash - b.restrictedCash,
    cellConfig: { type: "currency", currency: "USD", align: "right" },
  },
  {
    id: "liquidityRatio",
    header: "Ratio",
    accessor: (r) => (
      <span className={cn("text-right tabular-nums font-medium", ratioColor(r.liquidityRatio))}>
        {r.liquidityRatio.toFixed(2)}x
      </span>
    ),
    sortKey: "liquidityRatio",
    comparator: (a, b) => a.liquidityRatio - b.liquidityRatio,
  },
  {
    id: "coverageDays",
    header: "Coverage",
    accessor: (r) => (
      <span className={cn("text-right tabular-nums font-medium", coverageColor(r.coverageDays))}>
        {r.coverageDays}<span className="text-zinc-500 text-[11px]">d</span>
      </span>
    ),
    sortKey: "coverageDays",
    comparator: (a, b) => a.coverageDays - b.coverageDays,
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => (
      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[r.status])}>
        {r.status}
      </span>
    ),
    sortKey: "status",
    comparator: (a, b) => a.status.localeCompare(b.status),
    cellConfig: { type: "status" },
  },
];

export function LiquidityProjectionCenter({ className }: { className?: string }) {
  const [sortKey, setSortKey] = useState<string>("period");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => [...MOCK_LIQUIDITY].sort((a, b) => a.period.localeCompare(b.period)), []);

  const avgLiquidity = sorted.reduce((s, p) => s + p.projectedLiquidity, 0) / sorted.length;
  const minLiquidity = sorted.reduce((m, p) => Math.min(m, p.projectedLiquidity), Infinity);
  const totalBuffer = sorted.reduce((s, p) => s + p.liquidityBuffer, 0);
  const criticalCount = sorted.filter((p) => p.status === "critical").length;

  const chartMax = Math.max(...sorted.map((p) => Math.max(p.projectedLiquidity, p.minimumLiquidity)));
  const chartData = sorted.slice(0, 12);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={Droplets} label="Avg Projected Liquidity" value={fmt(avgLiquidity)} />
        <SummaryCard icon={TrendingDown} label="Min Projected Liquidity" value={fmt(minLiquidity)} />
        <SummaryCard icon={Wallet} label="Total Buffer" value={fmt(totalBuffer)} />
        <SummaryCard icon={AlertTriangle} label="Critical Entities" value={String(criticalCount)} sub={criticalCount === 1 ? "entity" : "entities"} />
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-sm font-medium text-white">Liquidity Trend — Projected vs Minimum</h3>
        <div className="relative h-48">
          <svg className="h-full w-full" viewBox={`0 0 ${chartData.length * 60} 200`} preserveAspectRatio="none" aria-label="Liquidity projection chart showing projected versus minimum required values">
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {chartData.map((p, i) => {
              const x = i * 60 + 10;
              const projH = (p.projectedLiquidity / chartMax) * 170;
              const minH = (p.minimumLiquidity / chartMax) * 170;
              return (
                <g key={p.id}>
                  <rect x={x} y={195 - projH} width={20} height={projH} rx={3} fill="#10b981" opacity={0.7} />
                  <rect x={x + 22} y={195 - minH} width={20} height={minH} rx={3} fill="#f59e0b" opacity={0.7} />
                </g>
              );
            })}
            <text x={2} y={12} className="text-[9px]" fill="#71717a">Projected</text>
            <rect x={52} y={3} width={10} height={8} rx={1} fill="#10b981" opacity={0.7} />
            <text x={64} y={12} className="text-[9px]" fill="#71717a">Minimum</text>
            <rect x={98} y={3} width={10} height={8} rx={1} fill="#f59e0b" opacity={0.7} />
          </svg>
        </div>
      </div>

      <EnterpriseTable
        data={sorted}
        columns={columns}
        keyExtractor={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchPlaceholder="Search projections..."
        emptyTitle="No projections"
        emptyDescription="No liquidity projections available"
        stickyHeader
        exportable
        exportFilename="liquidity-projections"
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}
