"use client";

import type { AutomationRuleData } from "@/modules/orchestration";

interface AutomationRuleListProps {
  rules: AutomationRuleData[];
  onEdit?: (rule: AutomationRuleData) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, isActive: boolean) => void;
}

export function AutomationRuleList({ rules, onEdit, onDelete, onToggle }: AutomationRuleListProps) {
  if (rules.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No automation rules configured.</p>;
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${rule.isActive ? "bg-green-400" : "bg-zinc-600"}`} />
              <span className="text-sm font-medium text-white">{rule.name}</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{rule.eventType}</span>
              <span className="text-[10px] text-zinc-500">p{rule.priority}</span>
            </div>
            {rule.description && <p className="mt-0.5 text-xs text-zinc-500">{rule.description}</p>}
            <div className="mt-1 flex gap-1">
              {(rule.actions as Array<{ type: string; target?: string }>).map((a, i) => (
                <span key={i} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                  {a.type}{a.target ? ` → ${a.target}` : ""}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onToggle && (
              <button
                onClick={() => onToggle(rule.id, !rule.isActive)}
                className={`rounded px-2 py-1 text-xs ${rule.isActive ? "text-green-400 hover:text-green-300" : "text-zinc-500 hover:text-zinc-400"}`}
              >
                {rule.isActive ? "Active" : "Inactive"}
              </button>
            )}
            {onEdit && <button onClick={() => onEdit(rule)} className="text-xs text-zinc-500 hover:text-white">Edit</button>}
            {onDelete && <button onClick={() => onDelete(rule.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
