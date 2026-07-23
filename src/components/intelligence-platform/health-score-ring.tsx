"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HealthScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  previousScore?: number;
}

const SIZE_MAP = {
  sm: { dim: 80, stroke: 5, text: "text-sm", label: "text-[10px]", gap: "mt-1" },
  md: { dim: 120, stroke: 7, text: "text-xl", label: "text-xs", gap: "mt-1.5" },
  lg: { dim: 160, stroke: 9, text: "text-2xl", label: "text-sm", gap: "mt-2" },
};

function scoreColor(score: number) {
  if (score < 50) return "#ef4444";
  if (score < 75) return "#f59e0b";
  return "#34d399";
}

function scoreColorClass(score: number) {
  if (score < 50) return "text-red-400";
  if (score < 75) return "text-amber-400";
  return "text-emerald-400";
}

export function HealthScoreRing({ score, label, size = "md", previousScore }: HealthScoreRingProps) {
  const { dim, stroke, text, label: labelStyle, gap } = SIZE_MAP[size];
  const r = (dim - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  const color = scoreColor(score);
  const clamped = Math.min(Math.max(score, 0), 100);
  const change = previousScore !== undefined ? score - previousScore : undefined;

  useEffect(() => {
    const t = setTimeout(() => setProgress(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={dim} height={dim}>
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - progress / 100) }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-white", text)}>{Math.round(score)}</span>
          {change !== undefined && (
            <div className={cn("flex items-center gap-0.5", change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-zinc-500")}>
              {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              <span className="text-[10px] font-medium">{Math.abs(change).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      <span className={cn("text-zinc-500", labelStyle, gap)}>{label}</span>
    </div>
  );
}
