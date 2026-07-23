"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { AIForecast } from "./ai-types";

interface ForecastChartProps {
  forecast: AIForecast;
  className?: string;
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const ForecastChart = memo(function ForecastChart({ forecast, className }: ForecastChartProps) {
  const combined = useMemo(() => {
    const points: { label: string; value: number; lower?: number; upper?: number; isForecast: boolean }[] = [];
    const all = [...forecast.historicalValues, ...forecast.forecastValues];
    const allLower = [...Array(forecast.historicalValues.length).fill(null), ...forecast.lowerBound];
    const allUpper = [...Array(forecast.historicalValues.length).fill(null), ...forecast.upperBound];
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < all.length; i++) {
      points.push({
        label: labels[i] || `P${i + 1}`,
        value: all[i],
        lower: allLower[i] ?? undefined,
        upper: allUpper[i] ?? undefined,
        isForecast: i >= forecast.historicalValues.length,
      });
    }
    return points;
  }, [forecast]);

  const maxVal = Math.max(...combined.map(p => p.upper || p.value));
  const minVal = Math.min(...combined.map(p => p.lower || p.value), 0);
  const range = maxVal - minVal || 1;

  const W = 100;
  const H = 200;
  const PAD = { left: 55, right: 10, top: 20, bottom: 30 };

  function x(i: number): number {
    return PAD.left + (i / Math.max(combined.length - 1, 1)) * (W - PAD.left - PAD.right);
  }

  function y(val: number): number {
    return PAD.top + H - ((val - minVal) / range) * H;
  }

  const forecastStart = combined.findIndex(p => p.isForecast);
  const splitX = forecastStart >= 0 ? x(forecastStart) : x(combined.length - 1);

  const linePath = combined.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");

  const upperPath = combined.filter(p => p.upper !== undefined).map((p, i) => `${i === 0 ? "M" : "L"}${x(combined.findIndex(c => c === p))},${y(p.upper!)}`).join(" ");
  const lowerPathRev = combined.filter(p => p.lower !== undefined).reverse().map((p, i) => {
    const idx = combined.findIndex(c => c === p);
    return `${i === 0 ? "L" : "L"}${x(idx)},${y(p.lower!)}`;
  }).join(" ");

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-zinc-300">{forecast.metric.replace(/-/g, " ")}</h3>
          <p className="text-[11px] text-zinc-500">{forecast.domain} · {forecast.horizon} · {forecast.trend}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> Historical
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-[#d4af37]" /> Forecast
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H + PAD.top + PAD.bottom}`} className="w-full" style={{ maxHeight: 300 }}>
        <defs>
          <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#d4af37" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {splitX > PAD.left && (
          <line x1={splitX} y1={PAD.top} x2={splitX} y2={PAD.top + H} stroke="rgb(63,63,70)" strokeWidth={1} strokeDasharray="4,4" />
        )}

        <line x1={PAD.left} y1={PAD.top + H} x2={W - PAD.right} y2={PAD.top + H} stroke="rgb(39,39,42)" strokeWidth={1} />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + H} stroke="rgb(39,39,42)" strokeWidth={1} />

        {[0, 0.25, 0.5, 0.75, 1].map(tick => {
          const vy = PAD.top + H - tick * H;
          return (
            <g key={tick}>
              <line x1={PAD.left} y1={vy} x2={W - PAD.right} y2={vy} stroke="rgb(39,39,42)" strokeWidth={1} />
              <text x={PAD.left - 6} y={vy + 3} textAnchor="end" fill="rgb(113,113,122)" fontSize={8}>
                {formatValue(minVal + tick * range)}
              </text>
            </g>
          );
        })}

        {combined.filter(p => p.upper !== undefined && p.lower !== undefined).length > 0 && (
          <path d={`${upperPath} ${lowerPathRev} Z`} fill="url(#confidenceBand)" />
        )}

        {combined.filter(p => p.upper !== undefined).map((p, i) => {
          const idx = combined.findIndex(c => c === p);
          return (
            <line
              key={`ul-${i}`}
              x1={x(idx)} y1={y(p.upper!)}
              x2={x(idx)} y2={y(p.lower!)}
              stroke="#d4af37"
              strokeWidth={1}
              strokeOpacity={0.3}
            />
          );
        })}

        <path d={linePath} fill="none" stroke="rgb(96,165,250)" strokeWidth={2} />
        <path d={linePath} fill="none" stroke="#d4af37" strokeWidth={2} strokeDasharray="6,3" className="clip-future" />

        {combined.map((p, i) => (
          <circle
            key={i}
            cx={x(i)} cy={y(p.value)} r={2.5}
            fill={p.isForecast ? "#d4af37" : "rgb(96,165,250)"}
            stroke="rgb(24,24,27)"
            strokeWidth={1}
          />
        ))}

        {combined.filter((_, i) => i % 2 === 0).map((p, i) => {
          const idx = combined.findIndex(c => c === p);
          return (
            <text
              key={`lbl-${i}`}
              x={x(idx)} y={PAD.top + H + 16}
              textAnchor="middle"
              fill="rgb(113,113,122)"
              fontSize={7}
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {forecast.keyDrivers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {forecast.keyDrivers.map((d, i) => (
            <span key={i} className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
