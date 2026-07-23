"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw, Activity, Clock } from "lucide-react";
import { fadeInUp } from "@/components/enterprise/motion/tokens";
import type { IntegrationInstanceData, SyncHistoryData } from "./types";

interface DashboardProps {
  instances: IntegrationInstanceData[];
  health: { total: number; healthy: number; degraded: number; unhealthy: number; unknown: number };
  syncHistory: SyncHistoryData[];
}

export function IntegrationDashboard({ instances, health, syncHistory }: DashboardProps) {
  const todaySyncs = syncHistory.filter(s => s.startedAt.startsWith(new Date().toISOString().slice(0, 10))).length;
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Connections" value={health.total.toString()} />
        <KpiCard label="Healthy" value={health.healthy.toString()} accent />
        <KpiCard label="Syncs Today" value={todaySyncs.toString()} />
        <KpiCard label="Unhealthy" value={health.unhealthy.toString()} warn={health.unhealthy > 0} />
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Health Summary</h3>
        <div className="flex h-3 gap-0.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 transition-all" style={{ flex: health.healthy }} />
          <div className="bg-amber-500 transition-all" style={{ flex: Math.max(health.degraded, 0.1) }} />
          <div className="bg-red-500 transition-all" style={{ flex: Math.max(health.unhealthy, 0.1) }} />
          <div className="bg-zinc-600 transition-all" style={{ flex: Math.max(health.unknown, 0.1) }} />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-zinc-500">
          <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1" /> {health.healthy} healthy</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1" /> {health.degraded} degraded</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1" /> {health.unhealthy} unhealthy</span>
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Recent Syncs</h3>
        {syncHistory.length === 0 ? (
          <p className="text-sm text-zinc-500">No syncs yet</p>
        ) : (
          <div className="space-y-2">
            {syncHistory.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{new Date(s.startedAt).toLocaleString()}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs", s.status === "completed" ? "bg-emerald-400/10 text-emerald-400" : s.status === "failed" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400")}>{s.status}</span>
                <span className="text-zinc-500">{s.inserted + s.updated} records</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function KpiCard({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", warn ? "border-red-400/20 bg-red-400/5" : "border-white/[0.06] bg-zinc-900/40")}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", accent ? "text-amber-400" : warn ? "text-red-400" : "text-white")}>{value}</p>
    </div>
  );
}
