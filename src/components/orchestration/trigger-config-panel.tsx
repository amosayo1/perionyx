"use client";

import { useState } from "react";

interface TriggerConfigPanelProps {
  workflowId: string;
  onSave: (data: { eventType: string; condition?: Record<string, unknown> }) => void;
  onCancel?: () => void;
}

const EVENT_OPTIONS = [
  "workflow.completed", "workflow.failed",
  "treasury.cash_updated", "treasury.fx_rate_changed",
  "intelligence.score_updated", "intelligence.health_alert",
  "approval.requested", "approval.approved",
  "integration.sync_completed",
];

export function TriggerConfigPanel({ onSave, onCancel }: TriggerConfigPanelProps) {
  const [eventType, setEventType] = useState(EVENT_OPTIONS[0]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-zinc-400">Event Type</label>
        <select
          className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          {EVENT_OPTIONS.map((et) => <option key={et} value={et}>{et}</option>)}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave({ eventType })}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500"
        >
          Save Trigger
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
