"use client";

import { useState } from "react";
import { ShieldCheck, Plus, X, Users, Timer, GitBranch, Building2, ArrowUpDown, Power } from "lucide-react";
import type { ApprovalMatrixRule, ApprovalMode, ConditionOperator, ApprovalCondition } from "@/modules/automation-studio/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EnterpriseForm } from "@/components/enterprise/forms/enterprise-form";
import { EnterpriseSection } from "@/components/enterprise/forms/enterprise-section";
import { EnterpriseField } from "@/components/enterprise/forms/enterprise-field";
import { ConditionEditor } from "@/components/enterprise/forms/condition-editor";
import { ApprovalPreview } from "@/components/enterprise/forms/approval-preview";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
      thresholdValue: typeof editRule.thresholdValue === "number"
        ? editRule.thresholdValue
        : editRule.thresholdValue != null ? Number(String(editRule.thresholdValue)) : 0,
      isActive: editRule.isActive,
    };
  };

  const [form, setForm] = useState<ApprovalMatrixFormData>(initFromRule);
  const [newRole, setNewRole] = useState("");
  const [newEscRole, setNewEscRole] = useState("");
  const [newDelRole, setNewDelRole] = useState("");

  const update = <K extends keyof ApprovalMatrixFormData>(key: K, value: ApprovalMatrixFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Approval Rule" : "Create Approval Rule"}</DialogTitle>
          <DialogDescription>
            Define who can approve what based on roles, departments, and amount thresholds
          </DialogDescription>
        </DialogHeader>
        <EnterpriseForm
          onSubmit={() => onSave(form)}
          submitLabel={editRule ? "Update Rule" : "Create Rule"}
          submitIcon={<ShieldCheck className="h-4 w-4" />}
          cancelLabel="Cancel"
          onCancel={() => onOpenChange(false)}
        >
          <div className="grid grid-cols-2 gap-4">
            <EnterpriseField label="Rule Name" htmlFor="name" required>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g., Wire Transfer Approval"
                required
              />
            </EnterpriseField>
            <EnterpriseField label="Priority" htmlFor="priority" helpText="Higher priority rules are evaluated first">
              <div className="space-y-2">
                <input
                  id="priority"
                  type="range"
                  min={1} max={100}
                  value={form.priority}
                  onChange={(e) => update("priority", Number(e.target.value))}
                  className="w-full accent-[#d4af37]"
                />
                <span className="text-[11px] text-zinc-500">{form.priority}</span>
              </div>
            </EnterpriseField>
          </div>

          <EnterpriseField label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe this approval rule"
              rows={2}
            />
          </EnterpriseField>

          <div className="grid grid-cols-3 gap-4">
            <EnterpriseField label="Required Approvers" htmlFor="requiredApprovers">
              <Input
                id="requiredApprovers"
                type="number" min={1} max={10}
                value={form.requiredApprovers}
                onChange={(e) => update("requiredApprovers", Math.max(1, Number(e.target.value)))}
              />
            </EnterpriseField>
            <EnterpriseField label="Timeout (minutes)" htmlFor="timeoutMinutes" helpText="Auto-escalate pending approvals after timeout">
              <Input
                id="timeoutMinutes"
                type="number" min={1}
                value={form.timeoutMinutes}
                onChange={(e) => update("timeoutMinutes", Number(e.target.value))}
              />
            </EnterpriseField>
            <EnterpriseField label="Approval Mode" htmlFor="approvalMode">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update("approvalMode", "sequential")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    form.approvalMode === "sequential"
                      ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                      : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06]",
                  )}
                >
                  Sequential
                </button>
                <button
                  type="button"
                  onClick={() => update("approvalMode", "parallel")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    form.approvalMode === "parallel"
                      ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                      : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06]",
                  )}
                >
                  Parallel
                </button>
              </div>
            </EnterpriseField>
          </div>

          <EnterpriseField
            label="Approver Roles"
            htmlFor="approverRoles"
            helpText="Roles that can approve requests under this rule"
            hint="Type a role name and press Enter. Common roles are suggested as you type."
            hintType="best-practice"
          >
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.approverRoles.map((role) => (
                <span key={role} className="inline-flex items-center gap-1 rounded-md bg-[#d4af37]/10 px-2 py-0.5 text-[10px] text-[#d4af37]">
                  {role}
                  <button type="button" onClick={() => removeRole("approverRoles", role)} className="hover:text-red-400" aria-label="Remove role">
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
                  aria-label="Approver role name"
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
              <button
                type="button"
                onClick={() => addRole("approverRoles", newRole)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/5 px-3 py-1.5 text-[11px] font-medium text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors h-8 shrink-0"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </EnterpriseField>

          <EnterpriseSection
            config={{
              id: "conditions",
              title: "Approval Conditions",
              description: "Additional conditions that trigger this approval rule",
              collapsible: true,
              icon: <GitBranch className="h-4 w-4" />,
            }}
          >
            <ConditionEditor
              conditions={form.conditions.map((c) => ({ field: c.field, operator: c.operator, value: String(c.value) }))}
              onChange={(conds) => update("conditions", conds.map((c) => ({ field: c.field, operator: c.operator as ConditionOperator, value: c.value })))}
              compact
            />
          </EnterpriseSection>

          <EnterpriseSection
            config={{
              id: "threshold",
              title: "Threshold Configuration",
              description: "Monetary or value threshold that triggers this rule",
              collapsible: true,
              icon: <ArrowUpDown className="h-4 w-4" />,
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              <EnterpriseField label="Threshold Field" htmlFor="thresholdField" helpText="The field to evaluate (e.g., amount)">
                <Input
                  id="thresholdField"
                  value={form.thresholdField}
                  onChange={(e) => update("thresholdField", e.target.value)}
                  placeholder="e.g., amount"
                  className="h-8 text-xs"
                />
              </EnterpriseField>
              <EnterpriseField label="Operator" htmlFor="thresholdOperator">
                <div className="flex gap-1 flex-wrap">
                  {["eq","neq","gt","gte","lt","lte","contains"].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => update("thresholdOperator", op as ConditionOperator)}
                      className={cn(
                        "rounded px-2 py-1 text-[10px] font-mono transition-colors",
                        form.thresholdOperator === op
                          ? "bg-[#d4af37]/10 text-[#d4af37]"
                          : "bg-zinc-900/40 text-zinc-600 hover:text-zinc-300",
                      )}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </EnterpriseField>
              <EnterpriseField label="Threshold Value" htmlFor="thresholdValue">
                <Input
                  id="thresholdValue"
                  type="number"
                  value={form.thresholdValue}
                  onChange={(e) => update("thresholdValue", Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </EnterpriseField>
            </div>
          </EnterpriseSection>

          <EnterpriseField label="Department Scope" htmlFor="departmentScope" helpText="Leave empty to apply to all departments">
            <Input
              id="departmentScope"
              value={form.departmentScope}
              onChange={(e) => update("departmentScope", e.target.value)}
              placeholder="e.g., finance, treasury (leave empty for all)"
              className="h-8 text-xs"
            />
          </EnterpriseField>

          <div className="grid grid-cols-2 gap-4">
            <EnterpriseField label="Escalation" htmlFor="escalationEnabled" helpText="Escalate to higher roles on timeout">
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Escalation</span>
                  <Switch checked={form.escalationEnabled} onCheckedChange={(v) => update("escalationEnabled", v)} />
                </div>
                {form.escalationEnabled && (
                  <div className="space-y-2">
                    <Input
                      type="number" min={1}
                      value={form.escalationDelayMinutes}
                      onChange={(e) => update("escalationDelayMinutes", Number(e.target.value))}
                      placeholder="Delay (minutes)"
                      aria-label="Escalation delay in minutes"
                      className="h-7 text-xs"
                    />
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
                        aria-label="Escalation role name"
                        className="h-7 text-xs flex-1"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole("escalationRoles", newEscRole))}
                      />
                      <button
                        type="button"
                        onClick={() => addRole("escalationRoles", newEscRole)}
                        className="inline-flex items-center gap-1 rounded border border-white/[0.06] bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors h-7"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </EnterpriseField>

            <EnterpriseField label="Delegation" htmlFor="delegationEnabled" helpText="Allow approvers to delegate approval authority">
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Delegation</span>
                  <Switch checked={form.delegationEnabled} onCheckedChange={(v) => update("delegationEnabled", v)} />
                </div>
                {form.delegationEnabled && (
                  <div className="space-y-2">
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
                        aria-label="Delegation role name"
                        className="h-7 text-xs flex-1"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole("delegationRoles", newDelRole))}
                      />
                      <button
                        type="button"
                        onClick={() => addRole("delegationRoles", newDelRole)}
                        className="inline-flex items-center gap-1 rounded border border-white/[0.06] bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors h-7"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </EnterpriseField>
          </div>

          <EnterpriseField label="Active" htmlFor="isActive">
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Power className={cn("h-4 w-4", form.isActive ? "text-emerald-400" : "text-zinc-600")} />
                <div>
                  <p className="text-sm font-medium text-white">{form.isActive ? "Active" : "Inactive"}</p>
                  <p className="text-xs text-zinc-500">
                    {form.isActive ? "Rule is being evaluated" : "Rule is disabled"}
                  </p>
                </div>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => update("isActive", v)} />
            </div>
          </EnterpriseField>

          <EnterpriseSection
            config={{
              id: "preview",
              title: "Approval Path Preview",
              description: "Simulated approval flow based on current configuration",
              collapsible: true,
              icon: <Users className="h-4 w-4" />,
            }}
          >
            <ApprovalPreview
              steps={form.approverRoles.map((role, i) => ({
                role,
                status: i === 0 ? "pending" : "pending",
                delayMinutes: form.escalationEnabled && i < form.escalationRoles.length ? form.escalationDelayMinutes : undefined,
              }))}
              mode={form.approvalMode}
            />
          </EnterpriseSection>
        </EnterpriseForm>
      </DialogContent>
    </Dialog>
  );
}
