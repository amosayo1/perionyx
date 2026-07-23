"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_REGION_SUMMARIES } from "./data";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function ForecastIcon({ health }: { health: "positive" | "stable" | "negative" }) {
  switch (health) {
    case "positive": return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
    case "negative": return <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />;
    default: return <Minus className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />;
  }
}

function healthColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function healthBg(score: number): string {
  if (score >= 85) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 70) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function RegionalOverview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Regional overview">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Regional Overview</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {MOCK_REGION_SUMMARIES.map((region, i) => (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className={cn("rounded-lg border p-4", healthBg(region.healthScore))}
            role="article" aria-label={`Region: ${region.name}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-semibold text-white">{region.name}</h3>
              <ForecastIcon health={region.forecastHealth} />
            </div>
            <p className={cn("text-lg font-bold", healthColor(region.healthScore))}>{region.healthScore}</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Total Cash</span>
                <span className="text-[11px] font-medium text-white">{formatCompact(region.totalCash)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Available</span>
                <span className="text-[11px] font-medium text-white">{formatCompact(region.availableLiquidity)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Entities</span>
                <span className="text-[11px] font-medium text-white">{region.entityCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Currencies</span>
                <span className="text-[11px] font-medium text-white">{region.currencyCount}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
