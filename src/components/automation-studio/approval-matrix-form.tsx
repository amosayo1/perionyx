"use client";

import { useState } from "react";
import { ShieldCheck, Plus, X } from "lucide-react";
import type {
  ApprovalMatrixRule,
  ApprovalMode,
  ConditionOperator,
  ApprovalCondition,
} from "@/modules/automation-studio/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ApprovalMatrixFormData) => void;
  editRule?: ApprovalMatrixRule | null;
}

export interface ApprovalMatrixFormData {
  name: string;
  description: string;
  priority: number;
  conditions: ApprovalCondition[];
  requiredApprovers: number;
  approverRoles: string[];
  approvalMode: ApprovalMode;
  timeoutMinutes: number;
  escalationEnabled: boolean;
  escalationDelayMinutes: number;
  escalationRoles: string[];
  delegationEnabled: boolean;
  delegationRoles: string[];
  departmentScope: string;
  thresholdField: string;
  thresholdOperator: ConditionOperator;
  thresholdValue: number;
  isActive: boolean;
}

const EMPTY_FORM: ApprovalMatrixFormData = {
  name: "",
  description: "",
  priority: 50,
  conditions: [],
  requiredApprovers: 1,
  approverRoles: [],
  approvalMode: "sequential",
  timeoutMinutes: 1440,
  escalationEnabled: false,
  escalationDelayMinutes: 60,
  escalationRoles: [],
  delegationEnabled: false,
  delegationRoles: [],
  departmentScope: "",
  thresholdField: "",
  thresholdOperator: "gt",
  thresholdValue: 0,
  isActive: true,
};

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "contains", label: "contains" },
];

const COMMON_ROLES = [
  "admin", "finance_manager", "compliance_officer", "treasury_analyst",
  "director", "vp_finance", "cfo", "ceo", "auditor", "risk_manager",
];

