"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, CheckCircle, XCircle, AlertTriangle, Clock, Loader2, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

type ScenarioInfo = {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: string;
  modules: string[];
};

type TimelineEvent = {
  step: number;
  timestamp: string;
  label: string;
  description: string;
  module: string;
  status: "success" | "warning" | "error" | "info";
  data?: Record<string, unknown>;
};

type ScenarioResult = {
  scenarioId: string;
  scenarioTitle: string;
  status: "completed" | "failed" | "blocked" | "pending_approval";
  timeline: TimelineEvent[];
  message: string;
};

type RunningState = {
  scenarioId: string;
  status: "loading" | "running";
} | null;

export function ScenarioPanel() {
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [running, setRunning] = useState<RunningState>(null);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [expandedTimeline, setExpandedTimeline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/sandbox/scenario")
      .then((r) => r.json())
      .then((data) => {
        setScenarios(data.scenarios ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const runScenario = useCallback(async (scenarioId: string) => {
    setRunning({ scenarioId, status: "running" });
    setResult(null);
    try {
      const res = await fetch("/api/v1/sandbox/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        setExpandedTimeline(true);
        const r = data.result as ScenarioResult;
        if (r.status === "completed") {
          toast.success(r.scenarioTitle, { description: "Workflow completed successfully" });
        } else if (r.status === "blocked") {
          toast.warning(r.scenarioTitle, { description: "Transaction blocked by policy" });
        } else {
          toast.error(r.scenarioTitle, { description: r.message.slice(0, 80) });
        }
      }
    } catch {
      toast.error("Failed to run scenario");
    } finally {
      setRunning(null);
    }
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case "blocked": return <XCircle className="h-3.5 w-3.5 text-red-400" />;
      case "failed": return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case "pending_approval": return <Clock className="h-3.5 w-3.5 text-yellow-400" />;
      default: return null;
    }
  };

  const timelineIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />;
      case "warning": return <AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0 mt-0.5" />;
      case "error": return <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />;
      default: return <Clock className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const categories = [...new Set(scenarios.map((s) => s.category))];

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#d4af37]/70">Sample Scenarios</p>

      {loading && (
        <div className="flex items-center gap-2 py-4 text-zinc-500 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading scenarios...
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat} className="space-y-1">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-1">{cat}</p>
          {scenarios
            .filter((s) => s.category === cat)
            .map((scenario) => {
              const isRunning = running?.scenarioId === scenario.id;
              const isDone = result?.scenarioId === scenario.id;

              return (
                <div key={scenario.id}>
                  <button
                    onClick={() => !isRunning && runScenario(scenario.id)}
                    disabled={isRunning}
                    className="group flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-50"
                  >
                    {isRunning ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 mt-0.5 animate-spin text-[#d4af37]" />
                    ) : isDone ? (
                      statusIcon(result!.status)
                    ) : (
                      <Play className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-500 group-hover:text-[#d4af37]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-300 group-hover:text-white truncate">{scenario.title}</p>
                      <p className="text-[10px] text-zinc-600 line-clamp-1">{scenario.description.slice(0, 60)}...</p>
                      {isDone && (
                        <p className="text-[10px] mt-1 leading-relaxed text-zinc-500">{result!.message.slice(0, 100)}{result!.message.length > 100 ? "..." : ""}</p>
                      )}
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
                  </button>

                  {isDone && result && expandedTimeline && (
                    <div className="ml-7 pl-2 border-l border-white/[0.06] space-y-1.5 py-1.5 mb-1">
                      {result.timeline.map((event, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {timelineIcon(event.status)}
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-zinc-400 leading-relaxed">{event.label}</p>
                            <p className="text-[9px] text-zinc-600">{event.module}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ))}

      {result && (
        <button
          onClick={() => setExpandedTimeline(!expandedTimeline)}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors px-1"
        >
          {expandedTimeline ? "Hide timeline" : "Show timeline"}
        </button>
      )}
    </div>
  );
}
