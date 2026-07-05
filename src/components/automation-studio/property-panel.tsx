"use client";

import { useState } from "react";
import { Settings, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { DesignerStep } from "./types";
import { STEP_PALETTE } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface Props {
  step: DesignerStep;
  onChange: (step: DesignerStep) => void;
  onDelete: (stepId: string) => void;
}

function ConfigField({ label, value, onChange, type = "text", options }: {
  label: string;
  value: unknown;
  onChange: (v: string) => void;
  type?: string;
  options?: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {options ? (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-xs text-white"
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <Textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-16 text-xs"
        />
      ) : type === "number" ? (
        <Input
          type="number"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      ) : (
        <Input
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      )}
    </div>
  );
}

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
];

const CHANNEL_OPTIONS = [
  { value: "in_app", label: "In-App" },
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
];

const CONNECTOR_OPTIONS = [
  { value: "plaid", label: "Plaid" },
  { value: "ledger", label: "Ledger" },
  { value: "payment", label: "Payment" },
  { value: "treasury", label: "Treasury" },
  { value: "reporting", label: "Reporting" },
  { value: "governance", label: "Governance" },
];

export function PropertyPanel({ step, onChange, onDelete }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const paletteItem = STEP_PALETTE.find((p) => p.type === step.type);

  const updateConfig = (key: string, value: string) => {
    onChange({ ...step, config: { ...step.config, [key]: value } });
  };

  const renderTypeSpecificConfig = () => {
    switch (step.type) {
      case "approval":
        return (
          <>
            <ConfigField label="Required Role" value={step.config.requiredRole} onChange={(v) => updateConfig("requiredRole", v)} options={ROLE_OPTIONS} />
            <ConfigField label="Threshold Amount" value={step.config.threshold} onChange={(v) => updateConfig("threshold", v)} type="number" />
            <ConfigField label="Parallel Approvers" value={step.config.parallelApprovers} onChange={(v) => updateConfig("parallelApprovers", v)} type="number" />
          </>
        );
      case "human_task":
        return (
          <>
            <ConfigField label="Task Type" value={step.config.taskType} onChange={(v) => updateConfig("taskType", v)} options={[{ value: "review", label: "Review" }, { value: "approval", label: "Approval" }, { value: "setup", label: "Setup" }, { value: "input", label: "Data Input" }]} />
            <ConfigField label="Required Role" value={step.config.role} onChange={(v) => updateConfig("role", v)} options={ROLE_OPTIONS} />
          </>
        );
      case "decision":
        return (
          <>
            <ConfigField label="Condition Expression" value={step.config.condition} onChange={(v) => updateConfig("condition", v)} />
            <ConfigField label="True Branch Step" value={step.config.trueBranch} onChange={(v) => updateConfig("trueBranch", v)} />
            <ConfigField label="False Branch Step" value={step.config.falseBranch} onChange={(v) => updateConfig("falseBranch", v)} />
          </>
        );
      case "policy_evaluation":
        return (
          <>
            <ConfigField label="Evaluation Scope" value={step.config.scope} onChange={(v) => updateConfig("scope", v)} options={[{ value: "transaction", label: "Transaction" }, { value: "payment", label: "Payment" }, { value: "connector", label: "Connector" }, { value: "vendor", label: "Vendor" }, { value: "invoice", label: "Invoice" }, { value: "reconciliation", label: "Reconciliation" }]} />
          </>
        );
      case "notification":
        return (
          <>
            <ConfigField label="Channel" value={step.config.channel} onChange={(v) => updateConfig("channel", v)} options={CHANNEL_OPTIONS} />
            <ConfigField label="Template" value={step.config.template} onChange={(v) => updateConfig("template", v)} />
          </>
        );
      case "connector_execution":
        return (
          <>
            <ConfigField label="Connector Type" value={step.config.connectorType} onChange={(v) => updateConfig("connectorType", v)} options={CONNECTOR_OPTIONS} />
            <ConfigField label="Action" value={step.config.action} onChange={(v) => updateConfig("action", v)} />
          </>
        );
      case "ai_recommendation":
        return (
          <>
            <ConfigField label="AI Prompt" value={step.config.prompt} onChange={(v) => updateConfig("prompt", v)} type="textarea" />
          </>
        );
      case "delay":
        return (
          <>
            <ConfigField label="Duration (minutes)" value={step.config.durationMinutes} onChange={(v) => updateConfig("durationMinutes", v)} type="number" />
          </>
        );
      case "conditional":
        return (
          <>
            <ConfigField label="Variable" value={step.config.variable} onChange={(v) => updateConfig("variable", v)} />
            <ConfigField label="Operator" value={step.config.operator} onChange={(v) => updateConfig("operator", v)} options={[{ value: "equals", label: "Equals" }, { value: "not_equals", label: "Not Equals" }, { value: "greater_than", label: "Greater Than" }, { value: "less_than", label: "Less Than" }, { value: "contains", label: "Contains" }]} />
            <ConfigField label="Value" value={step.config.value} onChange={(v) => updateConfig("value", v)} />
          </>
        );
      default:
        return (
          <p className="text-xs text-zinc-500 py-2">No specific configuration for this step type.</p>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <Settings className="h-3.5 w-3.5 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Properties</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={() => onDelete(step.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="space-y-1">
          <Label>Step Label</Label>
          <Input
            value={step.label}
            onChange={(e) => onChange({ ...step, label: e.target.value })}
            className="h-8 text-xs"
            placeholder="Enter a label for this step"
          />
        </div>

        <div className="space-y-1">
          <Label>Step Type</Label>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2">
            {paletteItem && (
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: paletteItem.color }} />
            )}
            <span className="text-xs text-zinc-300">{paletteItem?.label ?? step.type}</span>
          </div>
        </div>

        {renderTypeSpecificConfig()}

        <div className="border-t border-white/[0.06] pt-3">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            {advancedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Advanced
          </button>
          {advancedOpen && (
            <div className="mt-2 space-y-3">
              <ConfigField label="Timeout (minutes)" value={step.config.timeoutMinutes} onChange={(v) => updateConfig("timeoutMinutes", v)} type="number" />
              <ConfigField label="Retry Count" value={step.config.retryCount} onChange={(v) => updateConfig("retryCount", v)} type="number" />
              <ConfigField label="Retry Delay (ms)" value={step.config.retryDelayMs} onChange={(v) => updateConfig("retryDelayMs", v)} type="number" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
