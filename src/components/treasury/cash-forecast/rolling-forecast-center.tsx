"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { MOCK_FORECASTS } from "./data";

type Horizon = 13 | 26 | 52;

const HORIZONS: Horizon[] = [13, 26, 52];

function fmt(v: number): string {
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1_000_000_000) s = `$${(abs / 1_000_000_000).toFixed(1)}B`;
  else if (abs >= 1_000_000) s = `$${(abs / 1_000_000).toFixed(0)}M`;
  else if (abs >= 1_000) s = `$${(abs / 1_000).toFixed(0)}K`;
  else s = `$${abs.toFixed(0)}`;
  return v < 0 ? `-${s}` : s;
}

function MiniBar({ value, max, positive }: { value: number; max: number; positive: boolean }) {
  const pct = max > 0 ? (Math.abs(value) / max) * 100 : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-5 w-16 rounded-sm bg-zinc-800" role="img" aria-label={`${positive ? "positive" : "negative"} bar of ${pct.toFixed(0)}%`}>
        <div
          className={cn("h-5 rounded-sm transition-all", positive ? "bg-emerald-500/60" : "bg-red-500/60")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="w-16 text-right text-[12px] font-medium tabular-nums text-zinc-300">{fmt(value)}</span>
    </div>
  );
}

export function RollingForecastCenter({ className }: { className?: string }) {
  const [horizon, setHorizon] = useState<Horizon>(13);

  const rows = useMemo(() => {
    const count = Math.min(horizon, MOCK_FORECASTS.length);
    return MOCK_FORECASTS.slice(0, count).map((f, i) => {
      const weekNum = i + 1;
      const year = 2026;
      const netCashFlow = f.inflows - f.outflows;
      return {
        week: `W${weekNum} ${year}`,
        openingCash: f.openingCash,
        inflows: f.inflows,
        outflows: f.outflows,
        netCashFlow,
        endingCash: f.endingCash,
        confidence: f.confidence,
      };
    });
  }, [horizon]);

  const maxAbs = useMemo(
    () =>
      rows.reduce(
        (a, r) => Math.max(a, Math.abs(r.openingCash), Math.abs(r.inflows), Math.abs(r.outflows), Math.abs(r.netCashFlow), Math.abs(r.endingCash)),
        1,
      ),
    [rows],
  );

  const summary = useMemo(
    () => ({
      openingCash: rows.reduce((a, r) => a + r.openingCash, 0),
      inflows: rows.reduce((a, r) => a + r.inflows, 0),
      outflows: rows.reduce((a, r) => a + r.outflows, 0),
      netCashFlow: rows.reduce((a, r) => a + r.netCashFlow, 0),
      endingCash: rows.reduce((a, r) => a + r.endingCash, 0),
      confidence: rows.length ? Math.round(rows.reduce((a, r) => a + r.confidence, 0) / rows.length) : 0,
    }),
    [rows],
  );

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)} role="region" aria-label="Rolling forecast center">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-semibold text-white">Rolling Forecast</h3>
        <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-zinc-800/50 p-0.5" role="tablist" aria-label="Forecast horizon">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              role="tab"
              aria-selected={horizon === h}
              className={cn(
                "rounded-md px-3 py-1 text-[13px] font-medium transition-colors",
                horizon === h ? "bg-gold/10 text-gold" : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              {h}-Week
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label={`${horizon}-week rolling forecast`}>
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-500">
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Week</th>
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Opening Cash</th>
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Inflows</th>
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Outflows</th>
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Net Cash Flow</th>
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Ending Cash</th>
              <th className="whitespace-nowrap px-3 py-3 text-[11px] font-medium uppercase tracking-wider">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.week} className="border-b border-white/[0.03] text-zinc-300 last:border-0 hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-3 py-2 font-medium text-white">{r.week}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <MiniBar value={r.openingCash} max={maxAbs} positive />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <MiniBar value={r.inflows} max={maxAbs} positive />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <MiniBar value={r.outflows} max={maxAbs} positive={false} />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <MiniBar value={r.netCashFlow} max={maxAbs} positive={r.netCashFlow >= 0} />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <MiniBar value={r.endingCash} max={maxAbs} positive />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-16 rounded-full bg-zinc-800">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          r.confidence >= 90 ? "bg-emerald-500/60" : r.confidence >= 75 ? "bg-blue-500/60" : r.confidence >= 60 ? "bg-amber-500/60" : "bg-red-500/60",
                        )}
                        style={{ width: `${r.confidence}%` }}
                      />
                    </div>
                    <span className={cn(
                      "w-8 text-right text-[12px] font-medium tabular-nums",
                      r.confidence >= 90 ? "text-emerald-400" : r.confidence >= 75 ? "text-blue-400" : r.confidence >= 60 ? "text-amber-400" : "text-red-400",
                    )}>
                      {r.confidence}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.06] bg-zinc-800/30 text-[13px] font-semibold text-white">
              <td className="whitespace-nowrap px-3 py-2.5">Total</td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <MiniBar value={summary.openingCash} max={maxAbs} positive />
              </td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <MiniBar value={summary.inflows} max={maxAbs} positive />
              </td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <MiniBar value={summary.outflows} max={maxAbs} positive={false} />
              </td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <MiniBar value={summary.netCashFlow} max={maxAbs} positive={summary.netCashFlow >= 0} />
              </td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <MiniBar value={summary.endingCash} max={maxAbs} positive />
              </td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-16 rounded-full bg-zinc-800">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        summary.confidence >= 90 ? "bg-emerald-500/60" : summary.confidence >= 75 ? "bg-blue-500/60" : summary.confidence >= 60 ? "bg-amber-500/60" : "bg-red-500/60",
                      )}
                      style={{ width: `${summary.confidence}%` }}
                    />
                  </div>
                  <span className={cn(
                    "w-8 text-right text-[12px] font-medium tabular-nums",
                    summary.confidence >= 90 ? "text-emerald-400" : summary.confidence >= 75 ? "text-blue-400" : summary.confidence >= 60 ? "text-amber-400" : "text-red-400",
                  )}>
                    {summary.confidence}%
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
