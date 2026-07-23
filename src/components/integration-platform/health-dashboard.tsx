"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, HeartPulse, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface HealthInstance {
  id: string;
  name: string;
  connectorDefId: string;
  connectorDef?: { name: string } | null;
  healthStatus: string;
  lastSyncAt: string | null;
  lastHealthCheckAt: string | null;
  error: string | null;
  status: string;
}

interface HealthRecord {
  id: string;
  instanceId: string;
  status: string;
  responseTimeMs: number | null;
  error: string | null;
  diagnostics: unknown;
  checkedAt: string;
}

interface HealthDashboardProps {
  instances: HealthInstance[];
  healthRecords: HealthRecord[];
}

export function HealthDashboard({ instances, healthRecords }: HealthDashboardProps) {
  const stats = useMemo(() => ({
    healthy: instances.filter(i => i.healthStatus === "healthy").length,
    degraded: instances.filter(i => i.healthStatus === "degraded").length,
    unhealthy: instances.filter(i => i.healthStatus === "unhealthy" || i.healthStatus === "error").length,
    unknown: instances.filter(i => !i.healthStatus || i.healthStatus === "unknown").length,
  }), [instances]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Healthy" value={stats.healthy} accent />
        <KpiCard label="Degraded" value={stats.degraded} warn={stats.degraded > 0} />
        <KpiCard label="Unhealthy" value={stats.unhealthy} critical={stats.unhealthy > 0} />
        <KpiCard label="Unknown" value={stats.unknown} />
      </div>
      <div className="flex h-3 gap-0.5 rounded-full overflow-hidden">
        <div className="bg-emerald-500 transition-all" style={{ flex: Math.max(stats.healthy, 0.5) }} title={`${stats.healthy} healthy`} />
        <div className="bg-amber-500 transition-all" style={{ flex: Math.max(stats.degraded, 0.5) }} title={`${stats.degraded} degraded`} />
        <div className="bg-red-500 transition-all" style={{ flex: Math.max(stats.unhealthy, 0.5) }} title={`${stats.unhealthy} unhealthy`} />
        <div className="bg-zinc-600 transition-all" style={{ flex: Math.max(stats.unknown, 0.5) }} title={`${stats.unknown} unknown`} />
      </div>
      <div className="space-y-2">
        {instances.map((i, idx) => {
          const recents = healthRecords.filter(r => r.instanceId === i.id).slice(0, 5);
          return (
            <motion.div key={i.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-3 w-3 rounded-full", i.healthStatus === "healthy" ? "bg-emerald-500" : i.healthStatus === "degraded" ? "bg-amber-500" : i.healthStatus === "unhealthy" || i.healthStatus === "error" ? "bg-red-500" : "bg-zinc-600")} />
                  <div>
                    <p className="text-sm font-medium text-white">{i.name}</p>
                    <p className="text-xs text-zinc-500">{i.connectorDef?.name ?? i.connectorDefId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {i.lastHealthCheckAt ? new Date(i.lastHealthCheckAt).toLocaleDateString() : "Never"}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px]", i.healthStatus === "healthy" ? "bg-emerald-400/10 text-emerald-400" : i.healthStatus === "degraded" ? "bg-amber-400/10 text-amber-400" : i.healthStatus === "unhealthy" || i.healthStatus === "error" ? "bg-red-400/10 text-red-400" : "bg-zinc-800 text-zinc-400")}>{i.healthStatus}</span>
                </div>
              </div>
              {recents.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {recents.map(r => (
                    <div key={r.id} className={cn("h-1.5 flex-1 rounded-full", r.status === "healthy" ? "bg-emerald-500/60" : r.status === "degraded" ? "bg-amber-500/60" : r.status === "unhealthy" || r.status === "error" ? "bg-red-500/60" : "bg-zinc-700")} title={`${r.status} at ${new Date(r.checkedAt).toLocaleString()}`} />
                  ))}
                </div>
              )}
              {i.error && <p role="alert" className="mt-2 text-xs text-red-400">{i.error}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent, warn, critical }: { label: string; value: number; accent?: boolean; warn?: boolean; critical?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", critical ? "border-red-400/20 bg-red-400/5" : warn ? "border-amber-400/20 bg-amber-400/5" : "border-white/[0.06] bg-zinc-900/40")}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", accent ? "text-emerald-400" : critical ? "text-red-400" : warn ? "text-amber-400" : "text-white")}>{value}</p>
    </div>
  );
}
