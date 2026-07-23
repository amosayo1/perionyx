"use client";

import type { RiskForecast } from "./risk-types";

interface RiskTrendChartProps {
  forecasts: RiskForecast[];
  title?: string;
}

export function RiskTrendChart({ forecasts, title = "Risk Trend" }: RiskTrendChartProps) {
  const width = 400;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };

  if (forecasts.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] text-sm text-gray-500">
        No forecast data available
      </div>
    );
  }

  const values = forecasts.map((f) => f.forecastValue);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const range = max - min || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = forecasts.map((f, i) => {
    const x = padding.left + (i / Math.max(forecasts.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((f.forecastValue - min) / range) * chartHeight;
    return { x, y, ...f };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const upperPath = points.map((p, i) => {
    const uy = padding.top + chartHeight - ((p.forecastValue + p.upperBound - min) / range) * chartHeight;
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${uy.toFixed(1)}`;
  }).join(" ");

  const lowerPath = points.map((p, i) => {
    const ly = padding.top + chartHeight - ((p.forecastValue + p.lowerBound - min) / range) * chartHeight;
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${ly.toFixed(1)}`;
  }).join(" ");

  const areaPath = `${upperPath} ${lowerPath.split("").reverse().join("")}`;

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-300">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(251, 191, 36)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendArea)" />
        <path d={pathD} fill="none" stroke="rgb(251, 191, 36)" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(251, 191, 36)" />
        ))}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding.top + chartHeight - ((v - min) / range) * chartHeight;
          return (
            <g key={v}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgb(55, 65, 81)" strokeWidth="1" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" fill="rgb(107, 114, 128)" fontSize="10">{v}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
