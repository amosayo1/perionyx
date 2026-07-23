"use client";

import { useState } from "react";
import type { WorkflowLogData } from "@/modules/orchestration";

interface EventLogViewerProps {
  logs: WorkflowLogData[];
}

export function EventLogViewer({ logs }: EventLogViewerProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {["all", "info", "warn", "error", "debug"].map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`rounded px-2 py-1 text-xs font-medium ${
              filter === l ? "bg-amber-400/10 text-amber-400" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No logs match the filter.</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2">
              <span className={`mt-0.5 text-xs font-medium ${
                log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-amber-400" : log.level === "debug" ? "text-zinc-500" : "text-blue-400"
              }`}>
                {log.level.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-xs text-white">{log.message}</p>
                <div className="mt-0.5 flex gap-2 text-[10px] text-zinc-600">
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                  {log.workflowId && <span>Wf: {log.workflowId.slice(0, 8)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
