"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Clock, Database, Server, Cpu, Zap } from "lucide-react";
import { PageContainer } from "@/components/enterprise/page-container";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { staggerContainer, fadeInUp } from "@/components/enterprise/motion/tokens";

type ModuleStatus = "healthy" | "degraded" | "down";

interface ModuleHealth {
  name: string;
  status: ModuleStatus;
  uptime: number;
  requests: number;
  errors: number;
  latency: number;
}

const MODULES: ModuleHealth[] = [
  { name: "Accounting", status: "healthy", uptime: 99.98, requests: 18420, errors: 3, latency: 42 },
  { name: "Accounts Receivable", status: "healthy", uptime: 99.97, requests: 12450, errors: 5, latency: 38 },
  { name: "Consolidation", status: "healthy", uptime: 99.95, requests: 5840, errors: 2, latency: 65 },
  { name: "Financial Close", status: "healthy", uptime: 99.99, requests: 3120, errors: 1, latency: 28 },
  { name: "Fixed Assets", status: "healthy", uptime: 99.96, requests: 8920, errors: 4, latency: 35 },
  { name: "FP&A Planning", status: "healthy", uptime: 99.93, requests: 7460, errors: 6, latency: 58 },
  { name: "General Ledger", status: "healthy", uptime: 99.99, requests: 28940, errors: 2, latency: 31 },
  { name: "Investments", status: "healthy", uptime: 99.94, requests: 4630, errors: 3, latency: 52 },
  { name: "Order-to-Cash", status: "healthy", uptime: 99.97, requests: 15320, errors: 4, latency: 44 },
  { name: "Procurement", status: "healthy", uptime: 99.96, requests: 10280, errors: 5, latency: 39 },
  { name: "Tax", status: "healthy", uptime: 99.98, requests: 6890, errors: 1, latency: 36 },
  { name: "Treasury", status: "healthy", uptime: 99.99, requests: 21460, errors: 2, latency: 33 },
  { name: "Executive AI", status: "healthy", uptime: 99.87, requests: 12840, errors: 8, latency: 210 },
  { name: "Infrastructure", status: "healthy", uptime: 99.99, requests: 98700, errors: 1, latency: 8 },
  { name: "Persistence", status: "healthy", uptime: 99.98, requests: 45620, errors: 3, latency: 15 },
  { name: "Queues", status: "healthy", uptime: 99.97, requests: 31240, errors: 4, latency: 22 },
  { name: "Cache", status: "healthy", uptime: 99.99, requests: 89450, errors: 0, latency: 3 },
];

const CATEGORIES = [
  { label: "Finance", modules: ["Accounting", "Accounts Receivable", "Consolidation", "Financial Close", "Fixed Assets", "FP&A Planning", "General Ledger", "Investments", "Order-to-Cash", "Procurement", "Tax", "Treasury"] },
  { label: "Platform", modules: ["Executive AI", "Infrastructure", "Persistence", "Queues", "Cache"] },
] as const;

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: "#22c55e", label: "Healthy", bg: "rgba(34,197,94,0.08)" },
  degraded: { icon: AlertTriangle, color: "#d4a843", label: "Degraded", bg: "rgba(212,168,67,0.08)" },
  down: { icon: XCircle, color: "#ef4444", label: "Down", bg: "rgba(239,68,68,0.08)" },
} as const;

function StatusPulse({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="relative inline-flex items-center justify-center w-3 h-3">
      <span
        className="absolute inline-flex w-full h-full rounded-full opacity-30 animate-ping"
        style={{ backgroundColor: cfg.color }}
      />
      <span
        className="relative inline-flex w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
    </span>
  );
}

