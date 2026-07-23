"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Database,
  Server, HardDrive, Wifi, Layers, Activity,
} from "lucide-react";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { staggerContainer, fadeInUp, scaleIn } from "@/components/enterprise/motion/tokens";
import type {
  HealthValidationResult, InstallStatus, DeploymentEnvironment,
} from "@/server/installer";

interface DeploymentDashboardProps {
  health: HealthValidationResult;
  status: InstallStatus;
  metrics: {
    totalInstallations: number;
    successfulInstallations: number;
    failedInstallations: number;
  };
  envResult: {
    valid: boolean;
    errors: { field: string; message: string; severity: string }[];
    result: {
      nodeVersion: boolean;
      nodeVersionValue: string;
      memory: boolean;
      memoryValue: string;
      disk: boolean;
      diskValue: string;
      platform: boolean;
      platformValue: string;
      cpuCores: number;
    };
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
  "not-checked": "Not Checked",
};

const STATUS_COLORS: Record<string, string> = {
  healthy: "#22c55e",
  degraded: "#d4a843",
  unhealthy: "#ef4444",
  "not-checked": "#71717a",
};

const STATUS_BG: Record<string, string> = {
  healthy: "rgba(34,197,94,0.08)",
  degraded: "rgba(212,168,67,0.08)",
  unhealthy: "rgba(239,68,68,0.08)",
  "not-checked": "rgba(113,113,122,0.08)",
};

const INSTALL_LABELS: Record<string, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  "rolled-back": "Rolled Back",
};

const INSTALL_COLORS: Record<string, string> = {
  pending: "#71717a",
  running: "#d4a843",
  completed: "#22c55e",
  failed: "#ef4444",
  "rolled-back": "#f97316",
};

const ENV_LABELS: Record<string, string> = {
  development: "Development",
  testing: "Testing",
  staging: "Staging",
  production: "Production",
  offline: "Offline",
};

type HealthKeys = "database" | "redis" | "queues" | "storage" | "cache" | "backgroundWorkers";

const COMPONENTS: { key: HealthKeys; label: string; icon: typeof Database }[] = [
  { key: "database", label: "Database", icon: Database },
  { key: "redis", label: "Redis", icon: Server },
  { key: "queues", label: "Queues", icon: Layers },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "cache", label: "Cache", icon: Wifi },
  { key: "backgroundWorkers", label: "Background Workers", icon: Activity },
];

