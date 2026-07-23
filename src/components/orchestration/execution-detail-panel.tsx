"use client";

import type { WorkflowExecutionData } from "@/modules/orchestration";
import { ExecutionTimeline } from "./execution-timeline";

interface ExecutionDetailPanelProps {
  execution: WorkflowExecutionData;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function ExecutionDetailPanel({ execution, onRetry, onCancel }: ExecutionDetailPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[10px] text-zinc-500">Status</p>
          <p className={`text-sm font-medium ${
            execution.status === "completed" ? "text-green-400" :
            execution.status === "failed" ? "text-red-400" :
            execution.status === "running" ? "text-blue-400" : "text-zinc-400"
          }`}>{execution.status}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[10px] text-zinc-500">Trigger</p>
          <p className="text-sm font-medium text-white">{execution.trigger}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[10px] text-zinc-500">Duration</p>
          <p className="text-sm font-medium text-white">{execution.durationMs ? `${(execution.durationMs / 1000).toFixed(1)}s` : "N/A"}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-[10px] text-zinc-500">Retries</p>
          <p className="text-sm font-medium text-white">{execution.retryCount} / {execution.maxRetries}</p>
        </div>
      </div>

      {execution.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-900/10 p-3">
          <p className="text-[10px] text-zinc-500">Error</p>
          <p className="mt-0.5 text-xs text-red-400" role="alert">{execution.error}</p>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Steps</h3>
        <ExecutionTimeline steps={execution.steps} />
      </div>

      <div className="flex gap-2">
        {execution.status === "failed" && onRetry && (
          <button onClick={() => onRetry(execution.id)} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-500">Retry</button>
        )}
        {execution.status === "running" && onCancel && (
          <button onClick={() => onCancel(execution.id)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20">Cancel</button>
        )}
      </div>
    </div>
  );
}
