"use client";

import { useState } from "react";
import type { WorkflowLogData } from "@/modules/orchestration";

interface AuditTrailViewProps {
  logs: WorkflowLogData[];
}

export function AuditTrailView({ logs }: AuditTrailViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No audit trail entries.</p>
      ) : (
        logs.map((log) => (
          <div key={log.id}>
            <div
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2 hover:border-zinc-700"
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            >
              <span className={`h-2 w-2 rounded-full ${
                log.level === "error" ? "bg-red-400" : log.level === "warn" ? "bg-amber-400" : "bg-blue-400"
              }`} />
              <span className="flex-1 text-xs text-white">{log.message}</span>
              <span className="text-[10px] text-zinc-600">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            {expanded === log.id && log.metadata && (
              <pre className="ml-5 mt-1 rounded bg-zinc-950 p-2 text-[10px] text-zinc-500 overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}
          </div>
        ))
      )}
    </div>
  );
}
