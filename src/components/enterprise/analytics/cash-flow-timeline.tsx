"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CashFlowPoint } from "./types";

interface CashFlowTimelineProps {
  data: CashFlowPoint[];
  height?: number;
  className?: string;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toFixed(0)}`;
}

export const CashFlowTimeline = memo(function CashFlowTimeline({
  data,
  height = 200,
  className,
}: CashFlowTimelineProps) {
  const { svgContent, yLabels } = useMemo(() => {
    if (!data.length) return { svgContent: null, yLabels: [] as string[] };

    const allValues = data.flatMap((d) => [d.inflows, d.outflows, d.balance]);
    const min = Math.min(...allValues, 0);
    const max = Math.max(...allValues);
    const range = max - min || 1;
    const padding = { top: 16, right: 8, bottom: 24, left: 56 };
    const chartW = 600 - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const stepX = chartW / Math.max(data.length - 1, 1);
    const barWidth = Math.max(4, Math.min(12, stepX * 0.3));

    const ySteps = 4;
    const yLabels: string[] = [];
    for (let i = 0; i <= ySteps; i++) {
      const val = min + (range * i) / ySteps;
      yLabels.push(formatCurrency(val));
    }

    const balancePath = data.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - ((d.balance - min) / range) * chartH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    const areaPath = `${balancePath} L${padding.left + (data.length - 1) * stepX},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

    const bars = data.map((d, i) => {
      const x = padding.left + i * stepX - barWidth / 2;
      const inflowH = ((d.inflows - min) / range) * chartH;
      const outflowH = ((d.outflows - min) / range) * chartH;
      const inflowY = padding.top + chartH - inflowH;
      const outflowY = padding.top + chartH - outflowH;
      return { x, barWidth, inflowH, outflowH, inflowY, outflowY, d, i };
    });

    return { svgContent: { balancePath, areaPath, bars, padding, chartW, chartH, min, range, stepX }, yLabels };
  }, [data, height]);

  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center text-xs text-zinc-600", className)} style={{ height }}>
        No cash flow data
      </div>
    );
  }

  const { balancePath, areaPath, bars, padding, chartW, chartH, min, range, stepX } = svgContent!;
  const width = 600;

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="balance-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
          </linearGradient>
        </defs>

        {yLabels.map((label, i) => {
          const y = padding.top + (chartH * i) / (yLabels.length - 1);
          return (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="2 2" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize={10}>{label}</text>
            </g>
          );
        })}

        <polygon points={areaPath} fill="url(#balance-area)" />
        <path d={balancePath} fill="none" stroke="#d4af37" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {bars.map((bar) => (
          <g key={bar.i}>
            {bar.d.inflows > 0 && (
              <rect
                x={bar.x} y={bar.inflowY} width={bar.barWidth} height={Math.max(bar.inflowH, 1)}
                fill="rgba(52,211,153,0.6)" rx={1}
              />
            )}
            {bar.d.outflows > 0 && (
              <rect
                x={bar.x + bar.barWidth + 1} y={bar.outflowY}
                width={bar.barWidth} height={Math.max(bar.outflowH, 1)}
                fill="rgba(248,113,113,0.6)" rx={1}
              />
            )}
          </g>
        ))}

        {data.filter((d) => d.forecast).length > 0 && (
          <line
            x1={padding.left + data.findIndex((d) => d.forecast) * stepX}
            x2={padding.left + data.findIndex((d) => d.forecast) * stepX}
            y1={padding.top} y2={padding.top + chartH}
            stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 4"
          />
        )}

        {data.filter((d) => d.forecast).length > 0 && (
          <text
            x={padding.left + data.findIndex((d) => d.forecast) * stepX}
            y={padding.top - 4}
            fill="rgba(255,255,255,0.2)" fontSize={9}
            textAnchor="middle"
          >
            Forecast →
          </text>
        )}

        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i) => (
          <text
            key={i}
            x={padding.left + data.indexOf(d) * stepX}
            y={height - 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)" fontSize={9}
          >
            {new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>
    </div>
  );
});
