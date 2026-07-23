"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { ImplementationSummary } from "@/modules/enterprise-experience/types";
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from "lucide-react";

function computeHealthScore(summary: ImplementationSummary, activeIntegrations: number, policiesConfigured: number, validationIssues: number, usersInvited: number): number {
  let score = 0;
  score += (summary.percentComplete / 100) * 30;
  score += Math.min(activeIntegrations / 5, 1) * 15;
  score += Math.min(policiesConfigured / 10, 1) * 15;
  score += Math.max(0, 1 - validationIssues / 10) * 20;
  score += Math.min(usersInvited / 20, 1) * 20;
  return Math.round(Math.min(score, 100));
}

function getSuggestions(summary: ImplementationSummary, activeIntegrations: number, policiesConfigured: number, validationIssues: number, usersInvited: number): string[] {
  const suggestions: string[] = [];
  if (summary.blocked > 0) suggestions.push("Resolve blocked milestones to unblock progress");
  if (activeIntegrations < 3) suggestions.push("Connect more integrations to improve data flow");
  if (policiesConfigured < 5) suggestions.push("Configure additional policies for compliance coverage");
  if (validationIssues > 0) suggestions.push(`Resolve ${validationIssues} validation issue${validationIssues > 1 ? "s" : ""}`);
  if (usersInvited < 5) suggestions.push("Invite more team members to increase adoption");
  if (suggestions.length === 0) suggestions.push("All systems operational — no recommendations");
  return suggestions;
}

interface ImplementationHealthDashboardProps {
  summary: ImplementationSummary;
  activeIntegrations: number;
  policiesConfigured: number;
  validationIssues: number;
  usersInvited: number;
}

export function ImplementationHealthDashboard({
  summary, activeIntegrations, policiesConfigured, validationIssues, usersInvited,
}: ImplementationHealthDashboardProps) {
  const healthScore = computeHealthScore(summary, activeIntegrations, policiesConfigured, validationIssues, usersInvited);
  const suggestions = getSuggestions(summary, activeIntegrations, policiesConfigured, validationIssues, usersInvited);

  const healthColor = healthScore >= 75 ? "text-emerald-400 stroke-emerald-400" : healthScore >= 50 ? "text-amber-400 stroke-amber-400" : "text-red-400 stroke-red-400";

  const metrics = [
    { label: "Active Integrations", value: activeIntegrations, status: activeIntegrations >= 3 ? "good" : activeIntegrations >= 1 ? "warn" : "bad" },
    { label: "Policies Configured", value: policiesConfigured, status: policiesConfigured >= 5 ? "good" : policiesConfigured >= 2 ? "warn" : "bad" },
    { label: "Validation Issues", value: validationIssues, status: validationIssues === 0 ? "good" : validationIssues <= 3 ? "warn" : "bad" },
    { label: "Users Invited", value: usersInvited, status: usersInvited >= 10 ? "good" : usersInvited >= 3 ? "warn" : "bad" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-6 flex items-center gap-6">
        <div className="relative flex items-center justify-center">
          <svg width="96" height="96" className="-rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="48" cy="48" r="40" fill="none"
              className={healthColor}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 - (healthScore / 100) * 2 * Math.PI * 40 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <span className={cn("absolute text-2xl font-bold", healthColor)}>{healthScore}</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Implementation Health</h2>
          <p className="text-sm text-zinc-400">
            {summary.completed} of {summary.total} milestones
          </p>
          <div className="mt-2 h-2 w-40 rounded-full bg-zinc-800">
            <motion.div
              className={cn("h-full rounded-full", healthScore >= 75 ? "bg-emerald-400" : healthScore >= 50 ? "bg-amber-400" : "bg-red-400")}
              initial={{ width: 0 }}
              animate={{ width: `${summary.percentComplete}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {m.status === "good" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {m.status === "warn" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {m.status === "bad" && <XCircle className="h-4 w-4 text-red-400" />}
              <span className="text-sm text-zinc-300">{m.label}</span>
            </div>
            <span className="text-sm font-semibold text-white">{m.value}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <Lightbulb className="h-3 w-3 text-amber-400" />
          Recommendations
        </p>
        <div className="space-y-1">
          {suggestions.map((s, i) => (
            <p key={i} className="text-sm text-zinc-400">• {s}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
