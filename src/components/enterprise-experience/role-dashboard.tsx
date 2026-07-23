"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { RoleType, RoleDashboardConfig, FinancialHighlight } from "@/modules/enterprise-experience/types";
import { Bell, CheckCircle2, FileText, TrendingUp, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function RoleIcon({ role }: { role: RoleType }) {
  const icons: Record<RoleType, LucideIcon> = {
    cfo: TrendingUp,
    controller: CheckCircle2,
    treasurer: Users,
    "finance-manager": FileText,
    ap: FileText,
    ar: FileText,
    auditor: CheckCircle2,
    administrator: Users,
  };
  const Icon = icons[role] ?? Zap;
  return <Icon className="h-5 w-5 text-amber-400" />;
}

function RoleLabel({ role }: { role: RoleType }) {
  const labels: Record<RoleType, string> = {
    cfo: "CFO", controller: "Controller", treasurer: "Treasurer",
    "finance-manager": "Finance Manager", ap: "AP", ar: "AR",
    auditor: "Auditor", administrator: "Administrator",
  };
  return <>{labels[role]}</>;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4"
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function QuickActionButton({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white">
      <Zap className="h-4 w-4 text-amber-400" />
      {label}
    </button>
  );
}

function HighlightBadge({ highlight }: { highlight: FinancialHighlight }) {
  const arrow = highlight.direction === "up" ? "↑" : highlight.direction === "down" ? "↓" : "→";
  const color = highlight.direction === "up" ? "text-emerald-400" : highlight.direction === "down" ? "text-red-400" : "text-zinc-400";
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2">
      <span className="text-sm text-zinc-400">{highlight.label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">{highlight.value}</span>
        <span className={cn("text-xs", color)}>{arrow} {Math.abs(highlight.change)}%</span>
      </div>
    </div>
  );
}

interface RoleDashboardProps {
  role: RoleType;
  dashboard: RoleDashboardConfig;
  userName: string;
  highlights?: FinancialHighlight[];
}

export function RoleDashboard({ role, dashboard, userName, highlights }: RoleDashboardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="mx-auto max-w-7xl space-y-6 p-6"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
            <RoleIcon role={role} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {userName}
            </h1>
            <p className="text-sm text-zinc-500"><RoleLabel role={role} /> Dashboard</p>
          </div>
        </div>
      </motion.div>

      {highlights && highlights.length > 0 && (
        <motion.div variants={fadeInUp} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <HighlightBadge key={h.label} highlight={h} />
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dashboard.kpis.map((kpi) => (
          <KpiCard key={kpi} label={kpi} value="—" />
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {dashboard.quickActions.map((action) => (
          <QuickActionButton key={action} label={action} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {dashboard.approvals && (
          <motion.div variants={fadeInUp} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              Pending Approvals
            </h3>
            <p className="text-sm text-zinc-500">No pending approvals</p>
          </motion.div>
        )}
        {dashboard.notifications && (
          <motion.div variants={fadeInUp} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Bell className="h-4 w-4 text-amber-400" />
              Notifications
            </h3>
            <p className="text-sm text-zinc-500">No new notifications</p>
          </motion.div>
        )}
      </div>

      {dashboard.recommendations && (
        <motion.div variants={fadeInUp} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            Recommendations
          </h3>
          <p className="text-sm text-zinc-500">No recommendations yet</p>
        </motion.div>
      )}
    </motion.div>
  );
}
