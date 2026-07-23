"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AutomationRuleList } from "@/components/orchestration/automation-rule-list";
import { AutomationRuleEditor } from "@/components/orchestration/automation-rule-editor";
import type { AutomationRuleData, AutomationAction } from "@/modules/orchestration";

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutomationRuleData[]>([]);
  const [editing, setEditing] = useState<AutomationRuleData | null>(null);
  const [showNew, setShowNew] = useState(false);

  const loadRules = () => {
    fetch("/api/v1/orchestration/automation-rules")
      .then((r) => r.json())
      .then((d) => setRules(d.items ?? []))
      .catch(() => {});
  };

  useEffect(() => { loadRules(); }, []);

  const saveRule = async (data: { name: string; description?: string; eventType: string; condition?: Record<string, unknown>; actions: AutomationAction[]; priority: number; cooldownSec?: number }) => {
    const res = await fetch("/api/v1/orchestration/automation-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { loadRules(); setShowNew(false); }
  };

  const updateRule = async (id: string, data: Partial<AutomationRuleData>) => {
    await fetch(`/api/v1/orchestration/automation-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    loadRules();
  };

  const deleteRule = async (id: string) => {
    await fetch(`/api/v1/orchestration/automation-rules/${id}`, { method: "DELETE" });
    loadRules();
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Automation Rules" description="Event-driven IF/THEN rules that trigger workflows and actions" />

      <div className="flex justify-end">
        <button onClick={() => setShowNew(!showNew)} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-500">
          {showNew ? "Cancel" : "+ New Rule"}
        </button>
      </div>

      {showNew && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <AutomationRuleEditor onSave={saveRule} onCancel={() => setShowNew(false)} />
        </div>
      )}

      {editing && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <AutomationRuleEditor
            initial={{ name: editing.name, description: editing.description, eventType: editing.eventType, priority: editing.priority, actions: editing.actions, cooldownSec: editing.cooldownSec }}
            onSave={(data) => { updateRule(editing.id, data); setEditing(null); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <AutomationRuleList
        rules={rules}
        onEdit={setEditing}
        onDelete={deleteRule}
        onToggle={(id, isActive) => updateRule(id, { isActive })}
      />
    </PageContainer>
  );
}
