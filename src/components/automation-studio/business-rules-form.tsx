"use client";

import { useState } from "react";
import { FileCheck, Plus, X, Settings2, Tag, Gauge, Power } from "lucide-react";
import type { BusinessRule, BusinessRuleType } from "@/modules/automation-studio/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EnterpriseForm } from "@/components/enterprise/forms/enterprise-form";
import { EnterpriseSection } from "@/components/enterprise/forms/enterprise-section";
import { EnterpriseField } from "@/components/enterprise/forms/enterprise-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BusinessRuleFormData) => void;
  editRule?: BusinessRule | null;
}

export interface BusinessRuleFormData {
  name: string;
  description: string;
  category: string;
  ruleType: BusinessRuleType;
  config: Record<string, string>;
  priority: number;
  isActive: boolean;
}

const RULE_TYPES: { value: BusinessRuleType; label: string; hint: string }[] = [
  { value: "policy", label: "Policy", hint: "Enforce organizational policies and standards" },
  { value: "threshold", label: "Threshold", hint: "Trigger actions when values cross limits" },
  { value: "validation", label: "Validation", hint: "Validate data against business constraints" },
  { value: "routing", label: "Routing", hint: "Route transactions based on attributes" },
];

const CATEGORIES = [
  "general", "approval", "financial", "compliance",
  "integration", "notification", "report", "custom",
];

export function BusinessRulesForm({ open, onOpenChange, onSave, editRule }: Props) {
  const [name, setName] = useState(editRule?.name ?? "");
  const [description, setDescription] = useState(editRule?.description ?? "");
  const [category, setCategory] = useState(editRule?.category ?? "general");
  const [ruleType, setRuleType] = useState<BusinessRuleType>(editRule?.ruleType ?? "policy");
  const [config, setConfig] = useState<Record<string, string>>(
    editRule?.config ? Object.fromEntries(Object.entries(editRule.config).map(([k, v]) => [k, String(v)])) : {},
  );
  const [priority, setPriority] = useState(editRule?.priority ?? 50);
  const [isActive, setIsActive] = useState(editRule?.isActive ?? true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addConfigEntry = () => {
    if (!newKey.trim()) return;
    setConfig((prev) => ({ ...prev, [newKey.trim()]: newValue }));
    setNewKey("");
    setNewValue("");
  };

  const removeConfigEntry = (key: string) => {
    setConfig((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Rule" : "Create Business Rule"}</DialogTitle>
          <DialogDescription>
            Define business logic for automation workflows
          </DialogDescription>
        </DialogHeader>
        <EnterpriseForm
          onSubmit={() => onSave({ name, description, category, ruleType, config, priority, isActive })}
          submitLabel={editRule ? "Update Rule" : "Create Rule"}
          submitIcon={<FileCheck className="h-4 w-4" />}
          cancelLabel="Cancel"
          onCancel={() => onOpenChange(false)}
        >
          <EnterpriseField
            label="Rule Name"
            htmlFor="name"
            required
            helpText="A descriptive name that helps identify this rule in reports and logs"
            hint='Use a consistent naming convention. Example: "High-Value Transfer Policy"'
            hintType="best-practice"
          >
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Value Transfer Policy"
              required
            />
          </EnterpriseField>

          <EnterpriseField
            label="Description"
            htmlFor="description"
            helpText="Explain what this rule does and when it should apply"
            hint="Be specific about the business context and expected behavior"
            hintType="tip"
          >
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this rule does"
              rows={2}
            />
          </EnterpriseField>

          <div className="grid grid-cols-2 gap-4">
            <EnterpriseField
              label="Rule Type"
              htmlFor="ruleType"
              helpText="Determines how this rule is evaluated"
            >
              <div className="flex gap-2">
                {RULE_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setRuleType(rt.value)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      ruleType === rt.value
                        ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                        : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                    }`}
                    title={rt.hint}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </EnterpriseField>

            <EnterpriseField
              label="Category"
              htmlFor="category"
              helpText="Group related rules for easier management"
            >
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium capitalize transition-colors ${
                      category === cat
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </EnterpriseField>
          </div>

          <EnterpriseField
            label="Priority"
            htmlFor="priority"
            helpText="Higher priority rules are evaluated first"
            hint="Set higher priority for compliance and financial rules"
            hintType="best-practice"
          >
            <div className="space-y-2">
              <input
                id="priority"
                type="range"
                min={1}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-0.5 text-zinc-400">
                    <Gauge className="h-3 w-3" />
                    Priority: <span className="text-white font-semibold">{priority}</span>
                  </span>
                  <span className="text-zinc-600">
                    {priority >= 80 ? "Critical" : priority >= 50 ? "Normal" : "Low"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600">Low (1) — High (100)</span>
              </div>
            </div>
          </EnterpriseField>

          <EnterpriseField
            label="Active"
            htmlFor="isActive"
            description="Enable this rule for evaluation in workflows"
            helpText="Inactive rules are preserved but not evaluated"
          >
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Power className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-zinc-600")} />
                <div>
                  <p className="text-sm font-medium text-white">{isActive ? "Active" : "Inactive"}</p>
                  <p className="text-xs text-zinc-500">
                    {isActive ? "Rule is being evaluated" : "Rule is disabled"}
                  </p>
                </div>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </EnterpriseField>

          <EnterpriseSection
            config={{
              id: "config",
              title: "Configuration Parameters",
              description: "Additional key-value settings for this rule",
              collapsible: true,
              icon: <Settings2 className="h-4 w-4" />,
            }}
          >
            <div className="space-y-2">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <code className="flex-1 rounded border border-white/[0.06] bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300">
                    {key}: {value}
                  </code>
                  <button
                    type="button"
                    onClick={() => removeConfigEntry(key)}
                    className="rounded p-1 text-zinc-600 hover:text-red-400"
                    aria-label="Remove entry"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key"
                aria-label="Config key"
                className="h-8 text-xs flex-1"
              />
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value"
                aria-label="Config value"
                className="h-8 text-xs flex-1"
              />
              <button
                type="button"
                onClick={addConfigEntry}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/5 px-3 py-1.5 text-[11px] font-medium text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors h-8 shrink-0"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </EnterpriseSection>
        </EnterpriseForm>
      </DialogContent>
    </Dialog>
  );
}


