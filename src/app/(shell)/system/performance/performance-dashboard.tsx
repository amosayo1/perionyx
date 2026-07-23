"use client";

import { motion } from "framer-motion";
import {
  BarChart3, Cpu, HardDrive, Zap, Clock, Activity, PieChart, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { PageContainer } from "@/components/enterprise/page-container";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { staggerContainer } from "@/components/enterprise/motion/tokens";

const DURATIONS = { slow: 0.3, normal: 0.2, fast: 0.15 };
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const BAR_COLORS = {
  gold: "#d4a843",
  goldDim: "rgba(212,168,67,0.3)",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  cyan: "#06b6d4",
};

const BUDGET_ITEMS = [
  { label: "node_modules", value: "2.0 GB", pct: 67, color: BAR_COLORS.gold },
  { label: "Source", value: "16 MB", pct: 18, color: BAR_COLORS.cyan },
  { label: "Assets", value: "12 MB", pct: 10, color: BAR_COLORS.blue },
  { label: "Other", value: "5 MB", pct: 5, color: BAR_COLORS.purple },
];

const MEMORY_USAGE = [
  { module: "Workflow Engine", rss: 186, heap: 142, external: 28 },
  { module: "AI Platform", rss: 312, heap: 268, external: 44 },
  { module: "Connector Platform", rss: 94, heap: 71, external: 12 },
  { module: "Queue Service", rss: 128, heap: 96, external: 18 },
  { module: "API Layer", rss: 76, heap: 58, external: 9 },
  { module: "Persistence", rss: 212, heap: 176, external: 36 },
  { module: "Cache Layer", rss: 64, heap: 42, external: 8 },
  { module: "Auth & IAM", rss: 48, heap: 36, external: 6 },
];

const CPU_USAGE = [
  { module: "AI Platform", pct: 42, trend: "up" as const },
  { module: "Workflow Engine", pct: 28, trend: "down" as const },
  { module: "API Layer", pct: 18, trend: "stable" as const },
  { module: "Connector Sync", pct: 15, trend: "up" as const },
  { module: "Queue Worker", pct: 12, trend: "stable" as const },
  { module: "Reporting", pct: 8, trend: "down" as const },
];

const RENDER_TIMES = [
  { module: "Dashboard", ms: 340, p75: 420 },
  { module: "Ledger", ms: 280, p75: 360 },
  { module: "Analytics", ms: 520, p75: 680 },
  { module: "Approval Matrix", ms: 180, p75: 240 },
  { module: "Workflow Designer", ms: 460, p75: 590 },
  { module: "Status Page", ms: 120, p75: 160 },
  { module: "Performance Page", ms: 150, p75: 190 },
];

const API_LATENCY = [
  { endpoint: "GET /api/v1/transactions", avg: 45, p95: 120, p99: 280 },
  { endpoint: "GET /api/v1/ledger", avg: 62, p95: 180, p99: 340 },
  { endpoint: "POST /api/v1/approvals", avg: 38, p95: 95, p99: 210 },
  { endpoint: "GET /api/v1/analytics", avg: 210, p95: 480, p99: 860 },
  { endpoint: "GET /api/v1/reports", avg: 340, p95: 720, p99: 1200 },
  { endpoint: "POST /api/v1/transactions", avg: 85, p95: 220, p99: 410 },
  { endpoint: "GET /api/v1/workflows", avg: 55, p95: 140, p99: 290 },
];

const STARTUP_TIMES = [
  { service: "Database Connection", ms: 1240 },
  { service: "Cache Warm", ms: 860 },
  { service: "Queue Initialization", ms: 420 },
  { service: "AI Model Load", ms: 3400 },
  { service: "Connector Registration", ms: 280 },
  { service: "Permission Registry", ms: 160 },
  { service: "Route Registration", ms: 95 },
  { service: "Middleware Init", ms: 45 },
];

const LARGEST_MODULES = [
  { name: "@prisma/client", size: "4.2 MB" },
  { name: "framer-motion", size: "3.8 MB" },
  { name: "next/dist", size: "3.1 MB" },
  { name: "lucide-react", size: "2.6 MB" },
  { name: "react-dom", size: "2.4 MB" },
  { name: "three.js (unused)", size: "1.8 MB" },
  { name: "date-fns", size: "1.2 MB" },
  { name: "zod", size: "0.9 MB" },
];

const SLOWEST_ROUTES = [
  { route: "/analytics/reports", ms: 2140, users: 12 },
  { route: "/treasury/forecast", ms: 1840, users: 8 },
  { route: "/consolidation/run", ms: 1620, users: 6 },
  { route: "/investments/portfolio", ms: 1440, users: 15 },
  { route: "/general-ledger/close", ms: 1280, users: 4 },
  { route: "/tax/compliance", ms: 1120, users: 9 },
];

function SvgBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-xs text-zinc-400 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-zinc-800 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: DURATIONS.slow, delay: 0.1, ease: EASE }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <span className="w-16 text-right text-xs text-zinc-300 font-mono">{pct}%</span>
    </div>
  );
}

function MiniBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: DURATIONS.normal, ease: EASE }}
        className="h-full rounded-full"
        style={{ background: color ?? BAR_COLORS.gold }}
      />
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <ArrowUpRight size={14} className="text-red-400" />;
  if (trend === "down") return <ArrowDownRight size={14} className="text-green-400" />;
  return <div className="w-3.5 h-0.5 bg-zinc-500 rounded-full" />;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[#d4a843]">{icon}</span>
      <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

export function PerformanceDashboard() {
  const cacheHitRate = 94.2;
  const optScore = 85;

  return (
    <PageContainer size="full">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Bundle Size</p>
            <p className="text-2xl font-bold text-white">2.1 GB</p>
            <p className="text-xs text-zinc-500 mt-1">260K lines of code</p>
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Cache Hit Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[#d4a843]">{cacheHitRate}%</p>
            </div>
            <MiniBar pct={cacheHitRate} color={BAR_COLORS.gold} />
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Avg API Latency</p>
            <p className="text-2xl font-bold text-white">119 ms</p>
            <p className="text-xs text-green-400 mt-1">+12% vs last week</p>
          </AnimatedCard>
          <AnimatedCard className="p-4">
            <p className="text-xs text-zinc-500 mb-1">Optimization Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[#d4a843]">{optScore}</p>
              <span className="text-sm text-zinc-400">/100</span>
            </div>
            <MiniBar pct={optScore} />
          </AnimatedCard>
        </div>

        {/* Bundle Size & Memory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-5">
            <SectionTitle icon={<HardDrive size={16} />} title="Bundle Size Breakdown" />
            <div className="space-y-3">
              {BUDGET_ITEMS.map((item) => (
                <SvgBar key={item.label} pct={item.pct} color={item.color} label={item.label} />
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t border-white/[0.06] text-xs text-zinc-500">
              {BUDGET_ITEMS.map((item) => (
                <span key={item.label}>{item.label}: {item.value}</span>
              ))}
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <SectionTitle icon={<PieChart size={16} />} title="Memory Usage by Module (RSS MB)" />
            <div className="space-y-2.5">
              {MEMORY_USAGE.map((m) => (
                <div key={m.module}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">{m.module}</span>
                    <span className="text-zinc-400 font-mono">{m.rss} MB</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.rss / 312) * 100}%` }}
                      transition={{ duration: DURATIONS.normal, ease: EASE }}
                      className="h-full rounded-full"
                      style={{
                        background: m.rss > 200
                          ? `linear-gradient(90deg, ${BAR_COLORS.gold}, #ef4444)`
                          : `linear-gradient(90deg, ${BAR_COLORS.goldDim}, ${BAR_COLORS.gold})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* CPU & Render Times */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-5">
            <SectionTitle icon={<Cpu size={16} />} title="CPU Utilization" />
            <div className="space-y-3">
              {CPU_USAGE.map((c) => (
                <div key={c.module} className="flex items-center gap-3">
                  <TrendIcon trend={c.trend} />
                  <span className="text-xs text-zinc-300 w-28 shrink-0">{c.module}</span>
                  <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: DURATIONS.slow, ease: EASE }}
                      className="h-full rounded-full"
                      style={{
                        background: c.pct > 30
                          ? `linear-gradient(90deg, #d4a843, #ef4444)`
                          : `linear-gradient(90deg, #22c55e, ${BAR_COLORS.gold})`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-zinc-400 font-mono">{c.pct}%</span>
                </div>
              ))}
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <SectionTitle icon={<Clock size={16} />} title="Render Time Estimates (ms)" />
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>Module</span>
                <div className="flex gap-6">
                  <span>Avg</span>
                  <span>P75</span>
                </div>
              </div>
              {RENDER_TIMES.map((r) => (
                <div key={r.module} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-300 w-30 shrink-0">{r.module}</span>
                  <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.ms / 520) * 100}%` }}
                      transition={{ duration: DURATIONS.normal, ease: EASE }}
                      className="h-full rounded-full"
                      style={{ background: r.ms > 300 ? BAR_COLORS.red : BAR_COLORS.gold }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-zinc-300 font-mono">{r.ms}</span>
                  <span className="w-10 text-right text-xs text-zinc-500 font-mono">{r.p75}</span>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* API Latency */}
        <AnimatedCard className="p-5">
          <SectionTitle icon={<Activity size={16} />} title="API Latency Breakdown (ms)" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-white/[0.06]">
                  <th className="text-left py-2 pr-4">Endpoint</th>
                  <th className="text-right py-2 px-4">Avg</th>
                  <th className="text-right py-2 px-4">P95</th>
                  <th className="text-right py-2 px-4">P99</th>
                  <th className="py-2 pl-4 w-1/3">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {API_LATENCY.map((a) => (
                  <tr key={a.endpoint} className="border-b border-white/[0.03]">
                    <td className="py-2.5 pr-4 text-zinc-300 font-mono">{a.endpoint}</td>
                    <td className="py-2.5 px-4 text-right text-zinc-300 font-mono">{a.avg}</td>
                    <td className="py-2.5 px-4 text-right text-zinc-400 font-mono">{a.p95}</td>
                    <td className="py-2.5 px-4 text-right text-zinc-500 font-mono">{a.p99}</td>
                    <td className="py-2.5 pl-4">
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(a.avg / 380) * 100}%` }}
                          transition={{ duration: DURATIONS.normal, ease: EASE }}
                          className="h-full bg-[#d4a843]"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((a.p95 - a.avg) / 380) * 100}%` }}
                          transition={{ duration: DURATIONS.normal, delay: 0.1, ease: EASE }}
                          className="h-full bg-[#d4a843]/50"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((a.p99 - a.p95) / 380) * 100}%` }}
                          transition={{ duration: DURATIONS.normal, delay: 0.2, ease: EASE }}
                          className="h-full bg-[#d4a843]/20"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>

        {/* Startup & Optimization Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-5">
            <SectionTitle icon={<Zap size={16} />} title="Startup Time by Service" />
            <div className="space-y-2.5">
              {STARTUP_TIMES.sort((a, b) => b.ms - a.ms).map((s) => (
                <div key={s.service}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">{s.service}</span>
                    <span className="text-zinc-400 font-mono">{s.ms}ms</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.ms / 3400) * 100}%` }}
                      transition={{ duration: DURATIONS.slow, ease: EASE }}
                      className="h-full rounded-full"
                      style={{
                        background: s.ms > 1000
                          ? `linear-gradient(90deg, ${BAR_COLORS.red}, #ef444488)`
                          : s.ms > 300
                            ? `linear-gradient(90deg, ${BAR_COLORS.gold}, ${BAR_COLORS.gold}88)`
                            : `linear-gradient(90deg, ${BAR_COLORS.green}, ${BAR_COLORS.green}88)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <SectionTitle icon={<BarChart3 size={16} />} title="Optimization Score" />
            <div className="flex flex-col items-center justify-center py-4">
              {/* SVG Ring */}
              <svg width="140" height="140" viewBox="0 0 140 140" className="mb-4">
                <circle cx="70" cy="70" r="56" fill="none" stroke="#27272a" strokeWidth="8" />
                <motion.circle
                  cx="70" cy="70" r="56"
                  fill="none"
                  stroke="#d4a843"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(optScore / 100) * 352} 352`}
                  initial={{ strokeDasharray: "0 352" }}
                  animate={{ strokeDasharray: `${(optScore / 100) * 352} 352` }}
                  transition={{ duration: 1, ease: EASE }}
                  transform="rotate(-90 70 70)"
                />
                <motion.text
                  x="70" y="70"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="28"
                  fontWeight="bold"
                  fontFamily="monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {optScore}
                </motion.text>
              </svg>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-xs">
                {[
                  { label: "Code Splitting", val: 72 },
                  { label: "Bundle Size", val: 68 },
                  { label: "Cache Strategy", val: 91 },
                  { label: "Lazy Loading", val: 88 },
                  { label: "Image Optimization", val: 95 },
                  { label: "Tree Shaking", val: 76 },
                  { label: "Route Prefetch", val: 84 },
                  { label: "Compression", val: 92 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: DURATIONS.normal, ease: EASE }}
                        className="h-full rounded-full"
                        style={{ background: item.val > 80 ? BAR_COLORS.green : item.val > 60 ? BAR_COLORS.gold : BAR_COLORS.red }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-18 text-right">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Largest Modules & Slowest Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-5">
            <SectionTitle icon={<PieChart size={16} />} title="Largest Modules" />
            <div className="space-y-2">
              {LARGEST_MODULES.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 font-mono w-5">{i + 1}.</span>
                  <span className="text-xs text-zinc-300 flex-1 truncate">{m.name}</span>
                  <span className="text-xs text-red-400 font-mono">{m.size}</span>
                </div>
              ))}
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <SectionTitle icon={<Clock size={16} />} title="Slowest Routes" />
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>Route</span>
                <div className="flex gap-4">
                  <span>Latency</span>
                  <span>Active</span>
                </div>
              </div>
              {SLOWEST_ROUTES.map((r) => (
                <div key={r.route} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-300 flex-1 truncate font-mono">{r.route}</span>
                  <span className="text-xs text-red-400 font-mono w-14 text-right">{r.ms} ms</span>
                  <span className="text-xs text-zinc-500 font-mono w-8 text-right">{r.users}</span>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </motion.div>
    </PageContainer>
  );
}
