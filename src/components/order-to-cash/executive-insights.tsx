"use client";

import type { O2CKPI } from "./o2c-types";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Clock, Users, Shield, BarChart3 } from "lucide-react";

interface ExecutiveInsightsProps {
  kpis: O2CKPI[];
  dso: number;
  overdueAR: number;
  cashCollected: number;
  totalAR: number;
  totalCustomers: number;
  openOrders: number;
}

export function ExecutiveInsights({ kpis, dso, overdueAR, cashCollected, totalAR, totalCustomers, openOrders }: ExecutiveInsightsProps) {
  const insights: Array<{ type: "positive" | "negative" | "info"; icon: React.ReactNode; title: string; description: string }> = [];

  const revenueGrowth = kpis.find((k) => k.name.toLowerCase().includes("revenue"));
  if (revenueGrowth) {
    if (revenueGrowth.trend === "up") {
      insights.push({ type: "positive", icon: <TrendingUp className="h-4 w-4 text-emerald-400" />, title: "Revenue Growth", description: `Revenue is trending upward at $${(revenueGrowth.value / 1e6).toFixed(1)}M this period.` });
    } else {
      insights.push({ type: "negative", icon: <TrendingDown className="h-4 w-4 text-red-400" />, title: "Revenue Decline", description: `Revenue decreased to $${(revenueGrowth.value / 1e6).toFixed(1)}M — review pipeline and forecasts.` });
    }
  }

  if (dso <= 45) {
    insights.push({ type: "positive", icon: <Clock className="h-4 w-4 text-emerald-400" />, title: "Healthy DSO", description: `DSO at ${dso.toFixed(1)} days is within the optimal range (≤45 days).` });
  } else if (dso <= 60) {
    insights.push({ type: "info", icon: <Clock className="h-4 w-4 text-amber-400" />, title: "Elevated DSO", description: `DSO at ${dso.toFixed(1)} days — review collection processes and credit terms.` });
  } else {
    insights.push({ type: "negative", icon: <Clock className="h-4 w-4 text-red-400" />, title: "DSO Risk", description: `DSO at ${dso.toFixed(1)} days exceeds 60-day threshold. Immediate collection action required.` });
  }

  const collectionRatio = totalAR > 0 ? (cashCollected / totalAR) * 100 : 0;
  if (collectionRatio >= 80) {
    insights.push({ type: "positive", icon: <DollarSign className="h-4 w-4 text-emerald-400" />, title: "Strong Collection Rate", description: `${collectionRatio.toFixed(0)}% collection rate indicates effective receivables management.` });
  } else if (collectionRatio >= 60) {
    insights.push({ type: "info", icon: <DollarSign className="h-4 w-4 text-amber-400" />, title: "Moderate Collection Rate", description: `${collectionRatio.toFixed(0)}% collection rate — consider automated reminders and escalation.` });
  } else {
    insights.push({ type: "negative", icon: <DollarSign className="h-4 w-4 text-red-400" />, title: "Low Collection Rate", description: `${collectionRatio.toFixed(0)}% collection rate requires process improvement and prioritization.` });
  }

  if (overdueAR > 0) {
    const overdueRatio = totalAR > 0 ? (overdueAR / totalAR) * 100 : 0;
    if (overdueRatio > 20) {
      insights.push({ type: "negative", icon: <AlertTriangle className="h-4 w-4 text-red-400" />, title: "High Overdue AR", description: `${overdueRatio.toFixed(0)}% of AR is overdue ($${(overdueAR / 1e6).toFixed(1)}M). Escalate high-risk accounts.` });
    } else {
      insights.push({ type: "negative", icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, title: "Overdue AR Present", description: `${overdueRatio.toFixed(0)}% of AR is overdue — monitor aging buckets closely.` });
    }
  }

  const kpiRisk = kpis.find((k) => k.name.toLowerCase().includes("credit") || k.name.toLowerCase().includes("risk"));
  if (kpiRisk && kpiRisk.value < 50) {
    insights.push({ type: "negative", icon: <Shield className="h-4 w-4 text-red-400" />, title: "Credit Risk Alert", description: `Credit risk score is ${kpiRisk.value.toFixed(0)} — review exposure limits for high-risk customers.` });
  }

  if (openOrders > 100) {
    insights.push({ type: "info", icon: <BarChart3 className="h-4 w-4 text-amber-400" />, title: "High Order Backlog", description: `${openOrders} open orders may impact fulfillment timelines and cash conversion.` });
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
            <div className="mt-0.5">{insight.icon}</div>
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
