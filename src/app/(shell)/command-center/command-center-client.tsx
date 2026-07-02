"use client";

import { useState, useEffect, useCallback } from "react";
import { ExecutiveSummarySection } from "@/components/command-center/executive-summary";
import { DecisionCenterWidget } from "@/components/command-center/decision-center";
import { TreasuryCenterWidget } from "@/components/command-center/treasury-center";
import { ForecastCenterWidget } from "@/components/command-center/forecast-center";
import { IntelligenceCenterWidget } from "@/components/command-center/intelligence-center";
import { RiskCenterWidget } from "@/components/command-center/risk-center";
import { OperationsCenterWidget } from "@/components/command-center/operations-center";
import { GovernanceCenterWidget } from "@/components/command-center/governance-center";
import { AiCenterWidget } from "@/components/command-center/ai-center";
import { EnterpriseTimelineWidget } from "@/components/command-center/enterprise-timeline";
import { BriefingPanel } from "@/components/command-center/briefing-panel";
import { WidgetCard } from "@/components/command-center/widget-card";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, LayoutGrid } from "lucide-react";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

type WidgetId =
  | "decision-center"
  | "treasury-center"
  | "forecast-center"
  | "intelligence-center"
  | "risk-center"
  | "operations-center"
  | "governance-center"
  | "ai-center"
  | "enterprise-timeline"
  | "briefing-panel";

const DEFAULT_ORDER: WidgetId[] = [
  "decision-center", "treasury-center", "forecast-center",
  "intelligence-center", "risk-center", "operations-center",
  "governance-center", "ai-center", "enterprise-timeline", "briefing-panel",
];

const STORAGE_KEY_ORDER = "cc-widget-order";
const STORAGE_KEY_HIDDEN = "cc-widget-hidden";

export function CommandCenterClient({ data }: { data: CommandCenterData }) {
  const [order, setOrder] = useState<WidgetId[]>(DEFAULT_ORDER);
  const [hidden, setHidden] = useState<Set<WidgetId>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDER);
      if (saved) setOrder(JSON.parse(saved));
      const savedHidden = localStorage.getItem(STORAGE_KEY_HIDDEN);
      if (savedHidden) setHidden(new Set(JSON.parse(savedHidden)));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const persistOrder = useCallback((newOrder: WidgetId[]) => {
    setOrder(newOrder);
    try { localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(newOrder)); } catch { /* ignore */ }
  }, []);

  const toggleHide = useCallback((id: WidgetId) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setOrder(DEFAULT_ORDER);
    setHidden(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY_ORDER);
      localStorage.removeItem(STORAGE_KEY_HIDDEN);
    } catch { /* ignore */ }
  }, []);

  if (!loaded) return <CommandCenterSkeleton />;

  const visibleWidgets = order.filter((id) => !hidden.has(id));

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Command Center</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetLayout} className="text-zinc-400 hover:text-white">
              <RotateCcw size={14} className="mr-1" /> Reset
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <LayoutGrid size={14} className="mr-1" /> {visibleWidgets.length} widgets
            </Button>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          Unified enterprise overview. {data.decisionBriefing?.totalDecisions ?? 0} decisions, {data.risk.criticalAlerts} critical risks, {data.operations.connectorCount} connectors.
        </p>
      </div>

      <ExecutiveSummarySection metrics={data.executiveSummary} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleWidgets.map((id) => (
          <WidgetWrapper key={id} id={id} data={data} onHide={() => toggleHide(id)} />
        ))}
      </div>
    </div>
  );
}

function WidgetWrapper({ id, data, onHide }: { id: WidgetId; data: CommandCenterData; onHide: () => void }) {
  switch (id) {
    case "decision-center":
      return <div className="relative"><DecisionCenterWidget decisions={data.decisions} criticalCount={data.criticalDecisions} /></div>;
    case "treasury-center":
      return <div className="relative"><TreasuryCenterWidget data={data.treasury} /></div>;
    case "forecast-center":
      return <div className="relative"><ForecastCenterWidget data={data.forecasts} /></div>;
    case "intelligence-center":
      return <div className="relative"><IntelligenceCenterWidget insights={data.intelligence.insights} recommendations={data.intelligence.recommendations} /></div>;
    case "risk-center":
      return <div className="relative"><RiskCenterWidget data={data.risk} /></div>;
    case "operations-center":
      return <div className="relative"><OperationsCenterWidget data={data.operations} /></div>;
    case "governance-center":
      return <div className="relative"><GovernanceCenterWidget data={data.governance} /></div>;
    case "ai-center":
      return <div className="relative"><AiCenterWidget data={data.ai} /></div>;
    case "enterprise-timeline":
      return <div className="relative"><EnterpriseTimelineWidget events={data.timeline} /></div>;
    case "briefing-panel":
      return <div className="relative"><BriefingPanel briefing={data.briefing} decisionBriefing={data.decisionBriefing} /></div>;
    default:
      return null;
  }
}

function CommandCenterSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="mb-6 space-y-3">
        <div className="h-8 w-64 rounded bg-zinc-800" />
        <div className="h-4 w-96 rounded bg-zinc-800/50" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-900 border border-white/[0.06]" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-zinc-900 border border-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