export function StatusDashboard() {
  const totalModules = MODULES.length;
  const healthyCount = MODULES.filter((m) => m.status === "healthy").length;
  const degradedCount = MODULES.filter((m) => m.status === "degraded").length;
  const downCount = MODULES.filter((m) => m.status === "down").length;
  const totalRequests = MODULES.reduce((s, m) => s + m.requests, 0);
  const totalErrors = MODULES.reduce((s, m) => s + m.errors, 0);

  return (
    <PageContainer size="full">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Modules</p>
            <p className="text-2xl font-bold text-white">{totalModules}</p>
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Healthy</p>
            <p className="text-2xl font-bold text-green-400">{healthyCount}</p>
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Degraded</p>
            <p className="text-2xl font-bold text-[#d4a843]">{degradedCount}</p>
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Down</p>
            <p className="text-2xl font-bold text-red-400">{downCount}</p>
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">{totalErrors} errors ({(totalErrors / totalRequests * 100).toFixed(3)}%)</p>
          </AnimatedCard>
        </div>

        {/* Category Groups */}
        {CATEGORIES.map((cat) => (
          <AnimatedCard key={cat.label} className="p-5">
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#d4a843]">
                  {cat.label === "Finance" ? <Database size={16} /> : <Server size={16} />}
                </span>
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">{cat.label}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/[0.06]">
                      <th className="text-left py-2 pr-4">Module</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Uptime</th>
                      <th className="text-right py-2 px-4">Requests</th>
                      <th className="text-right py-2 px-4">Errors</th>
                      <th className="text-right py-2 px-4">Avg Latency</th>
                      <th className="py-2 pl-4 w-1/4">Latency Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.modules.map((name) => {
                      const mod = MODULES.find((m) => m.name === name)!;
                      const cfg = STATUS_CONFIG[mod.status];
                      const latencyPct = Math.min((mod.latency / 210) * 100, 100);
                      const errorRatePct = mod.requests > 0 ? (mod.errors / mod.requests) * 100 : 0;
                      return (
                        <motion.tr
                          key={mod.name}
                          variants={fadeInUp}
                          className="border-b border-white/[0.03]"
                        >
                          <td className="py-3 pr-4">
                            <span className="text-zinc-200 font-medium">{mod.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <StatusPulse status={mod.status} />
                              <span className="text-zinc-400">{cfg.label}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-300 font-mono">{mod.uptime}%</td>
                          <td className="py-3 px-4 text-right text-zinc-300 font-mono">{mod.requests.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={mod.errors > 5 ? "text-red-400 font-mono" : "text-zinc-400 font-mono"}>
                              {mod.errors}
                            </span>
                            <span className="text-zinc-600 ml-1">({errorRatePct.toFixed(2)}%)</span>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-300 font-mono">{mod.latency} ms</td>
                          <td className="py-3 pl-4">
                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${latencyPct}%` }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-full"
                                style={{
                                  background: mod.latency > 150
                                    ? `linear-gradient(90deg, #ef4444, #ef444488)`
                                    : mod.latency > 60
                                      ? `linear-gradient(90deg, #d4a843, #d4a84388)`
                                      : `linear-gradient(90deg, #22c55e, #22c55e88)`,
                                }}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatedCard>
        ))}

        {/* Overall System Health Gauge */}
        <AnimatedCard className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={16} className="text-[#d4a843]" />
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">System Health Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="66" fill="none" stroke="#27272a" strokeWidth="10" />
                <motion.circle
                  cx="80" cy="80" r="66"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(healthyCount / totalModules) * 415} 415`}
                  initial={{ strokeDasharray: "0 415" }}
                  animate={{ strokeDasharray: `${(healthyCount / totalModules) * 415} 415` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  transform="rotate(-90 80 80)"
                />
                {degradedCount > 0 && (
                  <motion.circle
                    cx="80" cy="80" r="66"
                    fill="none"
                    stroke="#d4a843"
                    strokeWidth="10"
                    strokeDasharray={`${(degradedCount / totalModules) * 415} 415`}
                    strokeDashoffset={-((healthyCount / totalModules) * 415)}
                    initial={{ strokeDasharray: "0 415" }}
                    animate={{
                      strokeDasharray: `${(degradedCount / totalModules) * 415} 415`,
                      strokeDashoffset: -((healthyCount / totalModules) * 415),
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    transform="rotate(-90 80 80)"
                  />
                )}
                {downCount > 0 && (
                  <motion.circle
                    cx="80" cy="80" r="66"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeDasharray={`${(downCount / totalModules) * 415} 415`}
                    strokeDashoffset={-(((healthyCount + degradedCount) / totalModules) * 415)}
                    initial={{ strokeDasharray: "0 415" }}
                    animate={{
                      strokeDasharray: `${(downCount / totalModules) * 415} 415`,
                      strokeDashoffset: -(((healthyCount + degradedCount) / totalModules) * 415),
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    transform="rotate(-90 80 80)"
                  />
                )}
                <motion.text
                  x="80" y="74"
                  textAnchor="middle"
                  fill="white"
                  fontSize="32"
                  fontWeight="bold"
                  fontFamily="monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {((healthyCount / totalModules) * 100).toFixed(0)}%
                </motion.text>
                <motion.text
                  x="80" y="94"
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="11"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  uptime
                </motion.text>
              </svg>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-zinc-300">Healthy — {healthyCount} modules</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#d4a843]" />
                <span className="text-sm text-zinc-300">Degraded — {degradedCount} modules</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-sm text-zinc-300">Down — {downCount} modules</span>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Requests</span>
                <span className="text-zinc-200 font-mono">{totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Errors</span>
                <span className="text-red-400 font-mono">{totalErrors}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Error Rate</span>
                <span className="text-zinc-200 font-mono">{(totalErrors / totalRequests * 100).toFixed(3)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Avg Latency (all)</span>
                <span className="text-zinc-200 font-mono">
                  {(MODULES.reduce((s, m) => s + m.latency, 0) / MODULES.length).toFixed(0)} ms
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Overall Uptime</span>
                <span className="text-green-400 font-mono">99.97%</span>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>
    </PageContainer>
  );
}
