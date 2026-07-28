"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CronPreset = {
  label: string;
  expression: string;
  description: string;
};

const PRESETS: CronPreset[] = [
  { label: "Every hour", expression: "0 * * * *", description: "At the start of every hour" },
  { label: "Every 6 hours", expression: "0 */6 * * *", description: "Every 6 hours at minute 0" },
  { label: "Daily midnight", expression: "0 0 * * *", description: "Every day at midnight" },
  { label: "Daily 8 AM", expression: "0 8 * * *", description: "Every day at 8:00 AM" },
  { label: "Daily 6 PM", expression: "0 18 * * *", description: "Every day at 6:00 PM" },
  { label: "Weekdays 9 AM", expression: "0 9 * * 1-5", description: "Monday–Friday at 9:00 AM" },
  { label: "Weekly Monday", expression: "0 0 * * 1", description: "Every Monday at midnight" },
  { label: "Monthly 1st", expression: "0 0 1 * *", description: "On the 1st of each month at midnight" },
  { label: "Quarterly", expression: "0 0 1 */3 *", description: "On the 1st of every 3rd month" },
];

interface CronBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export function CronBuilder({ value, onChange, }: CronBuilderProps) {
  const [minute, setMinute] = useState(() => {
    if (!value) return "0";
    const parts = value.trim().split(/\s+/);
    return parts[0] ?? "0";
  });
  const [hour, setHour] = useState(() => {
    if (!value) return "*";
    const parts = value.trim().split(/\s+/);
    return parts[1] ?? "*";
  });
  const [dayOfMonth, setDayOfMonth] = useState(() => {
    if (!value) return "*";
    const parts = value.trim().split(/\s+/);
    return parts[2] ?? "*";
  });
  const [month, setMonth] = useState(() => {
    if (!value) return "*";
    const parts = value.trim().split(/\s+/);
    return parts[3] ?? "*";
  });
  const [dayOfWeek, setDayOfWeek] = useState(() => {
    if (!value) return "*";
    const parts = value.trim().split(/\s+/);
    return parts[4] ?? "*";
  });

  const updateFromFields = useCallback(
    (m: string, h: string, dom: string, mo: string, dow: string) => {
      const expr = `${m || "*"} ${h || "*"} ${dom || "*"} ${mo || "*"} ${dow || "*"}`;
      onChange(expr);
    },
    [onChange],
  );

  const handleFieldChange = (
    setter: (v: string) => void,
    value: string,
    m: string, h: string, dom: string, mo: string, dow: string,
  ) => {
    setter(value);
    updateFromFields(m, h, dom, mo, dow);
  };

  const applyPreset = (preset: CronPreset) => {
    onChange(preset.expression);
    const parts = preset.expression.trim().split(/\s+/);
    setMinute(parts[0] ?? "0");
    setHour(parts[1] ?? "*");
    setDayOfMonth(parts[2] ?? "*");
    setMonth(parts[3] ?? "*");
    setDayOfWeek(parts[4] ?? "*");
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-400 mb-2">Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <Button
              key={preset.expression}
              type="button"
              variant={value === preset.expression ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(preset)}
              className={`h-7 text-[10px] ${
                value === preset.expression ? "bg-gold/10 text-gold" : ""
              }`}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-2">Custom expression</label>
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            const parts = e.target.value.trim().split(/\s+/);
            if (parts.length >= 5) {
              setMinute(parts[0]);
              setHour(parts[1]);
              setDayOfMonth(parts[2]);
              setMonth(parts[3]);
              setDayOfWeek(parts[4]);
            }
          }}
          placeholder="0 0 * * *"
          className="h-8 text-xs font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-2">Visual builder</label>
        <div className="grid grid-cols-5 gap-2">
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1">Minute</label>
            <Input
              value={minute}
              onChange={(e) => handleFieldChange(setMinute, e.target.value, e.target.value, hour, dayOfMonth, month, dayOfWeek)}
              placeholder="0"
              className="h-8 text-xs font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1">Hour</label>
            <Input
              value={hour}
              onChange={(e) => handleFieldChange(setHour, e.target.value, minute, e.target.value, dayOfMonth, month, dayOfWeek)}
              placeholder="*"
              className="h-8 text-xs font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1">Day (Month)</label>
            <Input
              value={dayOfMonth}
              onChange={(e) => handleFieldChange(setDayOfMonth, e.target.value, minute, hour, e.target.value, month, dayOfWeek)}
              placeholder="*"
              className="h-8 text-xs font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1">Month</label>
            <Input
              value={month}
              onChange={(e) => handleFieldChange(setMonth, e.target.value, minute, hour, dayOfMonth, e.target.value, dayOfWeek)}
              placeholder="*"
              className="h-8 text-xs font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-[9px] text-zinc-500 mb-1">Day (Week)</label>
            <Input
              value={dayOfWeek}
              onChange={(e) => handleFieldChange(setDayOfWeek, e.target.value, minute, hour, dayOfMonth, month, e.target.value)}
              placeholder="*"
              className="h-8 text-xs font-mono text-center"
            />
          </div>
        </div>
      </div>

      {value && value !== "* * * * *" && (
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Preview</label>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">{value}</Badge>
            <span className="text-[10px] text-zinc-500">
              {describeCron(value)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function describeCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) return "Invalid expression";

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return "Daily at midnight";
  if (minute === "0" && hour !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return `Daily at ${hour.padStart(2, "0")}:00`;
  if (minute === "0" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return "Every hour";
  if (minute === "0" && hour === "0" && dayOfMonth === "1" && month === "*" && dayOfWeek === "*") return "Monthly on 1st";
  if (minute === "0" && hour === "0" && dayOfMonth === "1" && month === "*/3" && dayOfWeek === "*") return "Quarterly";
  if (minute === "0" && hour === "9" && dayOfMonth === "*" && month === "*" && ["1-5", "MON-FRI", "1,2,3,4,5"].includes(dayOfWeek)) return "Weekdays at 9:00 AM";
  if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "1") return "Weekly on Monday";

  return "Custom schedule";
}