function StatusPulse({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS["not-checked"];
  return (
    <span className="relative inline-flex items-center justify-center w-3 h-3">
      {status === "healthy" && (
        <span className="absolute inline-flex w-full h-full rounded-full opacity-30 animate-ping" style={{ backgroundColor: color }} />
      )}
      <span className="relative inline-flex w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

export function DeploymentDashboard({
  health, status, metrics, envResult,
}: DeploymentDashboardProps) {
  const details = health.details ?? {};
  const detailEntries = Object.entries(details);

  return (
    <PageContainer size="full">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <EnterprisePageHeader
          title="Deployment"
          description="Platform deployment status and health monitoring"
        />

        {/* Environment & Version Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Environment</p>
            <p className="text-lg font-bold text-white">
              {envResult?.result?.platformValue ?? "Unknown"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusPulse status={status === "completed" ? "healthy" : status === "failed" ? "unhealthy" : "degraded"} />
              <span
                className="text-xs font-medium"
                style={{ color: INSTALL_COLORS[status] ?? STATUS_COLORS["not-checked"] }}
              >
                {INSTALL_LABELS[status] ?? status}
              </span>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Version</p>
            <p className="text-lg font-bold text-white font-mono">
              {process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"}
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">Build {process.env.NEXT_PUBLIC_BUILD ?? "latest"}</p>
          </AnimatedCard>

          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Last Deployment</p>
            <p className="text-lg font-bold text-white font-mono">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Deployments</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">{metrics.totalInstallations}</span>
              <span className="text-xs text-green-400">+{metrics.successfulInstallations} ok</span>
              {metrics.failedInstallations > 0 && (
                <span className="text-xs text-red-400">{metrics.failedInstallations} failed</span>
              )}
            </div>
          </AnimatedCard>
        </div>

        {/* Component Health */}
        <AnimatedCard className="p-5">
          <motion.div variants={fadeInUp} className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-[#d4a843]" />
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Component Health</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMPONENTS.map(({ key, label, icon: Icon }) => {
                const compStatus = health[key] ?? "not-checked";
                return (
                  <motion.div
                    key={key}
                    variants={scaleIn}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                      <Icon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300">{label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusPulse status={compStatus} />
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: STATUS_COLORS[compStatus] ?? STATUS_COLORS["not-checked"] }}
                        >
                          {STATUS_LABELS[compStatus] ?? compStatus}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatedCard>

        {/* Database & Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard className="p-5">
            <motion.div variants={fadeInUp} className="space-y-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#d4a843]" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Database</h2>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Migration Status</span>
                  <span className="text-green-400 font-mono">Current</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Database Version</span>
                  <span className="text-zinc-300 font-mono">{process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Status</span>
                  <div className="flex items-center gap-1.5">
                    <StatusPulse status={health.database} />
                    <span style={{ color: STATUS_COLORS[health.database] ?? STATUS_COLORS["not-checked"] }}>
                      {STATUS_LABELS[health.database] ?? health.database}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <motion.div variants={fadeInUp} className="space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-[#d4a843]" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Storage</h2>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Usage</span>
                  <span className="text-zinc-300 font-mono">{envResult?.result?.diskValue ?? "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Memory</span>
                  <span className="text-zinc-300 font-mono">{envResult?.result?.memoryValue ?? "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">CPU Cores</span>
                  <span className="text-zinc-300 font-mono">{envResult?.result?.cpuCores ?? "—"}</span>
                </div>
              </div>
            </motion.div>
          </AnimatedCard>
        </div>

        {/* Cache & Queue & Workers Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="p-5">
            <motion.div variants={fadeInUp} className="space-y-3">
              <div className="flex items-center gap-2">
                <Wifi size={16} className="text-[#d4a843]" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Cache</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusPulse status={health.cache} />
                <span className="text-xs" style={{ color: STATUS_COLORS[health.cache] ?? STATUS_COLORS["not-checked"] }}>
                  {STATUS_LABELS[health.cache] ?? health.cache}
                </span>
              </div>
            </motion.div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <motion.div variants={fadeInUp} className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#d4a843]" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Queues</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusPulse status={health.queues} />
                <span className="text-xs" style={{ color: STATUS_COLORS[health.queues] ?? STATUS_COLORS["not-checked"] }}>
                  {STATUS_LABELS[health.queues] ?? health.queues}
                </span>
              </div>
            </motion.div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <motion.div variants={fadeInUp} className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#d4a843]" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Workers</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusPulse status={health.backgroundWorkers} />
                <span className="text-xs" style={{ color: STATUS_COLORS[health.backgroundWorkers] ?? STATUS_COLORS["not-checked"] }}>
                  {STATUS_LABELS[health.backgroundWorkers] ?? health.backgroundWorkers}
                </span>
              </div>
            </motion.div>
          </AnimatedCard>
        </div>

        {/* Health Details */}
        {detailEntries.length > 0 && (
          <AnimatedCard className="p-5">
            <motion.div variants={fadeInUp} className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#d4a843]" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Health Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/[0.06]">
                      <th className="text-left py-2 pr-4">Component</th>
                      <th className="text-right py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailEntries.map(([name, value]) => (
                      <motion.tr
                        key={name}
                        variants={fadeInUp}
                        className="border-b border-white/[0.03]"
                      >
                        <td className="py-2 pr-4">
                          <span className="text-zinc-300 font-medium capitalize">{name.replace(/-/g, " ")}</span>
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-zinc-400">{value}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatedCard>
        )}
      </motion.div>
    </PageContainer>
  );
}
