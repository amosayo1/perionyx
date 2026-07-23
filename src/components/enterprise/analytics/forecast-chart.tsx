"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ForecastPoint } from "./types";

interface ForecastChartProps {
  data: ForecastPoint[];
  title?: string;
  height?: number;
  showConfidence?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toFixed(0)}`;
}

export const ForecastChart = memo(function ForecastChart({
  data,
  title,
  height = 240,
  showConfidence = true,
  className,
}: ForecastChartProps) {
  const { svgContent, minVal, maxVal } = useMemo(() => {
    if (!data.length) return { svgContent: null, minVal: 0, maxVal: 0 };

    const allVals: number[] = [];
    data.forEach((d) => {
      allVals.push(d.value);
      if (showConfidence && d.lowerBound !== undefined) allVals.push(d.lowerBound!);
      if (showConfidence && d.upperBound !== undefined) allVals.push(d.upperBound!);
    });
    const minVal = Math.min(...allVals, 0);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || 1;
    const pad = { top: 20, right: 16, bottom: 28, left: 64 };
    const chartW = 600 - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;
    const stepX = chartW / Math.max(data.length - 1, 1);

    const forecastLine = data.map((d, i) => {
      const x = pad.left + i * stepX;
      const y = pad.top + chartH - ((d.value - minVal) / range) * chartH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    const confidenceArea = showConfidence && data.some((d) => d.lowerBound !== undefined && d.upperBound !== undefined)
      ? data.filter((d) => d.lowerBound !== undefined && d.upperBound !== undefined).map((d, i) => {
          const x = pad.left + data.indexOf(d) * stepX;
          const lowY = pad.top + chartH - ((d.lowerBound! - minVal) / range) * chartH;
          const highY = pad.top + chartH - ((d.upperBound! - minVal) / range) * chartH;
          return { x, lowY, highY };
        })
      : null;

    const confBandPath = confidenceArea && confidenceArea.length > 1
      ? `${confidenceArea.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.lowY.toFixed(1)}`).join(" ")} ${confidenceArea.map((p, i) => `${i === 0 ? "L" : "L"}${p.x.toFixed(1)},${p.highY.toFixed(1)}`).reverse().join(" ")} Z`
      : null;

    return { svgContent: { forecastLine, confBandPath, confidenceArea, pad, chartW, chartH, range, stepX }, minVal, maxVal };
  }, [data, height, showConfidence]);

  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center text-xs text-zinc-600", className)} style={{ height }}>
        No forecast data
      </div>
    );
  }

  const { forecastLine, confBandPath, confidenceArea, pad, chartW, chartH, range } = svgContent!;
  const width = 600;

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="conf-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const val = minVal + (maxVal - minVal) * ratio;
          const y = pad.top + chartH - ((val - minVal) / range) * chartH;
          return (
            <g key={ratio}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="2 2" />
              <text x={pad.left - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize={10}>{formatCurrency(val)}</text>
            </g>
          );
        })}

        {confBandPath && (
          <path d={confBandPath} fill="url(#conf-band)" stroke="none" />
        )}

        {confidenceArea && confidenceArea.length > 1 && (
          <g>
            {confidenceArea.map((p, i) => (
              <line
                key={i}
                x1={p.x} y1={p.lowY} x2={p.x} y2={p.highY}
                stroke="rgba(201,168,76,0.15)" strokeWidth={1}
              />
            ))}
          </g>
        )}

        <path d={forecastLine} fill="none" stroke="#c9a84c" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => {
          const x = pad.left + i * (chartW / Math.max(data.length - 1, 1));
          const y = pad.top + chartH - ((d.value - minVal) / range) * chartH;
          return d.confidence !== undefined ? (
            <circle key={i} cx={x} cy={y} r={3} fill="#c9a84c" opacity={d.confidence / 100} />
          ) : (
            <circle key={i} cx={x} cy={y} r={2.5} fill="#c9a84c" />
          );
        })}

        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i) => (
          <text
            key={i}
            x={pad.left + data.indexOf(d) * (chartW / Math.max(data.length - 1, 1))}
            y={height - 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)" fontSize={9}
          >
            {new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>

      {showConfidence && data.some((d) => d.confidence !== undefined) && (
        <div className="flex items-center gap-4 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-[#c9a84c]/30" />
            Confidence range
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#c9a84c]" />
            Forecast
          </span>
        </div>
      )}
    </div>
  );
});
