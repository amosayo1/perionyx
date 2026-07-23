"use client";

import { cn } from "@/lib/utils";
import { memo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { ConnectionHealthCard } from "./connection-health-card";
import { ConnectionHistory } from "./connection-history";
import { ConnectionStatusBadge } from "./connection-status-badge";
import { getMockConnectionHealth, getMockConnectionHistory } from "./data";
import type { ConnectionHealthData } from "./types";

interface ConnectionDashboardProps {
  connections?: ConnectionHealthData[];
  className?: string;
}

export const ConnectionDashboard = memo(function ConnectionDashboard({
  connections,
  className,
}: ConnectionDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const items = connections ?? [getMockConnectionHealth()];

  const healthy = items.filter((c) => c.status === "connected").length;
  const degraded = items.filter((c) => c.status === "degraded").length;
  const errors = items.filter((c) => c.status === "error").length;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white/[0.87]">Connected Banks</h2>
          <p className="text-sm text-white/[0.5]">Manage your banking connections and view health status.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Connect Bank
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
          <p className="text-2xl font-semibold text-white/[0.87]">{items.length}</p>
          <p className="text-xs text-white/[0.4] mt-1">Total</p>
        </div>
        <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3 text-center">
          <p className="text-2xl font-semibold text-emerald-400">{healthy}</p>
          <p className="text-xs text-emerald-400/60 mt-1">Healthy</p>
        </div>
        <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-center">
          <p className="text-2xl font-semibold text-amber-400">{degraded}</p>
          <p className="text-xs text-amber-400/60 mt-1">Degraded</p>
        </div>
        <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3 text-center">
          <p className="text-2xl font-semibold text-red-400">{errors}</p>
          <p className="text-xs text-red-400/60 mt-1">Errors</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm transition-colors",
            activeTab === "overview" ? "bg-white/[0.08] text-white/[0.87]" : "text-white/[0.4] hover:text-white/[0.7]",
          )}
          aria-pressed={activeTab === "overview"}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm transition-colors",
            activeTab === "history" ? "bg-white/[0.08] text-white/[0.87]" : "text-white/[0.4] hover:text-white/[0.7]",
          )}
          aria-pressed={activeTab === "history"}
        >
          History
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((conn) => (
            <ConnectionHealthCard key={conn.id} data={conn} />
          ))}
        </div>
      ) : (
        <ConnectionHistory entries={getMockConnectionHistory()} />
      )}
    </div>
  );
});
