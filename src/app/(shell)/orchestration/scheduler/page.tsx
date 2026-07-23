"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { SchedulerConfig } from "@/components/orchestration/scheduler-config";
import type { WorkflowScheduleData } from "@/modules/orchestration";

export default function SchedulerPage() {
  const [schedules, setSchedules] = useState<WorkflowScheduleData[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [workflowId, setWorkflowId] = useState("");

  const load = () => {
    fetch("/api/v1/orchestration/schedules")
      .then((r) => r.json())
      .then((d) => setSchedules(d.items ?? []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const saveSchedule = async (data: { workflowId: string; cron: string; timezone?: string }) => {
    const res = await fetch("/api/v1/orchestration/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { load(); setShowNew(false); }
  };

  const deleteSchedule = async (id: string) => {
    await fetch(`/api/v1/orchestration/schedules/${id}`, { method: "DELETE" });
    load();
  };

  const toggleSchedule = async (id: string, isActive: boolean) => {
    await fetch(`/api/v1/orchestration/schedules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    load();
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Workflow Scheduler" description="Schedule workflows with cron expressions" />

      <div className="flex justify-end">
        <button onClick={() => setShowNew(!showNew)} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-500">
          {showNew ? "Cancel" : "+ New Schedule"}
        </button>
      </div>

      {showNew && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="mb-3">
            <label className="text-xs font-medium text-zinc-400">Workflow ID</label>
            <input className="mt-1 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-white" value={workflowId} onChange={(e) => setWorkflowId(e.target.value)} placeholder="Workflow ID" />
          </div>
          <SchedulerConfig workflowId={workflowId} onSave={(data) => { saveSchedule(data).catch(() => {}); }} onCancel={() => setShowNew(false)} />
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 text-center">
          <p className="text-sm text-zinc-500">No schedules configured.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.isActive ? "bg-green-400" : "bg-zinc-600"}`} />
                  <span className="text-xs font-mono text-amber-400">{s.cron}</span>
                  <span className="text-[10px] text-zinc-500">{s.timezone}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-zinc-600">Workflow: {s.workflowId.slice(0, 12)}...</p>
                {s.nextRunAt && <p className="text-[10px] text-zinc-600">Next: {new Date(s.nextRunAt).toLocaleString()}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleSchedule(s.id, !s.isActive)} className={`text-xs ${s.isActive ? "text-green-400" : "text-zinc-500"}`}>{s.isActive ? "Active" : "Inactive"}</button>
                <button onClick={() => deleteSchedule(s.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
