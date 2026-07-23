"use client";

import { cn } from "@/lib/utils";

interface CashFlowChartProps {
  inflow: number[];
  outflow: number[];
  labels?: string[];
  height?: number;
  className?: string;
}

export function CashFlowChart({ inflow, outflow, labels, height = 120, className }: CashFlowChartProps) {
  if (!inflow.length && !outflow.length) {
    return <div className={cn("flex items-center justify-center text-xs text-zinc-600", className)} style={{ height }}>No data</div>;
  }

  const allValues = [...inflow, ...outflow];
  const max = Math.max(...allValues, 1);
  const w = 280;
  const h = height;
  const padding = { top: 8, right: 8, bottom: 20, left: 8 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const barWidth = inflow.length ? Math.max(4, (chartW / inflow.length) - 2) : 8;
  const halfBar = barWidth / 2;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className={cn("block overflow-visible", className)}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={padding.left} x2={w - padding.right}
          y1={padding.top + chartH * (1 - pct)}
          y2={padding.top + chartH * (1 - pct)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}

      {/* Inflow bars */}
      {inflow.map((v, i) => {
        const x = padding.left + (i / Math.max(inflow.length - 1, 1)) * chartW - halfBar;
        const barH = (v / max) * chartH;
        return (
          <rect
            key={`in-${i}`}
            x={x}
            y={padding.top + chartH - barH}
            width={barWidth}
            height={barH}
            fill="url(#cf-inflow)"
            rx={1}
            opacity={0.8}
          >
            <title>{`Inflow: ${v.toLocaleString()}`}</title>
          </rect>
        );
      })}

      {/* Outflow bars */}
      {outflow.map((v, i) => {
        const x = padding.left + (i / Math.max(outflow.length - 1, 1)) * chartW + 2;
        const barH = (v / max) * chartH;
        return (
          <rect
            key={`out-${i}`}
            x={x}
            y={padding.top + chartH - barH}
            width={barWidth}
            height={barH}
            fill="url(#cf-outflow)"
            rx={1}
            opacity={0.8}
          >
            <title>{`Outflow: ${v.toLocaleString()}`}</title>
          </rect>
        );
      })}

      {labels && (
        <text x={w / 2} y={h - 2} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={9}>
          {labels[labels.length - 1]}
        </text>
      )}

      <defs>
        <linearGradient id="cf-inflow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#d4af37" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="cf-outflow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.15} />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface LiquidityGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subtitle?: string;
  className?: string;
}

export function LiquidityGauge({ value, max = 100, size = 100, strokeWidth = 8, label, subtitle, className }: LiquidityGaugeProps) {
  const pct = Math.min(value / max, 1);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const color = pct >= 0.7 ? "#d4af37" : pct >= 0.4 ? "rgb(251, 191, 36)" : "rgb(239, 68, 68)";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white tabular-nums">{Math.round(pct * 100)}%</span>
        {label && <span className="text-[9px] text-zinc-500 mt-0.5">{label}</span>}
      </div>
      {subtitle && <p className="mt-1 text-[10px] text-zinc-600">{subtitle}</p>}
    </div>
  );
}

interface CurrencyBarProps {
  currency: string;
  balance: string;
  percentage: number;
  color?: string;
}

export function CurrencyExposureBar({ currency, balance, percentage, color = "#d4af37" }: CurrencyBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs font-medium text-zinc-300">{currency}</span>
      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-20 text-right text-xs font-mono text-white tabular-nums">{balance}</span>
    </div>
  );
}
