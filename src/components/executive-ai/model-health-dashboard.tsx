"use client";

import { memo } from "react";
import { Layers, CheckCircle, XCircle, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIModelMetrics } from "./ai-types";

interface ModelHealthDashboardProps {
  models: AIModelMetrics[];
  className?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "anomaly-detection": <Activity className="h-3.5 w-3.5" />,
  forecasting: <Clock className="h-3.5 w-3.5" />,
  classification: <Layers className="h-3.5 w-3.5" />,
  recommendation: <CheckCircle className="h-3.5 w-3.5" />,
  nlp: <Activity className="h-3.5 w-3.5" />,
  reasoning: <Layers className="h-3.5 w-3.5" />,
};

export const ModelHealthDashboard = memo(function ModelHealthDashboard({ models, className }: ModelHealthDashboardProps) {
  if (models.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <div className="text-center">
          <Layers className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No models registered</p>
        </div>
      </div>
    );
  }

  const activeCount = models.filter(m => m.status === "active").length;
  const avgAccuracy = models.filter(m => m.accuracy !== undefined).reduce((s, m) => s + (m.accuracy || 0), 0);
  const avgAccVal = models.length > 0 ? avgAccuracy / models.length : 0;
  const avgLatency = models.reduce((s, m) => s + m.latency, 0) / models.length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Total Models</p>
          <p className="text-xl font-bold text-white">{models.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Active</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-emerald-400">{activeCount}</p>
            <span className="text-xs text-zinc-500">/ {models.length}</span>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Avg Accuracy</p>
          <p className={cn("text-xl font-bold", avgAccVal >= 85 ? "text-emerald-400" : avgAccVal >= 70 ? "text-amber-400" : "text-red-400")}>
            {avgAccVal.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Avg Latency</p>
          <p className="text-xl font-bold text-blue-400">{avgLatency.toFixed(0)}ms</p>
        </div>
      </div>

      <div className="space-y-2">
        {models.map(model => (
          <div
            key={model.name}
            className={cn(
              "rounded-lg border transition-colors",
              model.status === "active" ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-zinc-800/40 bg-zinc-900/30",
              "hover:border-zinc-700/60"
            )}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border",
                model.status === "active" ? "border-emerald-500/20 bg-emerald-500/10" : "border-zinc-700/40 bg-zinc-800/60"
              )}>
                <div className={model.status === "active" ? "text-emerald-400" : "text-zinc-500"}>
                  {TYPE_ICONS[model.modelType] || <Layers className="h-3.5 w-3.5" />}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{model.name}</p>
                  <span className="text-[11px] text-zinc-500">v{model.version}</span>
                  <span className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                    model.status === "active" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-zinc-500 border-zinc-700/40 bg-zinc-800/60"
                  )}>
                    {model.status}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                  <span>{model.modelType.replace(/-/g, " ")}</span>
                  {model.accuracy !== undefined && <span>Accuracy: {model.accuracy}%</span>}
                  {model.precision !== undefined && <span>Precision: {model.precision}%</span>}
                  {model.recall !== undefined && <span>Recall: {model.recall}%</span>}
                  {model.f1Score !== undefined && <span>F1: {model.f1Score}%</span>}
                  <span>Latency: {model.latency}ms</span>
                  <span>Data: {model.trainingDataSize.toLocaleString()} samples</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-600">Last trained</p>
                <p className="text-[11px] text-zinc-400">
                  {new Date(model.lastTrained).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
