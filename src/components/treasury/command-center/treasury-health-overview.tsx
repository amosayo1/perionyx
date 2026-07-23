"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MOCK_TREASURY_HEALTH } from "./data";

const CATEGORIES: { key: keyof typeof MOCK_TREASURY_HEALTH; label: string; color: string }[] = [
  { key: "liquidity", label: "Liquidity", color: "bg-emerald-500" },
  { key: "forecastAccuracy", label: "Forecast Accuracy", color: "bg-blue-500" },
  { key: "paymentSuccess", label: "Payment Success", color: "bg-violet-500" },
  { key: "bankHealth", label: "Bank Health", color: "bg-cyan-500" },
  { key: "compliance", label: "Compliance", color: "bg-amber-500" },
  { key: "cashAvailability", label: "Cash Availability", color: "bg-indigo-500" },
];

function statusLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Attention";
}

function statusTextColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-blue-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function scoreRing(score: number, size: number) {
  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#c9a84c" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#c9a84c" fontSize="16" fontWeight="bold">
        {score}
      </text>
    </svg>
  );
}

export function TreasuryHealthOverview({ className }: { className?: string }) {
  const health = MOCK_TREASURY_HEALTH;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-6", className)} role="region" aria-label="Treasury Health Overview">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-white">Treasury Health Overview</h2>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500">Overall Score</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#c9a84c]">{health.overall}</span>
            <span className="rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-2 py-0.5 text-[10px] font-medium text-[#c9a84c] uppercase tracking-wider">
              {health.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {CATEGORIES.map((cat, i) => {
          const score = health[cat.key] as number;
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-4"
              role="article" aria-label={`${cat.label}: ${score} out of 100`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{cat.label}</p>
                <span className={cn("text-[11px] font-medium", statusTextColor(score))}>{statusLabel(score)}</span>
              </div>
              <div className="flex items-center gap-3">
                {scoreRing(score, 60)}
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", cat.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-zinc-600">0</span>
                    <span className="text-[10px] text-zinc-600">100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
