"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { WorkflowCanvas } from "@/components/orchestration/workflow-canvas";
import { OrchestrationServiceSelector } from "@/components/orchestration/orchestration-service-selector";

export default function WorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string; steps: unknown[] }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/v1/orchestration/workflows").then((r) => r.json()).then((d) => setWorkflows(d.items ?? [])).catch(() => {});
  }, []);

  const selected = workflows.find((w) => w.id === selectedId);

  const createWorkflow = async () => {
    const res = await fetch("/api/v1/orchestration/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, steps: [] }),
    });
    if (res.ok) {
      const item = await res.json();
      setWorkflows([...workflows, { id: item.id, name: item.name, steps: item.steps ?? [] }]);
      setSelectedId(item.id);
      setShowNewForm(false);
      setNewName("");
    }
  };

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Workflow Builder"
        description="Design, configure, and manage financial workflows"
      />

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {workflows.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedId(w.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                selectedId === w.id
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                  : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-500"
        >
          + New Workflow
        </button>
      </div>

      {showNewForm && (
        <div className="flex gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <input
            className="flex-1 rounded-lg border border-white/[0.06] bg-zinc-800 px-3 py-2 text-sm text-white"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Workflow name"
          />
          <button onClick={createWorkflow} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500">Create</button>
        </div>
      )}

      {selected && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">{selected.name} — Steps</h3>
            <WorkflowCanvas steps={selected.steps as never[]} readOnly />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Add Step</h3>
            <OrchestrationServiceSelector onSelect={(service, action) => {
              void service; void action;
            }} />
          </div>
        </div>
      )}

      {!selected && !showNewForm && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 text-center">
          <p className="text-sm text-zinc-500">Select a workflow or create a new one to start building.</p>
        </div>
      )}
    </PageContainer>
  );
}
