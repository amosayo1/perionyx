"use client";

import type { AccountingKPI, AccountingOverviewMetrics } from "./accounting-types";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface ExecutiveInsightsProps {
  kpis: AccountingKPI[];
  metrics: AccountingOverviewMetrics;
  netIncome: number;
  grossMargin: number;
  workingCapital: number;
  currentRatio: number;
}

export function ExecutiveInsights({ kpis, metrics, netIncome, grossMargin, workingCapital, currentRatio }: ExecutiveInsightsProps) {
  const insights: Array<{ type: "positive" | "negative" | "info"; title: string; description: string }> = [];

  if (netIncome > 0) {
    insights.push({ type: "positive", title: "Profitable Operations", description: `Net income is $${(netIncome / 1e6).toFixed(1)}M, indicating healthy profitability this period.` });
  } else {
    insights.push({ type: "negative", title: "Net Loss", description: `Net loss of $${(Math.abs(netIncome) / 1e6).toFixed(1)}M requires management attention.` });
  }

  if (grossMargin >= 40) {
    insights.push({ type: "positive", title: "Strong Gross Margin", description: `Gross margin at ${grossMargin.toFixed(1)}% exceeds the 40% benchmark.` });
  } else if (grossMargin >= 20) {
    insights.push({ type: "info", title: "Adequate Gross Margin", description: `Gross margin at ${grossMargin.toFixed(1)}% is within acceptable range.` });
  } else {
    insights.push({ type: "negative", title: "Low Gross Margin", description: `Gross margin at ${grossMargin.toFixed(1)}% needs improvement.` });
  }

  if (currentRatio >= 1.5) {
    insights.push({ type: "positive", title: "Healthy Liquidity", description: `Current ratio of ${currentRatio.toFixed(2)} indicates strong short-term financial health.` });
  } else if (currentRatio >= 1) {
    insights.push({ type: "info", title: "Adequate Liquidity", description: `Current ratio of ${currentRatio.toFixed(2)} meets minimum requirements.` });
  } else {
    insights.push({ type: "negative", title: "Liquidity Risk", description: `Current ratio of ${currentRatio.toFixed(2)} is below 1.0 — immediate attention needed.` });
  }

  if (workingCapital < 0) {
    insights.push({ type: "negative", title: "Working Capital Deficit", description: `Negative working capital of $${(Math.abs(workingCapital) / 1e6).toFixed(1)}M indicates potential liquidity constraints.` });
  }

  if (metrics.exceptions > 0) {
    insights.push({ type: "negative", title: "Reconciliation Exceptions", description: `${metrics.exceptions} reconciliation exceptions require resolution before period close.` });
  }

  if (metrics.unsettledIC > 0) {
    insights.push({ type: "info", title: "Unsettled Intercompany", description: `${metrics.unsettledIC} intercompany journals remain unsettled.` });
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-medium text-gray-200">Executive Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-800 p-3">
            <div className="mt-0.5">
              {insight.type === "positive" ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : insight.type === "negative" ? <AlertTriangle className="h-4 w-4 text-red-400" /> : <Lightbulb className="h-4 w-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{insight.title}</p>
              <p className="text-xs text-gray-400">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
