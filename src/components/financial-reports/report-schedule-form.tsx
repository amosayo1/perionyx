"use client";

import { useState, useCallback, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { EnterpriseForm, EnterpriseSection, EnterpriseField } from "@/components/enterprise/forms";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";
import { SectionTransition } from "@/components/enterprise/motion/section-transition";
import type { ReportSchedule, ScheduleFrequency, ExportFormat } from "@/modules/financial-reporting/types";
import { Calendar, Clock, Mail } from "lucide-react";

interface ReportScheduleFormProps {
  schedule?: Partial<ReportSchedule>;
  onSave: (data: Partial<ReportSchedule>) => void;
  onCancel: () => void;
}

const frequencies: { value: ScheduleFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom (Cron)" },
];

const formats: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
  { value: "powerpoint", label: "PowerPoint" },
];

function getNextRunPreview(frequency: ScheduleFrequency): string {
  const now = new Date();
  switch (frequency) {
    case "daily":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    case "weekly":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (8 - now.getDay())).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString("en-US", { month: "long", day: "numeric" });
    case "quarterly":
      const q = Math.floor(now.getMonth() / 3) * 3 + 3;
      return new Date(now.getFullYear(), q, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "yearly":
      return new Date(now.getFullYear() + 1, 0, 1).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    default:
      return "Based on cron expression";
  }
}

export function ReportScheduleForm({ schedule, onSave, onCancel }: ReportScheduleFormProps) {
  const [name, setName] = useState(schedule?.name ?? "");
  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule?.frequency ?? "monthly");
  const [cronExpression, setCronExpression] = useState(schedule?.cronExpression ?? "");
  const [format, setFormat] = useState<ExportFormat>(schedule?.format ?? "pdf");
  const [recipients, setRecipients] = useState(schedule?.recipients?.join(", ") ?? "");
  const [isActive, setIsActive] = useState(schedule?.isActive ?? true);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name is required");
    if (frequency === "custom" && !cronExpression.trim()) errs.push("Cron expression is required");
    if (recipients.trim()) {
      const emails = recipients.split(",").map((r) => r.trim()).filter(Boolean);
      const invalid = emails.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (invalid.length > 0) errs.push(`Invalid email(s): ${invalid.join(", ")}`);
    }
    setErrors(errs);
    if (errs.length === 0) {
      onSave({
        name: name.trim(),
        frequency,
        cronExpression: frequency === "custom" ? cronExpression.trim() : undefined,
        format,
        recipients: recipients.split(",").map((r) => r.trim()).filter(Boolean),
        isActive,
      });
    }
  }, [name, frequency, cronExpression, format, recipients, isActive, onSave]);

  const nextRun = getNextRunPreview(frequency);

  return (
    <EnterpriseForm
      onSubmit={handleSubmit}
      title="Schedule Report"
      submitLabel="Save Schedule"
      className="min-h-0"
    >
      {errors.length > 0 && (
        <div className="mx-6 mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-2">
          {errors.map((err, i) => (
            <p key={i} role="alert" className="text-xs text-red-400">{err}</p>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <EnterpriseSection config={{ id: "schedule-details", title: "Schedule Details", collapsible: false }}>
          <div className="space-y-4 p-4">
            <EnterpriseField label="Schedule Name" htmlFor="sched-name" required>
              <input
                id="sched-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Monthly Financial Report"
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
              />
            </EnterpriseField>

            <EnterpriseField label="Frequency" htmlFor="sched-freq" required>
              <select
                id="sched-freq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                {frequencies.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </EnterpriseField>

            {frequency === "custom" && (
              <EnterpriseField label="Cron Expression" htmlFor="sched-cron" required>
                <input
                  id="sched-cron"
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 0 1 * *"
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 font-mono"
                />
              </EnterpriseField>
            )}
          </div>
        </EnterpriseSection>

        <EnterpriseSection config={{ id: "delivery", title: "Output & Delivery", collapsible: false }} className="mt-4">
          <div className="space-y-4 p-4">
            <EnterpriseField label="Format" htmlFor="sched-format">
              <select
                id="sched-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                {formats.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </EnterpriseField>

            <EnterpriseField label="Recipients" htmlFor="sched-recipients" helpText="Comma-separated email addresses">
              <input
                id="sched-recipients"
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="cfo@company.com, treasurer@company.com"
                className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
              />
            </EnterpriseField>

            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-amber-400"
              />
              Active
            </label>
          </div>
        </EnterpriseSection>

        <div className="mt-4 rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Next scheduled run: <span className="font-medium text-zinc-300">{nextRun}</span></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-6 py-3">
        <AnimatedButton variant="ghost" onClick={onCancel}>Cancel</AnimatedButton>
        <AnimatedButton type="submit" variant="primary">Save Schedule</AnimatedButton>
      </div>
    </EnterpriseForm>
  );
}
