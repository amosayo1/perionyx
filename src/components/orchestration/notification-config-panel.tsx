"use client";

import { useState } from "react";

interface NotificationConfigPanelProps {
  workflowId: string;
  onSave: (data: { workflowId: string; triggerOn: string; roleTarget?: string; channel?: string; template?: string }) => void;
  onCancel?: () => void;
}

const TRIGGER_OPTIONS = ["complete", "failure", "approval_required", "threshold"];
const CHANNEL_OPTIONS = ["in-app", "email", "slack", "all"];
const ROLE_OPTIONS = ["cfo", "controller", "treasurer", "finance-manager", "ap", "ar", "auditor"];

export function NotificationConfigPanel({ workflowId, onSave, onCancel }: NotificationConfigPanelProps) {
  const [triggerOn, setTriggerOn] = useState("complete");
  const [channel, setChannel] = useState("in-app");
  const [roleTarget, setRoleTarget] = useState("");
  const [template, setTemplate] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-zinc-400">Trigger On</label>
        <select className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white" value={triggerOn} onChange={(e) => setTriggerOn(e.target.value)}>
          {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Channel</label>
        <select className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white" value={channel} onChange={(e) => setChannel(e.target.value)}>
          {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Target Role (optional)</label>
        <select className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white" value={roleTarget} onChange={(e) => setRoleTarget(e.target.value)}>
          <option value="">Any</option>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Message Template (optional)</label>
        <textarea className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white" value={template} onChange={(e) => setTemplate(e.target.value)} rows={2} placeholder="e.g., Workflow {{workflowName}} completed" />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => onSave({ workflowId, triggerOn, roleTarget: roleTarget || undefined, channel, template: template || undefined })} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500">Save Notification</button>
        {onCancel && <button onClick={onCancel} className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>}
      </div>
    </div>
  );
}
