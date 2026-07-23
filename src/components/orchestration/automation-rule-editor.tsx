"use client";

import { useState } from "react";
import type { AutomationAction } from "@/modules/orchestration";

interface AutomationRuleEditorProps {
  initial?: { name: string; description?: string; eventType: string; condition?: Record<string, unknown>; actions: AutomationAction[]; priority: number; cooldownSec?: number };
  onSave: (data: { name: string; description?: string; eventType: string; condition?: Record<string, unknown>; actions: AutomationAction[]; priority: number; cooldownSec?: number }) => void;
  onCancel?: () => void;
}

const EVENT_TYPES = [
  "workflow.completed", "workflow.failed", "workflow.started",
  "treasury.cash_updated", "treasury.fx_rate_changed", "treasury.liquidity_alert",
  "intelligence.score_updated", "intelligence.health_alert",
  "approval.requested", "approval.approved", "approval.rejected",
  "integration.sync_completed", "integration.sync_failed",
];

export function AutomationRuleEditor({ initial, onSave, onCancel }: AutomationRuleEditorProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [eventType, setEventType] = useState(initial?.eventType ?? EVENT_TYPES[0]);
  const [priority, setPriority] = useState(initial?.priority ?? 0);
  const [actions, setActions] = useState<AutomationAction[]>(initial?.actions ?? []);

  const addAction = () => {
    setActions([...actions, { type: "start_workflow", target: "", params: {} }]);
  };

  const updateAction = (index: number, data: Partial<AutomationAction>) => {
    setActions(actions.map((a, i) => i === index ? { ...a, ...data } : a));
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-zinc-400">Rule Name</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Alert on failed close"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Description</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Event Type</label>
        <select
          className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          {EVENT_TYPES.map((et) => <option key={et} value={et}>{et}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Priority</label>
        <input
          type="number"
          className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400">Actions</label>
          <button onClick={addAction} className="text-xs text-amber-400 hover:text-amber-300">+ Add Action</button>
        </div>
        <div className="mt-2 space-y-2">
          {actions.map((action, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-2">
              <select
                className="flex-1 rounded bg-zinc-800 px-2 py-1 text-xs text-white"
                value={action.type}
                onChange={(e) => updateAction(i, { type: e.target.value as AutomationAction["type"] })}
              >
                <option value="start_workflow">Start Workflow</option>
                <option value="send_notification">Send Notification</option>
                <option value="update_status">Update Status</option>
                <option value="log_audit">Log Audit</option>
              </select>
              <input
                className="flex-1 rounded bg-zinc-800 px-2 py-1 text-xs text-white placeholder-zinc-600"
                value={action.target ?? ""}
                onChange={(e) => updateAction(i, { target: e.target.value })}
                placeholder="Target (optional)"
              />
              <button onClick={() => removeAction(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave({ name, description: description || undefined, eventType, priority, actions })}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500"
        >
          Save Rule
        </button>
        {onCancel && (
          <button onClick={onCancel} className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm text-zinc-400 hover:text-white">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
