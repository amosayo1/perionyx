"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_REGION_SUMMARIES as MOCK_REGIONS } from "./data";
import type { RegionSummary } from "./types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  return `$${(amount / 1_000_000).toFixed(0)}M`;
}

function healthColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 text-emerald-400";
  if (score >= 60) return "bg-amber-500/10 text-amber-400";
  return "bg-red-500/10 text-red-400";
}

function healthBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function forecastBadge(health: RegionSummary["forecastHealth"]) {
  const map = {
    positive: { label: "Positive", classes: "bg-emerald-500/10 text-emerald-400" },
    stable: { label: "Stable", classes: "bg-blue-500/10 text-blue-400" },
    negative: { label: "Negative", classes: "bg-red-500/10 text-red-400" },
  };
  const m = map[health];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", m.classes)}>
      {m.label}
    </span>
  );
}

function ForecastIcon({ health }: { health: RegionSummary["forecastHealth"] }) {
  if (health === "positive") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
  if (health === "negative") return <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />;
  return <Minus className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />;
}

export function TreasurySummaryCards({ className }: { className?: string }) {
  const totalCash = MOCK_REGIONS.reduce((s, r) => s + r.totalCash, 0);
  const avgHealth = Math.round(MOCK_REGIONS.reduce((s, r) => s + r.healthScore, 0) / MOCK_REGIONS.length);
  const bestRegion = [...MOCK_REGIONS].sort((a, b) => b.healthScore - a.healthScore)[0];

  return (
    <section aria-label="Regional treasury overview" className={cn("", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Regional Overview</h2>
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <span>Total: <span className="font-semibold text-white">{formatCurrency(totalCash)}</span></span>
          <span>Avg Health: <span className={cn("font-semibold", avgHealth >= 80 ? "text-emerald-400" : avgHealth >= 60 ? "text-amber-400" : "text-red-400")}>{avgHealth}</span></span>
          <span>Best: <span className="font-semibold text-white">{bestRegion.name}</span></span>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MOCK_REGIONS.map((region) => (
          <RegionCard key={region.name} region={region} />
        ))}
      </motion.div>
    </section>
  );
}

function RegionCard({ region }: { region: RegionSummary }) {
  const availPct = region.totalCash > 0 ? (region.availableLiquidity / region.totalCash) * 100 : 0;

  return (
    <motion.div
      variants={item}
      role="article"
      aria-label={`${region.name} region`}
      className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <h3 className="text-sm font-medium text-white">{region.name}</h3>
        </div>
        {forecastBadge(region.forecastHealth)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <span className="text-zinc-500">Total Cash</span>
          <p className="font-semibold text-white">{formatCurrency(region.totalCash)}</p>
        </div>
        <div>
          <span className="text-zinc-500">Available Liquidity</span>
          <p className="font-semibold text-emerald-400">{formatCurrency(region.availableLiquidity)}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Health Score</span>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", healthColor(region.healthScore))}>
              {region.healthScore}
            </span>
            <div className="flex items-center gap-1">
              <ForecastIcon health={region.forecastHealth} />
            </div>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800">
          <div
            className={cn("h-full rounded-full transition-all", healthBarColor(region.healthScore))}
            style={{ width: `${region.healthScore}%` }}
            role="progressbar"
            aria-valuenow={region.healthScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${region.name} health score ${region.healthScore}`}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{region.entityCount} {region.entityCount === 1 ? "entity" : "entities"} &middot; {region.currencyCount} {region.currencyCount === 1 ? "currency" : "currencies"}</span>
        <span className="text-zinc-400 truncate max-w-[140px]" title={region.topEntity}>
          {region.topEntity}
        </span>
      </div>
    </motion.div>
  );
}
