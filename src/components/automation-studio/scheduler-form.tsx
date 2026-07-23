"use client";

import { useState } from "react";
import { CalendarClock, Plus, Clock, Play, Webhook, Zap, RefreshCw, CheckCircle2, ShieldCheck, Power } from "lucide-react";
import type { AutomationSchedule, ScheduleTriggerType } from "@/modules/automation-studio/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EnterpriseForm } from "@/components/enterprise/forms/enterprise-form";
import { EnterpriseSection } from "@/components/enterprise/forms/enterprise-section";
import { EnterpriseField } from "@/components/enterprise/forms/enterprise-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CronBuilder } from "./cron-builder";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SchedulerFormData) => void;
  editSchedule?: AutomationSchedule | null;
}

export interface SchedulerFormData {
  name: string;
  triggerType: ScheduleTriggerType;
  cronExpression: string;
  eventSource: string;
  eventType: string;
  startAt: string;
  templateId: string;
  blueprintId: string;
  input: Record<string, string>;
  enabled: boolean;
}

const TRIGGER_TYPES: { value: ScheduleTriggerType; label: string; description: string; icon: any; color: string }[] = [
  { value: "immediate", label: "Immediate", description: "Run as soon as created", icon: Zap, color: "text-emerald-400" },
  { value: "scheduled", label: "Scheduled", description: "Run once at a specific time", icon: Clock, color: "text-blue-400" },
  { value: "recurring", label: "Recurring", description: "Run repeatedly at intervals", icon: RefreshCw, color: "text-purple-400" },
  { value: "cron", label: "Cron", description: "Run on a cron expression", icon: CalendarClock, color: "text-[#d4af37]" },
  { value: "webhook", label: "Webhook", description: "Triggered by incoming webhook", icon: Webhook, color: "text-cyan-400" },
  { value: "manual", label: "Manual", description: "Triggered manually by a user", icon: Play, color: "text-zinc-400" },
  { value: "connector_event", label: "Connector Event", description: "On connector run result", icon: RefreshCw, color: "text-rose-400" },
  { value: "bank_event", label: "Bank Event", description: "On bank transaction event", icon: RefreshCw, color: "text-emerald-400" },
  { value: "erp_event", label: "ERP Event", description: "On ERP system event", icon: RefreshCw, color: "text-indigo-400" },
  { value: "approval_event", label: "Approval Event", description: "On approval granted/rejected", icon: CheckCircle2, color: "text-amber-400" },
  { value: "governance_event", label: "Governance Event", description: "On policy violation", icon: ShieldCheck, color: "text-orange-400" },
  { value: "decision_event", label: "Decision Event", description: "On decision intelligence result", icon: Zap, color: "text-violet-400" },
];

const EMPTY_FORM: SchedulerFormData = {
  name: "",
  triggerType: "scheduled",
  cronExpression: "",
  eventSource: "",
  eventType: "",
  startAt: "",
  templateId: "",
  blueprintId: "",
  input: {},
  enabled: true,
};

