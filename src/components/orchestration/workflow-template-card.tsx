"use client";

import { Clock, Layers, Cpu } from "lucide-react";
import type { WorkflowTemplateData } from "@/modules/orchestration";

interface WorkflowTemplateCardProps {
  template: WorkflowTemplateData;
  onInstantiate?: (template: WorkflowTemplateData) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  "month-end": "📊", treasury: "💰", reporting: "📋", reconciliation: "🔄",
  budget: "📐", board: "🏛️", audit: "🔍",
};

export function WorkflowTemplateCard({ template, onInstantiate }: WorkflowTemplateCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30">
      <div className="flex items-center justify-between">
        <span className="text-lg">{CATEGORY_ICONS[template.category] ?? "⚙️"}</span>
        {template.isBuiltIn && <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-400">Built-in</span>}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-white">{template.name}</h3>
      <p className="mt-1 text-xs text-zinc-500">{template.description}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{template.estimatedDuration ?? "N/A"}</span>
        <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{template.steps.length} steps</span>
        {template.requiredModules && (
          <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{template.requiredModules.length} modules</span>
        )}
      </div>

      {template.requiredModules && template.requiredModules.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {template.requiredModules.map((mod) => (
            <span key={mod} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{mod}</span>
          ))}
        </div>
      )}

      {onInstantiate && (
        <button
          onClick={() => onInstantiate(template)}
          className="mt-3 w-full rounded-lg bg-amber-400 py-1.5 text-xs font-medium text-black hover:bg-amber-500"
        >
          Use Template
        </button>
      )}
    </div>
  );
}
