"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { IntelligenceTrendData, DataPoint, ForecastPoint } from "@/modules/intelligence-platform/types";

interface TrendChartProps {
  trend: IntelligenceTrendData;
  height?: number;
  showForecast?: boolean;
}

function parseDate(d: string) {
  const date = new Date(d);
  return date.getTime();
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({ trend, height = 200, showForecast }: TrendChartProps) {
  const allPoints = useMemo(() => {
    const pts: { date: string; value: number; isForecast: boolean }[] = trend.dataPoints.map((p) => ({ ...p, isForecast: false }));
    if (showForecast && trend.forecast) {
      trend.forecast.forEach((p) => pts.push({ date: p.date, value: p.value, isForecast: true }));
    }
    return pts.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [trend, showForecast]);

  const { pathD, forecastPathD, minVal, maxVal, xScale, yScale } = useMemo(() => {
    if (allPoints.length === 0) return { pathD: "", forecastPathD: "", minVal: 0, maxVal: 100, xScale: 0, yScale: 0 };
    const values = allPoints.map((p) => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.1 || 1;
    min -= padding;
    max += padding;
    if (min === max) { min -= 1; max += 1; }
    const w = 600;
    const h = height - 20;
    const xScl = w / (allPoints.length - 1 || 1);
    const yScl = h / (max - min);
    const toX = (i: number) => i * xScl;
    const toY = (v: number) => h - (v - min) * yScl + 10;
    const actual = allPoints.filter((p) => !p.isForecast);
    const forecast = allPoints.filter((p) => p.isForecast);
    const actualPath = actual.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`).join("");
    const forecastPath = forecast.map((p, i) => `${i === 0 ? "M" : "L"}${toX(actual.length + i).toFixed(1)},${toY(p.value).toFixed(1)}`).join("");
    return { pathD: actualPath, forecastPathD: forecastPath, minVal: min, maxVal: max, xScale: xScl, yScale: yScl };
  }, [allPoints, height]);

  const DirectionIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const directionColor = trend.direction === "up" ? "text-emerald-400" : trend.direction === "down" ? "text-red-400" : "text-zinc-400";

  if (allPoints.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900/40">
        <p className="text-xs text-zinc-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-white">{trend.label}</h4>
        <DirectionIcon className={cn("h-4 w-4", directionColor)} />
        {trend.changePercent != null && (
          <span className={cn("text-xs font-medium", directionColor)}>
            {trend.changePercent > 0 ? "+" : ""}{trend.changePercent.toFixed(1)}%
          </span>
        )}
      </div>
      <svg viewBox={`0 0 600 ${height}`} className="w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`trendFill-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(251,191,36,0.15)" />
            <stop offset="100%" stopColor="rgba(251,191,36,0)" />
          </linearGradient>
          {showForecast && trend.forecast && trend.forecast.length > 0 && (
            <linearGradient id={`forecastFill-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(251,191,36,0.08)" />
              <stop offset="100%" stopColor="rgba(251,191,36,0)" />
            </linearGradient>
          )}
        </defs>
        {pathD && (
          <motion.path
            d={pathD}
            fill="none"
            stroke="rgba(251,191,36,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        {showForecast && forecastPathD && (
          <>
            {trend.forecast && (
              <path
                d={`${forecastPathD} L${600 - (allPoints.filter((p) => !p.isForecast).length) * 0},${height - 10} L${0 + (allPoints.filter((p) => p.isForecast).length) * 0},${height - 10} Z`}
                fill={`url(#forecastFill-${trend.id})`}
                opacity={0.4}
              />
            )}
            <motion.path
              d={forecastPathD}
              fill="none"
              stroke="rgba(251,191,36,0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            />
            {trend.forecast && trend.forecast.map((fp, i) => {
              const idx = allPoints.findIndex((p) => p.date === fp.date && p.isForecast);
              if (idx < 0) return null;
              return (
                <circle
                  key={i}
                  cx={((idx) * xScale).toFixed(1)}
                  cy={(height - 10 - (fp.value - minVal) * yScale).toFixed(1)}
                  r="3"
                  fill="rgba(251,191,36,0.3)"
                  stroke="rgba(251,191,36,0.5)"
                  strokeWidth="1"
                />
              );
            })}
          </>
        )}
        {allPoints.filter((p) => !p.isForecast).map((p, i) => {
          const x = i * xScale;
          const y = height - 10 - (p.value - minVal) * yScale;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="rgba(251,191,36,0.9)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.02 }}
            />
          );
        })}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>{allPoints.length > 0 ? formatDate(allPoints[0].date) : ""}</span>
        <span>{allPoints.length > 0 ? formatDate(allPoints[allPoints.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}
