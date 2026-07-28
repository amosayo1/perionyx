"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, listItem } from "@/components/enterprise/motion/tokens";
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
interface Insight {
  id: string;
  type?: "info" | "warning" | "critical" | "success";
  title: string;
  message: string;
  timestamp?: string;
  acknowledged?: boolean;
}

interface InsightFeedProps {
  insights: Insight[];
  onAcknowledge?: (id: string) => void;
  className?: string;
}

const SEVERITY_CONFIG: Record<string, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  critical: { icon: AlertOctagon, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

function formatTimestamp(ts?: string): string {
  if (!ts) return "";
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch {
    return "";
  }
}

export function InsightFeed({ insights, onAcknowledge, className }: InsightFeedProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("space-y-2", className)}
    >
      <AnimatePresence mode="popLayout">
        {insights.map((insight) => {
          const severity = SEVERITY_CONFIG[insight.type ?? "info"];
          const SeverityIcon = severity.icon;

          return (
            <motion.div
              key={insight.id}
              variants={listItem}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                insight.acknowledged
                  ? "border-white/[0.06] bg-[#111118]/60 opacity-60"
                  : cn(severity.border, "bg-[#111118]"),
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    severity.bg,
                    severity.color,
                  )}
                >
                  <SeverityIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="truncate text-sm font-medium text-white">{insight.title}</h4>
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                        severity.bg,
                        severity.color,
                      )}
                    >
                      {insight.type ?? "info"}
                    </span>
                  </div>
                  <p className="mb-2 text-xs leading-relaxed text-zinc-400">{insight.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(insight.timestamp)}
                    </div>

                    {onAcknowledge && !insight.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(insight.id)}
                        className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        Acknowledge
                      </button>
                    )}

                    {insight.acknowledged && (
                      <span className="flex items-center gap-1 text-xs text-zinc-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {insights.length === 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-8 text-center">
          <Info className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
          <p className="text-xs text-zinc-500">No insights at this time</p>
        </div>
      )}
    </motion.div>
  );
}
