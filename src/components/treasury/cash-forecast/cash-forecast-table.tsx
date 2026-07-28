"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Search, Eye } from "lucide-react";
import { MOCK_FORECASTS } from "./data";

const VISIBLE_COUNT = 20;

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  locked: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  superseded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function fmt(v: number): string {
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1_000_000_000) s = `$${(abs / 1_000_000_000).toFixed(1)}B`;
  else if (abs >= 1_000_000) s = `$${(abs / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) s = `$${(abs / 1_000).toFixed(1)}K`;
  else s = `$${abs.toFixed(0)}`;
  return v < 0 ? `-${s}` : s;
}

function cnColor(v: number): string {
  if (v >= 90) return "text-emerald-400";
  if (v >= 75) return "text-blue-400";
  if (v >= 60) return "text-amber-400";
  return "text-red-400";
}

export function CashForecastTable({ className }: { className?: string }) {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_FORECASTS;
    const q = query.toLowerCase();
    return MOCK_FORECASTS.filter(
      (f) =>
        f.entity.toLowerCase().includes(q) ||
        f.period.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q),
    );
  }, [query]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.period.localeCompare(a.period)),
    [filtered],
  );

  const displayed = showAll ? sorted : sorted.slice(0, VISIBLE_COUNT);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)} role="region" aria-label="Cash forecast records table">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-semibold text-white">Cash Forecast Records</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            aria-label="Search forecasts"
            placeholder="Search entity, period, owner..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
            className="w-72 rounded-md border border-white/[0.06] bg-zinc-800/50 py-1.5 pl-9 pr-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Forecast records">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-500">
              {["Period", "Entity", "Region", "Currency", "Opening Cash", "Inflows", "Outflows", "Op CF", "Inv CF", "Fin CF", "FX Impact", "Taxes", "Ending Cash", "Variance", "Var %", "Confidence", "Status", "Owner"].map(
                (h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {displayed.map((f) => (
              <tr key={f.id} className="border-b border-white/[0.03] text-zinc-300 last:border-0 hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-3 py-2.5 text-white">{f.period}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{f.entity}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{f.region}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-white">{f.currency}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-white">{fmt(f.openingCash)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-emerald-400">{fmt(f.inflows)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-red-400">{fmt(f.outflows)}</td>
                <td className={cn("whitespace-nowrap px-3 py-2.5 text-right", f.operatingCash >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(f.operatingCash)}</td>
                <td className={cn("whitespace-nowrap px-3 py-2.5 text-right", f.investingCash >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(f.investingCash)}</td>
                <td className={cn("whitespace-nowrap px-3 py-2.5 text-right", f.financingCash >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(f.financingCash)}</td>
                <td className={cn("whitespace-nowrap px-3 py-2.5 text-right", f.fxImpact >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(f.fxImpact)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-red-400">{fmt(f.taxes)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-white">{fmt(f.endingCash)}</td>
                <td className={cn("whitespace-nowrap px-3 py-2.5 text-right", f.variance >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(f.variance)}</td>
                <td className={cn("whitespace-nowrap px-3 py-2.5 text-right", f.variancePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {f.variancePercent >= 0 ? "+" : ""}{f.variancePercent.toFixed(1)}%
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <span className={cn("font-medium", cnColor(f.confidence))}>{f.confidence}%</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={cn("inline-block rounded border px-2 py-0.5 text-[10px] font-medium uppercase", STATUS_STYLES[f.status])}>{f.status}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-zinc-400">{f.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > VISIBLE_COUNT && (
        <div className="flex items-center justify-center border-t border-white/[0.06] px-5 py-3">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-zinc-800/50 px-4 py-1.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-expanded={showAll}
          >
            <Eye className="h-3.5 w-3.5" />
            {showAll ? "Show Less" : `View All ${sorted.length.toLocaleString()} Records`}
          </button>
        </div>
      )}
    </div>
  );
}
