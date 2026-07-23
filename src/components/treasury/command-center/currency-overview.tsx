"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_CURRENCY_SUMMARIES } from "./data";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up": return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
    case "down": return <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />;
    default: return <Minus className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />;
  }
}

function riskColor(score: number): string {
  if (score <= 30) return "text-emerald-400";
  if (score <= 60) return "text-amber-400";
  return "text-red-400";
}

function riskBg(score: number): string {
  if (score <= 30) return "bg-emerald-500/10 border-emerald-500/20";
  if (score <= 60) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function CurrencyOverview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Currency overview">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Currency Overview</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
        {MOCK_CURRENCY_SUMMARIES.map((ccy, i) => (
          <motion.div
            key={ccy.code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className={cn("rounded-lg border p-4", riskBg(ccy.riskScore))}
            role="article" aria-label={`Currency: ${ccy.code}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">{ccy.code}</h3>
              <TrendIcon trend={ccy.trend} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Balance</span>
                <span className="text-[11px] font-medium text-white">{formatCompact(ccy.totalCash)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Exposure</span>
                <span className="text-[11px] font-medium text-white">{formatCompact(ccy.exposure)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Risk</span>
                <span className={cn("text-[11px] font-medium", riskColor(ccy.riskScore))}>{ccy.riskScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Hedged</span>
                <span className="text-[11px] font-medium text-white">{ccy.hedgePercent}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
