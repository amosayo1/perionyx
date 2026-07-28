"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ExecutiveSummaryData } from "./types";
import { ExecutiveKpiCard } from "./executive-kpi-card";
import { InsightPanel } from "./insight-panel";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Ban } from "lucide-react";

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
  className?: string;
  showKpis?: boolean;
  showInsights?: boolean;
}

export const ExecutiveSummary = memo(function ExecutiveSummary({
  data,
  className,
  showKpis = true,
  showInsights = true,
}: ExecutiveSummaryProps) {
  const { totalPositives, totalNegatives, totalRisks, totalRecommendations } = useMemo(() => ({
    totalPositives: data.positiveInsights.length,
    totalNegatives: data.negativeInsights.length,
    totalRisks: data.risks.length,
    totalRecommendations: data.recommendations.length,
  }), [data]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Executive Summary</h2>
          <p className="mt-0.5 text-xs text-zinc-500">{data.period}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500/70" />
            {totalPositives} positive
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500/70" />
            {totalNegatives} negative
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500/70" />
            {totalRisks} risks
          </span>
          <span className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-gold/70" />
            {totalRecommendations} recommendations
          </span>
        </div>
      </div>

      {showKpis && data.kpis.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.kpis.map((kpi, i) => (
            <ExecutiveKpiCard key={i} {...kpi} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {showInsights && data.positiveInsights.length > 0 && (
          <InsightPanel title="Positive Indicators" items={data.positiveInsights} />
        )}
        {showInsights && data.negativeInsights.length > 0 && (
          <InsightPanel title="Items Requiring Attention" items={data.negativeInsights} />
        )}
        {showInsights && data.risks.length > 0 && (
          <InsightPanel title="Risk Assessment" items={data.risks} />
        )}
        {showInsights && data.recommendations.length > 0 && (
          <InsightPanel title="Recommendations" items={data.recommendations} />
        )}
      </div>
    </div>
  );
});
