"use client";

import { useState } from "react";
import type { WorkflowStep } from "@/modules/orchestration";

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({ steps, selectedIndex, onSelect, readOnly }: WorkflowCanvasProps) {
  return (
    <div className="relative overflow-auto rounded-xl border border-white/[0.06] bg-zinc-900/60 p-6">
      {steps.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">No steps defined. Add steps to build your workflow.</p>
      ) : (
        <div className="space-y-0">
          {steps.sort((a, b) => a.index - b.index).map((step) => (
            <div key={step.index} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                    selectedIndex === step.index
                      ? "border-amber-400 bg-amber-400/10 text-amber-400"
                      : "border-white/[0.06] bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                  onClick={() => onSelect?.(step.index)}
                >
                  {step.index + 1}
                </div>
                {step.index < steps.length - 1 && <div className="h-6 w-px bg-zinc-700" />}
              </div>
              <div
                className={`mb-4 flex-1 cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedIndex === step.index
                    ? "border-amber-400/30 bg-zinc-800"
                    : "border-white/[0.06] bg-zinc-900/40 hover:border-zinc-700"
                }`}
                onClick={() => onSelect?.(step.index)}
              >
                <div className="flex items-center gap-2">
                  <StepBadge type={step.type} />
                  <span className="text-sm font-medium text-white">{step.label}</span>
                </div>
                <div className="mt-1 flex gap-2 text-xs text-zinc-500">
                  {step.module && <span>{step.module}</span>}
                  {step.action && <span>/ {step.action}</span>}
                  {step.timeoutMs && <span>timeout: {(step.timeoutMs / 1000).toFixed(0)}s</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    module_action: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    condition: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    notification: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delay: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    sub_workflow: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${colors[type] ?? "bg-zinc-500/10 text-zinc-400"}`}>
      {type.replace("_", " ")}
    </span>
  );
}
