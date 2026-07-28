"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch, AlertTriangle, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

interface DecisionRow {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  title: string;
  recommendation: string;
  confidence: number;
  impact: string;
  risk: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  executedAt: string | null;
  createdAt: string;
}

interface DecisionListClientProps {
  decisions: DecisionRow[];
  page: number;
  total: number;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PENDING: { label: "Pending", dot: "bg-amber-400", bg: "bg-amber-500/10", text: "text-amber-400" },
  APPROVED: { label: "Approved", dot: "bg-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  REJECTED: { label: "Rejected", dot: "bg-red-400", bg: "bg-red-500/10", text: "text-red-400" },
  EXECUTED: { label: "Executed", dot: "bg-blue-400", bg: "bg-blue-500/10", text: "text-blue-400" },
  EXPIRED: { label: "Expired", dot: "bg-zinc-400", bg: "bg-zinc-500/10", text: "text-zinc-400" },
  CANCELLED: { label: "Cancelled", dot: "bg-zinc-500", bg: "bg-zinc-500/10", text: "text-zinc-500" },
};

function RiskIcon({ risk, className }: { risk: string; className?: string }) {
  switch (risk) {
    case "CRITICAL": return <Zap className={className} />;
    case "HIGH": return <AlertTriangle className={className} />;
    case "MEDIUM": return <TrendingUp className={className} />;
    default: return <Minus className={className} />;
  }
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case "LOW": return "text-emerald-400";
    case "MEDIUM": return "text-amber-400";
    case "HIGH": return "text-orange-400";
    case "CRITICAL": return "text-red-400";
    default: return "text-zinc-400";
  }
}

function getImpactColor(impact: string): string {
  switch (impact) {
    case "LOW": return "text-zinc-400";
    case "MEDIUM": return "text-amber-400";
    case "HIGH": return "text-orange-400";
    case "CRITICAL": return "text-red-400";
    default: return "text-zinc-400";
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function DecisionListClient({ decisions, page, total }: DecisionListClientProps) {
  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#111118] py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
          <GitBranch className="h-6 w-6 text-zinc-500" />
        </div>
        <p className="mt-4 text-sm font-medium text-white">No decisions found</p>
        <p className="mt-1 text-xs text-zinc-500">Adjust your filters or wait for agents to generate decisions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((d, i) => {
        const statusCfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.PENDING;

        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4 transition-colors hover:border-white/[0.14]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{d.title}</h3>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", statusCfg.bg, statusCfg.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                    {statusCfg.label}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{d.recommendation}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                  <Link href={`/agents/registry?id=${d.agentId}`} className="text-gold hover:underline">
                    {d.agentName}
                  </Link>
                  <span className="text-zinc-600">{d.agentRole.replace("_", " ")}</span>
                  <span className="text-zinc-600">{formatTime(d.createdAt)}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500">Confidence</p>
                  <p className="text-xs font-medium text-white">
                    {Math.round(d.confidence * 100)}%
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[11px]">
                    <RiskIcon risk={d.risk} className={cn("h-3 w-3", getRiskColor(d.risk))} />
                    <span className={getRiskColor(d.risk)}>{d.risk}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <TrendingDown className={cn("h-3 w-3", getImpactColor(d.impact))} />
                    <span className={getImpactColor(d.impact)}>{d.impact}</span>
                  </div>
                </div>
              </div>
            </div>

            {d.status === "PENDING" && (
              <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                <span className="text-[10px] text-zinc-500">Awaiting approval</span>
              </div>
            )}
            {d.approvedBy && (
              <div className="mt-2 border-t border-white/[0.05] pt-2 text-[10px] text-zinc-500">
                Approved by {d.approvedBy} · {formatTime(d.approvedAt)}
              </div>
            )}
          </motion.div>
        );
      })}

      <p className="text-xs text-zinc-500">
        Page {page} · {total} decision{total !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