export function SchedulerForm({ open, onOpenChange, onSave, editSchedule }: Props) {
  const init = (): SchedulerFormData => {
    if (!editSchedule) return { ...EMPTY_FORM };
    return {
      name: editSchedule.name,
      triggerType: editSchedule.triggerType,
      cronExpression: editSchedule.cronExpression ?? "",
      eventSource: editSchedule.eventSource ?? "",
      eventType: editSchedule.eventType ?? "",
      startAt: editSchedule.startAt ?? "",
      templateId: editSchedule.templateId ?? "",
      blueprintId: editSchedule.blueprintId ?? "",
      input: editSchedule.input ? Object.fromEntries(Object.entries(editSchedule.input).map(([k, v]) => [k, String(v)])) : {},
      enabled: editSchedule.enabled,
    };
  };

  const [form, setForm] = useState<SchedulerFormData>(init);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const update = <K extends keyof SchedulerFormData>(key: K, value: SchedulerFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const needsEvent = form.triggerType === "connector_event" || form.triggerType === "bank_event" || form.triggerType === "erp_event" || form.triggerType === "approval_event" || form.triggerType === "governance_event" || form.triggerType === "decision_event";
  const needsTiming = form.triggerType === "scheduled";

  const addInputEntry = () => {
    if (!newKey.trim()) return;
    update("input", { ...form.input, [newKey.trim()]: newValue });
    setNewKey("");
    setNewValue("");
  };

  const removeInputEntry = (key: string) => {
    const next = { ...form.input };
    delete next[key];
    update("input", next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editSchedule ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
          <DialogDescription>
            Configure when and how automations are triggered
          </DialogDescription>
        </DialogHeader>
        <EnterpriseForm
          onSubmit={() => onSave(form)}
          submitLabel={editSchedule ? "Update Schedule" : "Create Schedule"}
          submitIcon={<CalendarClock className="h-4 w-4" />}
          cancelLabel="Cancel"
          onCancel={() => onOpenChange(false)}
        >
          <EnterpriseField label="Schedule Name" htmlFor="name" required helpText="A descriptive name for this schedule">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g., Daily Treasury Report"
              required
            />
          </EnterpriseField>

          <EnterpriseField
            label="Trigger Type"
            htmlFor="triggerType"
            helpText="What event or schedule starts this automation"
            hint="Choose the trigger that best matches your use case. Cron expressions give the most control."
            hintType="best-practice"
          >
            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
              {TRIGGER_TYPES.map((tt) => {
                const Icon = tt.icon;
                return (
                  <button
                    key={tt.value}
                    type="button"
                    onClick={() => update("triggerType", tt.value)}
                    title={tt.description}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors",
                      form.triggerType === tt.value
                        ? "bg-[#d4af37]/10 border border-[#d4af37]/30"
                        : "bg-zinc-900/40 border border-white/[0.06] hover:bg-zinc-900/60",
                    )}
                  >
                    <Icon className={`h-3.5 w-3.5 ${tt.color}`} />
                    <span className="text-[8px] font-medium text-zinc-400 leading-tight">{tt.label}</span>
                  </button>
                );
              })}
            </div>
          </EnterpriseField>

          {form.triggerType === "cron" && (
            <EnterpriseField label="Cron Expression" htmlFor="cron" helpText="Define the schedule using cron syntax">
              <CronBuilder
                value={form.cronExpression}
                onChange={(v) => update("cronExpression", v)}
              />
            </EnterpriseField>
          )}
          {(form.triggerType === "scheduled" || form.triggerType === "recurring") && (
            <EnterpriseField label="Interval" htmlFor="interval" helpText="How often should this run?">
              <Input
                id="interval"
                value={form.cronExpression}
                onChange={(e) => update("cronExpression", e.target.value)}
                placeholder="Every 6 hours"
                className="font-mono text-xs h-8"
              />
            </EnterpriseField>
          )}

          {needsTiming && (
            <EnterpriseField label="Start Date/Time" htmlFor="startAt" helpText="When should this schedule begin?">
              <Input
                id="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => update("startAt", e.target.value)}
                className="h-8 text-xs"
              />
            </EnterpriseField>
          )}

          {needsEvent && (
            <div className="grid grid-cols-2 gap-4">
              <EnterpriseField label="Event Source" htmlFor="eventSource" helpText="The system that generates the event">
                <Input
                  id="eventSource"
                  value={form.eventSource}
                  onChange={(e) => update("eventSource", e.target.value)}
                  placeholder="e.g., plaid, stripe, sap"
                  className="h-8 text-xs"
                />
              </EnterpriseField>
              <EnterpriseField label="Event Type" htmlFor="eventType" helpText="The specific event to listen for">
                <Input
                  id="eventType"
                  value={form.eventType}
                  onChange={(e) => update("eventType", e.target.value)}
                  placeholder="e.g., transaction.posted"
                  className="h-8 text-xs"
                />
              </EnterpriseField>
            </div>
          )}

          <EnterpriseSection
            config={{
              id: "advanced",
              title: "Advanced Settings",
              description: "Optional configuration for templates and blueprints",
              collapsible: true,
              advanced: true,
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <EnterpriseField label="Template ID" htmlFor="templateId" optional>
                <Input
                  id="templateId"
                  value={form.templateId}
                  onChange={(e) => update("templateId", e.target.value)}
                  placeholder="template-id"
                  className="h-8 text-xs"
                />
              </EnterpriseField>
              <EnterpriseField label="Blueprint ID" htmlFor="blueprintId" optional>
                <Input
                  id="blueprintId"
                  value={form.blueprintId}
                  onChange={(e) => update("blueprintId", e.target.value)}
                  placeholder="blueprint-id"
                  className="h-8 text-xs"
                />
              </EnterpriseField>
            </div>
          </EnterpriseSection>

          <EnterpriseSection
            config={{
              id: "input",
              title: "Input Parameters",
              description: "Key-value pairs passed to the automation",
              collapsible: true,
              advanced: true,
            }}
          >
            <div className="space-y-2">
              {Object.entries(form.input).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <code className="flex-1 rounded border border-white/[0.06] bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300">
                    {key}: {value}
                  </code>
                  <button
                    type="button"
                    onClick={() => removeInputEntry(key)}
                    className="rounded p-1 text-zinc-600 hover:text-red-400"
                    aria-label="Remove entry"
                  >
                    <Plus className="h-3 w-3 rotate-45" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key"
                aria-label="Input parameter key"
                className="h-8 text-xs flex-1"
              />
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value"
                aria-label="Input parameter value"
                className="h-8 text-xs flex-1"
              />
              <button
                type="button"
                onClick={addInputEntry}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/5 px-3 py-1.5 text-[11px] font-medium text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors h-8 shrink-0"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </EnterpriseSection>

          <EnterpriseField label="Enabled" htmlFor="enabled">
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Power className={cn("h-4 w-4", form.enabled ? "text-emerald-400" : "text-zinc-600")} />
                <div>
                  <p className="text-sm font-medium text-white">{form.enabled ? "Active" : "Inactive"}</p>
                  <p className="text-xs text-zinc-500">{form.enabled ? "Schedule is active" : "Schedule is disabled"}</p>
                </div>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => update("enabled", v)} />
            </div>
          </EnterpriseField>
        </EnterpriseForm>
      </DialogContent>
    </Dialog>
  );
}
