"use client";

import type { WorkflowStep } from "@/modules/orchestration";

interface WorkflowStepCardProps {
  step: WorkflowStep;
  isSelected?: boolean;
  onClick?: () => void;
}

export function WorkflowStepCard({ step, isSelected, onClick }: WorkflowStepCardProps) {
  return (
    <div
      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
        isSelected ? "border-amber-400/30 bg-zinc-800" : "border-white/[0.06] bg-zinc-900/40 hover:border-zinc-700"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{step.label}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
          step.type === "module_action" ? "bg-blue-500/10 text-blue-400" :
          step.type === "condition" ? "bg-amber-500/10 text-amber-400" :
          step.type === "notification" ? "bg-purple-500/10 text-purple-400" :
          "bg-zinc-500/10 text-zinc-400"
        }`}>
          {step.type.replace("_", " ")}
        </span>
      </div>
      <div className="mt-1 text-xs text-zinc-500">
        {step.module && <span>{step.module}{step.action ? ` / ${step.action}` : ""}</span>}
      </div>
    </div>
  );
}
