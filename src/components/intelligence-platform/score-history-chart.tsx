"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FinancialScoreData } from "@/modules/intelligence-platform/types";

interface ScoreHistoryChartProps {
  history: FinancialScoreData[];
  scoreType: string;
}

function parseDate(d: string) {
  return new Date(d).getTime();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ScoreHistoryChart({ history, scoreType }: ScoreHistoryChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: FinancialScoreData } | null>(null);

  const sorted = useMemo(() => [...history].sort((a, b) => parseDate(a.createdAt) - parseDate(b.createdAt)), [history]);

  const { points, minVal, maxVal, yScale, xScale } = useMemo(() => {
    if (sorted.length === 0) return { points: [], minVal: 0, maxVal: 100, yScale: 1, xScale: 1 };
    const values = sorted.map((s) => s.score);
    let min = Math.min(...values);
    let max = Math.max(...values);
    const range = max - min;
    const pad = range * 0.15 || 10;
    min = Math.max(0, min - pad);
    max = Math.min(100, max + pad);
    if (min === max) { min = 0; max = 100; }
    const w = 600;
    const h = 200;
    const xScl = w / (sorted.length - 1 || 1);
    const yScl = h / (max - min);
    const pts = sorted.map((s, i) => ({
      x: i * xScl,
      y: h - (s.score - min) * yScl,
      item: s,
    }));
    return { points: pts, minVal: min, maxVal: max, yScale: yScl, xScale: xScl };
  }, [sorted]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");
  }, [points]);

  if (sorted.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900/40">
        <p className="text-xs text-zinc-600">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {scoreType.replace(/-/g, " ")} History
      </h4>
      <div className="relative rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
        <svg viewBox="0 0 600 200" className="w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="redZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(239,68,68,0.1)" />
              <stop offset="100%" stopColor="rgba(239,68,68,0)" />
            </linearGradient>
            <linearGradient id="amberZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245,158,11,0.1)" />
              <stop offset="100%" stopColor="rgba(245,158,11,0)" />
            </linearGradient>
            <linearGradient id="greenZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(52,211,153,0.1)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="600" height={200 * (1 - 75 / 100)} fill="url(#redZone)" opacity={0.3} />
          <rect x="0" y={200 * (1 - 75 / 100)} width="600" height={200 * ((75 - 50) / 100)} fill="url(#amberZone)" opacity={0.3} />
          <rect x="0" y={200 * (1 - 50 / 100)} width="600" height={200 * (50 / 100)} fill="url(#greenZone)" opacity={0.3} />

          <line x1="0" y1={200 * (1 - 75 / 100)} x2="600" y2={200 * (1 - 75 / 100)} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={200 * (1 - 50 / 100)} x2="600" y2={200 * (1 - 50 / 100)} stroke="rgba(245,158,11,0.2)" strokeWidth="1" strokeDasharray="4 4" />

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

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="rgba(251,191,36,0.9)"
              className="cursor-pointer"
              onMouseEnter={(e) => {
                const rect = (e.target as SVGCircleElement).closest("svg")?.getBoundingClientRect();
                if (rect) setTooltip({ x: p.x + 10, y: p.y - 10, item: p.item });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>

        {tooltip && (
          <div
            className="absolute z-10 rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 shadow-xl pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="text-xs font-medium text-white">{tooltip.item.score.toFixed(1)}</p>
            <p className="text-[10px] text-zinc-500">{new Date(tooltip.item.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-600">
          <span>{sorted.length > 0 ? formatDate(sorted[0].createdAt) : ""}</span>
          <span>{sorted.length > 0 ? formatDate(sorted[sorted.length - 1].createdAt) : ""}</span>
        </div>
      </div>
    </div>
  );
}
