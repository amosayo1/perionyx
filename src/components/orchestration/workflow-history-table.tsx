"use client";

import { useState } from "react";
import type { WorkflowExecutionData } from "@/modules/orchestration";

interface WorkflowHistoryTableProps {
  executions: WorkflowExecutionData[];
  onSelect?: (execution: WorkflowExecutionData) => void;
}

export function WorkflowHistoryTable({ executions, onSelect }: WorkflowHistoryTableProps) {
  const [sortBy, setSortBy] = useState<"createdAt" | "status" | "durationMs">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...executions].sort((a, b) => {
    const aVal = a[sortBy] ?? "";
    const bVal = b[sortBy] ?? "";
    const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortDir === "desc" ? -cmp : cmp;
  });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-white/[0.06] bg-zinc-900/60">
          <tr>
            <th className="cursor-pointer px-3 py-2 font-medium text-zinc-400 hover:text-white" onClick={() => toggleSort("createdAt")}>Date {sortBy === "createdAt" ? (sortDir === "desc" ? "↓" : "↑") : ""}</th>
            <th className="px-3 py-2 font-medium text-zinc-400">Workflow</th>
            <th className="cursor-pointer px-3 py-2 font-medium text-zinc-400 hover:text-white" onClick={() => toggleSort("status")}>Status {sortBy === "status" ? (sortDir === "desc" ? "↓" : "↑") : ""}</th>
            <th className="px-3 py-2 font-medium text-zinc-400">Trigger</th>
            <th className="cursor-pointer px-3 py-2 font-medium text-zinc-400 hover:text-white" onClick={() => toggleSort("durationMs")}>Duration {sortBy === "durationMs" ? (sortDir === "desc" ? "↓" : "↑") : ""}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((exec) => (
            <tr
              key={exec.id}
              className="cursor-pointer border-b border-white/[0.03] hover:bg-zinc-900/40"
              onClick={() => onSelect?.(exec)}
            >
              <td className="px-3 py-2 text-zinc-400">{new Date(exec.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2 font-medium text-white">{exec.workflowId.slice(0, 12)}...</td>
              <td className="px-3 py-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  exec.status === "completed" ? "bg-green-500/10 text-green-400" :
                  exec.status === "failed" ? "bg-red-500/10 text-red-400" :
                  exec.status === "running" ? "bg-blue-500/10 text-blue-400" :
                  "bg-zinc-500/10 text-zinc-400"
                }`}>{exec.status}</span>
              </td>
              <td className="px-3 py-2 text-zinc-500">{exec.trigger}</td>
              <td className="px-3 py-2 text-zinc-400">{exec.durationMs ? `${(exec.durationMs / 1000).toFixed(1)}s` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
