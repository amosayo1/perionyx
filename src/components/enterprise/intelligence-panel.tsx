"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { InsightPanel } from "@/components/enterprise/analytics/insight-panel";
import { ExecutiveKpiCard } from "@/components/enterprise/analytics/executive-kpi-card";
import { AnimatedMetric } from "@/components/enterprise/motion/animated-metric";
import type { InsightItem, KpiData } from "@/components/enterprise/analytics/types";
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface IntelligencePanelProps {
  className?: string;
}

type HealthData = {
  score: number;
  previousScore: number;
  trend: "improving" | "stable" | "declining";
  category: string;
  metrics: { label: string; value: number; target: number; status: string; trend: string }[];
};

type InsightData = {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  source: string;
};

type RecommendationData = {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
};

function severityToInsightType(severity: string): InsightItem["type"] {
  if (severity === "critical" || severity === "high") return "risk";
  if (severity === "medium") return "negative";
  return "info";
}

function insightToItem(insight: InsightData): InsightItem {
  return {
    type: severityToInsightType(insight.severity),
    title: insight.title,
    description: insight.description,
    actionLabel: "View details",
  };
}

export function IntelligencePanel({ className }: IntelligencePanelProps) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [insightsRes, recommendationsRes, healthRes] = await Promise.all([
        fetch("/api/intelligence/insights?minPriority=medium"),
        fetch("/api/intelligence/recommendations"),
        fetch("/api/intelligence/health?overall=true"),
      ]);

      if (!insightsRes.ok || !recommendationsRes.ok || !healthRes.ok) {
        throw new Error("Failed to fetch intelligence data");
      }

      const insightsData = await insightsRes.json();
      const recommendationsData = await recommendationsRes.json();
      const healthData = await healthRes.json();

      setInsights(insightsData.insights ?? []);
      setRecommendations(recommendationsData.recommendations ?? []);
      setHealth(healthData ?? null);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load intelligence data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const topInsights = insights.slice(0, 5);
  const topRecommendations = recommendations.slice(0, 3);

  const kpiItems: KpiData[] = health
    ? [
        {
          label: "Business Health",
          value: `${Math.round(health.score * 100)}%`,
          status: health.score >= 0.7 ? "healthy" : health.score >= 0.4 ? "warning" : "critical",
          trend: {
            value: Math.abs(health.score - health.previousScore) * 100,
            direction: health.trend === "improving" ? "up" : health.trend === "declining" ? "down" : "neutral",
          },
          lastUpdated: lastUpdated ?? undefined,
          gold: true,
        },
        {
          label: "Active Insights",
          value: insights.length,
          status: insights.length > 5 ? "warning" : "healthy",
          lastUpdated: lastUpdated ?? undefined,
        },
        {
          label: "Recommendations",
          value: recommendations.length,
          status: recommendations.length > 3 ? "info" : "healthy",
          lastUpdated: lastUpdated ?? undefined,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Executive Intelligence</h3>
          <RefreshCw className="h-4 w-4 text-zinc-600 animate-spin" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-xl border border-amber-500/10 bg-amber-500/5 p-6", className)}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-zinc-200">Intelligence Unavailable</p>
            <p className="text-xs text-zinc-500 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Executive Intelligence</h3>
        <button
          onClick={fetchData}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Refresh intelligence data"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {kpiItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {kpiItems.map((kpi, i) => (
            <ExecutiveKpiCard key={i} {...kpi} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {topInsights.length > 0 && (
          <InsightPanel
            title="Critical Insights"
            items={topInsights.map(insightToItem)}
            maxItems={5}
          />
        )}
        {topRecommendations.length > 0 && (
          <InsightPanel
            title="Recommended Actions"
            items={topRecommendations.map((r) => ({
              type: r.priority === "high" ? "risk" : "info",
              title: r.title,
              description: r.description,
              actionLabel: "Take action",
            }))}
            maxItems={3}
          />
        )}
      </div>
    </div>
  );
}
