"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, RefreshCw, Unlink, Link, AlertTriangle, CheckCircle2, XCircle, Clock, Terminal } from "lucide-react";
import { toast } from "sonner";
import type { ConnectorConfigRecord, ConnectorHealth } from "@/modules/connector-platform/types";
import type { ConnectorMetadata } from "@/modules/connector-platform/metadata";
import type { ConnectorRunSummary } from "@/modules/connectors";

const statusBadge: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20" },
  configuring: { label: "Configuring", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  error: { label: "Error", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  disabled: { label: "Disabled", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  expired: { label: "Expired", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

const healthDot: Record<string, string> = {
  GOOD: "bg-emerald-400",
  WARNING: "bg-amber-500",
  CRITICAL: "bg-red-500",
  UNKNOWN: "bg-zinc-500",
};

export function ConnectorDetailClient({
  config,
  provider,
  runs,
  events,
  health,
}: {
  config: ConnectorConfigRecord;
  provider?: ConnectorMetadata;
  runs: ConnectorRunSummary[];
  events: any[];
  health: any;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const badge = statusBadge[config.status] ?? statusBadge.configuring;

  const handleAction = async (action: string) => {
    try {
      const res = await fetch(`/api/v1/integrations/connectors/${config.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Action failed" }));
        toast.error(err.error ?? `Failed to ${action}`);
        return;
      }
      toast.success(`Connector ${action}d successfully`);
      router.refresh();
    } catch {
      toast.error(`Failed to ${action}`);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/v1/integrations/connectors/${config.id}/sync`, { method: "POST" });
      if (!res.ok) {
        toast.error("Sync failed");
        return;
      }
      const result = await res.json();
      toast.success(`Sync complete: ${result.recordsProcessed} records`);
      router.refresh();
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/v1/integrations/connectors/${config.id}/health`, { method: "POST" });
      const healthResult = await res.json();
      toast.success(`Health: ${healthResult.status}${healthResult.latencyMs ? ` (${healthResult.latencyMs}ms)` : ""}`);
      router.refresh();
    } catch {
      toast.error("Health check failed");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/integrations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{config.name}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{provider?.description ?? config.kind}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {config.active ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleAction("disconnect")}>
              <Unlink className="h-3.5 w-3.5" /> Disconnect
            </Button>
          ) : (
            <Button variant="default" size="sm" className="gap-1.5 text-xs" onClick={() => handleAction("connect")}>
              <Link className="h-3.5 w-3.5" /> Connect
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleHealthCheck} disabled={checking}>
            <Activity className={`h-3.5 w-3.5 ${checking ? "animate-pulse" : ""}`} /> Health
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Status</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`h-2 w-2 rounded-full ${healthDot[config.healthStatus as string] ?? "bg-zinc-500"}`} />
            <span className="text-sm font-medium text-white">{config.healthStatus ?? "UNKNOWN"}</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Type</p>
          <p className="text-sm font-medium text-white mt-1 capitalize">{config.kind}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Last Health Check</p>
          <p className="text-sm font-medium text-white mt-1">{config.lastHealthCheckAt ? new Date(config.lastHealthCheckAt).toLocaleString() : "Never"}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Last Sync</p>
          <p className="text-sm font-medium text-white mt-1">{config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : "Never"}</p>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Total Runs</p>
          <p className="text-2xl font-semibold text-white mt-1">{health.recentRuns ?? runs.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Failed (24h)</p>
          <p className="text-2xl font-semibold mt-1">{health.failedRuns24h ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-[11px] text-zinc-500">Success Rate (24h)</p>
          <p className="text-2xl font-semibold text-white mt-1">{health.successRate ?? 100}%</p>
        </div>
      </div>

      {/* Error Message */}
      {config.errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{config.errorMessage}</p>
        </div>
      )}

      {/* Runs History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Run History</h2>
            <p className="text-xs text-zinc-500">Recent synchronization and operation runs</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowEvents(!showEvents)}>
            <Terminal className="h-3.5 w-3.5" /> {showEvents ? "Hide Events" : "Show Events"}
          </Button>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04]">
          {runs.length === 0 ? (
            <p className="p-4 text-xs text-zinc-600">No runs yet. Connect and sync to see activity.</p>
          ) : (
            runs.slice(0, 10).map((run) => (
              <div key={run.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {run.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />
                  ) : run.status === "FAILED" ? (
                    <XCircle className="h-4 w-4 text-red-400" />
                  ) : run.status === "RUNNING" ? (
                    <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 text-zinc-500" />
                  )}
                  <span className="text-xs text-zinc-300">{run.event}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium ${run.status === "COMPLETED" ? "text-[#d4af37]" : run.status === "FAILED" ? "text-red-400" : run.status === "RUNNING" ? "text-amber-400" : "text-zinc-500"}`}>
                    {run.status}
                  </span>
                  <span className="text-[10px] text-zinc-700">
                    {run.createdAt ? new Date(run.createdAt).toLocaleString() : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Events */}
      {showEvents && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Events</h2>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04] max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="p-4 text-xs text-zinc-600">No events recorded.</p>
            ) : (
              events.map((event: any) => (
                <div key={event.id} className="flex items-start gap-2 px-4 py-2">
                  <span className={`text-[10px] font-medium uppercase ${event.type === "ERROR" ? "text-red-400" : event.type === "WARNING" ? "text-amber-400" : "text-zinc-500"}`}>
                    {event.type}
                  </span>
                  <p className="text-xs text-zinc-400 flex-1">{event.message}</p>
                  <span className="text-[10px] text-zinc-700 shrink-0">
                    {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Capabilities */}
      {provider && provider.capabilities.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {provider.capabilities.map((cap) => (
              <span key={cap} className="rounded-full border border-white/[0.06] bg-zinc-800/60 px-2.5 py-1 text-[11px] text-zinc-400">
                {cap.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
