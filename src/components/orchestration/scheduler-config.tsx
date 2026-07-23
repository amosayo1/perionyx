"use client";

import { useState } from "react";

interface SchedulerConfigProps {
  workflowId: string;
  onSave: (data: { workflowId: string; cron: string; timezone?: string }) => void;
  onCancel?: () => void;
}

const CRON_PRESETS = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Daily at 8 AM", value: "0 8 * * *" },
  { label: "Weekdays at 9 AM", value: "0 9 * * 1-5" },
  { label: "Monday morning", value: "0 8 * * 1" },
  { label: "Monthly on 1st", value: "0 0 1 * *" },
  { label: "Custom", value: "custom" },
];

const TIMEZONES = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"];

export function SchedulerConfig({ workflowId, onSave, onCancel }: SchedulerConfigProps) {
  const [cron, setCron] = useState("0 0 * * *");
  const [timezone, setTimezone] = useState("UTC");
  const [customCron, setCustomCron] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-zinc-400">Schedule Preset</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {CRON_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                if (p.value === "custom") { setUseCustom(true); return; }
                setUseCustom(false);
                setCron(p.value);
              }}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                !useCustom && cron === p.value
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                  : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {p.label}
              <span className="block text-[10px] text-zinc-600">{p.value !== "custom" ? p.value : ""}</span>
            </button>
          ))}
        </div>
      </div>

      {useCustom && (
        <div>
          <label className="text-xs font-medium text-zinc-400">Custom Cron Expression</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
            value={customCron}
            onChange={(e) => setCustomCron(e.target.value)}
            placeholder="e.g., 0 0 * * 1"
          />
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-zinc-400">Timezone</label>
        <select
          className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave({ workflowId, cron: useCustom ? customCron : cron, timezone })}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500"
        >
          Save Schedule
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