export function ApprovalMatrixForm({ open, onOpenChange, onSave, editRule }: Props) {
  const initFromRule = (): ApprovalMatrixFormData => {
    if (!editRule) return { ...EMPTY_FORM };
    return {
      name: editRule.name,
      description: editRule.description,
      priority: editRule.priority,
      conditions: editRule.conditions,
      requiredApprovers: editRule.requiredApprovers,
      approverRoles: [...editRule.approverRoles],
      approvalMode: editRule.approvalMode,
      timeoutMinutes: editRule.timeoutMinutes,
      escalationEnabled: editRule.escalationEnabled,
      escalationDelayMinutes: editRule.escalationDelayMinutes ?? 60,
      escalationRoles: editRule.escalationRoles ?? [],
      delegationEnabled: editRule.delegationEnabled,
      delegationRoles: editRule.delegationRoles ?? [],
      departmentScope: editRule.departmentScope ?? "",
      thresholdField: editRule.thresholdField ?? "",
      thresholdOperator: editRule.thresholdOperator ?? "gt",
      thresholdValue: editRule.thresholdValue ?? 0,
      isActive: editRule.isActive,
    };
  };

  const [form, setForm] = useState<ApprovalMatrixFormData>(initFromRule);
  const [newRole, setNewRole] = useState("");
  const [newEscRole, setNewEscRole] = useState("");
  const [newDelRole, setNewDelRole] = useState("");

  const update = <K extends keyof ApprovalMatrixFormData>(key: K, value: ApprovalMatrixFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addCondition = () => {
    update("conditions", [
      ...form.conditions,
      { field: "", operator: "eq" as ConditionOperator, value: "" },
    ]);
  };

  const updateCondition = (idx: number, key: keyof ApprovalCondition, value: unknown) => {
    const updated = form.conditions.map((c, i) => (i === idx ? { ...c, [key]: value } : c));
    update("conditions", updated);
  };

  const removeCondition = (idx: number) => {
    update("conditions", form.conditions.filter((_, i) => i !== idx));
  };

  const addRole = (list: "approverRoles" | "escalationRoles" | "delegationRoles", value: string) => {
    if (!value.trim() || form[list].includes(value.trim())) return;
    update(list, [...form[list], value.trim()]);
    setNewRole("");
    setNewEscRole("");
    setNewDelRole("");
  };

  const removeRole = (list: "approverRoles" | "escalationRoles" | "delegationRoles", value: string) => {
    update(list, form[list].filter((r) => r !== value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Approval Rule" : "Create Approval Rule"}</DialogTitle>
          <DialogDescription>
            Define who can approve what based on roles, departments, and amount thresholds
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g., Wire Transfer Approval"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority ({form.priority})</Label>
              <input
                id="priority"
                type="range"
                min={1}
                max={100}
                value={form.priority}
                onChange={(e) => update("priority", Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe this approval rule"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Required Approvers</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.requiredApprovers}
                onChange={(e) => update("requiredApprovers", Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-2">
              <Label>Timeout (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={form.timeoutMinutes}
                onChange={(e) => update("timeoutMinutes", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Approval Mode</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update("approvalMode", "sequential")}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    form.approvalMode === "sequential"
                      ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                      : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06]"
                  }`}
                >
                  Sequential
                </button>
                <button
                  type="button"
                  onClick={() => update("approvalMode", "parallel")}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    form.approvalMode === "parallel"
                      ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                      : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06]"
                  }`}
                >
                  Parallel
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Approver Roles</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.approverRoles.map((role) => (
                <span key={role} className="inline-flex items-center gap-1 rounded-md bg-[#d4af37]/10 px-2 py-0.5 text-[10px] text-[#d4af37]">
                  {role}
                  <button type="button" onClick={() => removeRole("approverRoles", role)} className="hover:text-red-400">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Type role name..."
                  className="h-8 text-xs pr-16"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole("approverRoles", newRole))}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                  {COMMON_ROLES.filter((r) => r.includes(newRole.toLowerCase()) && !form.approverRoles.includes(r)).slice(0, 2).map((cr) => (
                    <button
                      key={cr}
                      type="button"
                      onClick={() => addRole("approverRoles", cr)}
                      className="rounded px-1.5 py-0.5 text-[9px] text-zinc-500 hover:text-zinc-300 bg-zinc-800"
                    >
                      {cr}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => addRole("approverRoles", newRole)} className="h-8 gap-1">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conditions</Label>
            <div className="space-y-1.5">
              {form.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3 py-2">
                  <Input
                    value={cond.field}
                    onChange={(e) => updateCondition(idx, "field", e.target.value)}
                    placeholder="Field"
                    className="h-7 text-xs flex-1"
                  />
                  <div className="flex gap-0.5">
                    {OPERATORS.map((op) => (
                      <button
                        key={op.value}
                        type="button"
                        onClick={() => updateCondition(idx, "operator", op.value)}
                        className={`rounded px-1.5 py-1 text-[9px] font-mono transition-colors ${
                          cond.operator === op.value
                            ? "bg-[#d4af37]/10 text-[#d4af37]"
                            : "text-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={String(cond.value)}
                    onChange={(e) => updateCondition(idx, "value", e.target.value)}
                    placeholder="Value"
                    className="h-7 text-xs w-24"
                  />
                  <button type="button" onClick={() => removeCondition(idx)} className="rounded p-1 text-zinc-600 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addCondition} className="gap-1">
              <Plus className="h-3 w-3" />
              Add Condition
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Department Scope</Label>
            <Input
              value={form.departmentScope}
              onChange={(e) => update("departmentScope", e.target.value)}
              placeholder="e.g., finance, treasury (leave empty for all)"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Threshold Field</Label>
              <Input
                value={form.thresholdField}
                onChange={(e) => update("thresholdField", e.target.value)}
                placeholder="e.g., amount"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <div className="flex gap-1">
                {OPERATORS.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => update("thresholdOperator", op.value)}
                    className={`flex-1 rounded px-2 py-1 text-[10px] font-mono transition-colors ${
                      form.thresholdOperator === op.value
                        ? "bg-[#d4af37]/10 text-[#d4af37]"
                        : "bg-zinc-900/40 text-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Threshold Value</Label>
              <Input
                type="number"
                value={form.thresholdValue}
                onChange={(e) => update("thresholdValue", Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Escalation</p>
                  <p className="text-xs text-zinc-500">Escalate to higher roles on timeout</p>
                </div>
                <Switch checked={form.escalationEnabled} onCheckedChange={(v) => update("escalationEnabled", v)} />
              </div>
              {form.escalationEnabled && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Delay (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.escalationDelayMinutes}
                      onChange={(e) => update("escalationDelayMinutes", Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Escalation Roles</Label>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {form.escalationRoles.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-400">
                          {r}
                          <button type="button" onClick={() => removeRole("escalationRoles", r)}><X className="h-2 w-2" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Input
                        value={newEscRole}
                        onChange={(e) => setNewEscRole(e.target.value)}
                        placeholder="Role"
                        className="h-7 text-xs flex-1"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole("escalationRoles", newEscRole))}
                      />
                      <Button type="button" size="sm" variant="outline" onClick={() => addRole("escalationRoles", newEscRole)} className="h-7 text-[10px]">Add</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Delegation</p>
                  <p className="text-xs text-zinc-500">Allow approvers to delegate</p>
                </div>
                <Switch checked={form.delegationEnabled} onCheckedChange={(v) => update("delegationEnabled", v)} />
              </div>
              {form.delegationEnabled && (
                <div className="space-y-1">
                  <Label className="text-[10px]">Delegation Roles</Label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {form.delegationRoles.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                        {r}
                        <button type="button" onClick={() => removeRole("delegationRoles", r)}><X className="h-2 w-2" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input
                      value={newDelRole}
                      onChange={(e) => setNewDelRole(e.target.value)}
                      placeholder="Role"
                      className="h-7 text-xs flex-1"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole("delegationRoles", newDelRole))}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => addRole("delegationRoles", newDelRole)} className="h-7 text-[10px]">Add</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-zinc-500">Enable this approval rule</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => update("isActive", v)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              {editRule ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
