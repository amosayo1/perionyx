"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { WorkflowHistoryTable } from "@/components/orchestration/workflow-history-table";
import { ExecutionDetailPanel } from "@/components/orchestration/execution-detail-panel";
import type { WorkflowExecutionData } from "@/modules/orchestration";

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<WorkflowExecutionData[]>([]);
  const [selected, setSelected] = useState<WorkflowExecutionData | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/v1/orchestration/executions${params}`)
      .then((r) => r.json())
      .then((d) => setExecutions(d.items ?? []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [statusFilter]);

  const retryExecution = async (id: string) => {
    const res = await fetch(`/api/v1/orchestration/executions/${id}`, { method: "POST" });
    if (res.ok) { load(); setSelected(null); }
  };

  const cancelExecution = async (id: string) => {
    await fetch(`/api/v1/orchestration/executions/${id}`, { method: "DELETE" });
    load();
    setSelected(null);
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Execution History" description="Track and manage workflow executions" />

      <div className="flex gap-2">
        {["", "running", "completed", "failed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              statusFilter === s
                ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WorkflowHistoryTable executions={executions} onSelect={setSelected} />
        </div>
        {selected && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Execution Detail</h3>
            <ExecutionDetailPanel execution={selected} onRetry={retryExecution} onCancel={cancelExecution} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
