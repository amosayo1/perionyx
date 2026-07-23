"use client";

import type { WorkflowStepExecutionData } from "@/modules/orchestration";

interface ExecutionTimelineProps {
  steps: WorkflowStepExecutionData[];
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  const sorted = [...steps].sort((a, b) => a.stepIndex - b.stepIndex);

  return (
    <div className="space-y-0">
      {sorted.map((step) => (
        <div key={`${step.executionId}-${step.stepIndex}`} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              step.status === "completed" ? "bg-green-500/10 text-green-400" :
              step.status === "failed" ? "bg-red-500/10 text-red-400" :
              step.status === "running" ? "bg-blue-500/10 text-blue-400" :
              step.status === "skipped" ? "bg-zinc-500/10 text-zinc-500" :
              "bg-zinc-800 text-zinc-500"
            }`}>
              {step.status === "completed" ? "✓" : step.status === "failed" ? "✗" : step.stepIndex + 1}
            </div>
            {step.stepIndex < sorted.length - 1 && <div className="h-4 w-px bg-zinc-700" />}
          </div>
          <div className="mb-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{step.stepType.replace("_", " ")}</span>
              <span className={`text-xs ${step.status === "completed" ? "text-green-400" : step.status === "failed" ? "text-red-400" : step.status === "running" ? "text-blue-400" : "text-zinc-500"}`}>
                {step.status}
              </span>
            </div>
            {step.module && <p className="text-xs text-zinc-500">{step.module}{step.action ? ` / ${step.action}` : ""}</p>}
            {step.durationMs && <p className="text-[10px] text-zinc-600">{(step.durationMs / 1000).toFixed(1)}s</p>}
            {step.error && <p className="mt-0.5 text-xs text-red-400" role="alert">{step.error}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
