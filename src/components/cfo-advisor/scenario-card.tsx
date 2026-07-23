"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, expandCollapse } from "@/components/enterprise/motion/tokens";
import {
  Play,
  Eye,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Pause,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

interface Scenario {
  name: string;
  type?: string;
  status?: "idle" | "running" | "completed" | "failed" | "paused";
  parameters?: Record<string, string>;
  results?: {
    summary?: string;
    risk?: string;
    outcome?: string;
    confidence?: number;
  };
}

interface ScenarioCardProps {
  scenario: Scenario;
  onRun?: () => void;
  onView?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  idle: { icon: Play, color: "text-zinc-400", bg: "bg-zinc-400/10", label: "Ready" },
  running: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-400/10", label: "Running" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Completed" },
  failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" },
  paused: { icon: Pause, color: "text-amber-400", bg: "bg-amber-400/10", label: "Paused" },
};

export function ScenarioCard({ scenario, onRun, onView, className }: ScenarioCardProps) {
  const [expanded, setExpanded] = useState(false);

  const status = STATUS_CONFIG[scenario.status ?? "idle"];
  const StatusIcon = status.icon;
  const parameters = Object.entries(scenario.parameters ?? {});
  const hasResults = Boolean(scenario.results);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "rounded-2xl border border-white/[0.09] bg-[#101010] p-5 transition-colors",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{scenario.name}</h3>
          {scenario.type && (
            <p className="mt-0.5 text-xs text-zinc-500 capitalize">{scenario.type.replace(/_/g, " ")}</p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
            status.bg,
            status.color,
          )}
        >
          <StatusIcon
            className={cn("h-3 w-3", scenario.status === "running" && "animate-spin")}
          />
          {status.label}
        </span>
      </div>

      {parameters.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {parameters.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="truncate text-xs text-zinc-500">{formatParamKey(key)}</span>
              <span className="ml-2 truncate text-xs font-medium text-zinc-300">{value}</span>
            </div>
          ))}
        </div>
      )}

      {hasResults && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-2 flex w-full items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
            />
            {expanded ? "Hide results" : "View results"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={expandCollapse}
                className="mb-3 space-y-2 border-t border-white/[0.06] pt-3"
              >
                {scenario.results!.summary && (
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {scenario.results!.summary}
                  </p>
                )}
                {scenario.results!.outcome && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Outcome:</span>
                    <span className="text-xs font-medium text-white">
                      {scenario.results!.outcome}
                    </span>
                  </div>
                )}
                {scenario.results!.risk && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Risk:</span>
                    <span className="text-xs font-medium text-amber-400">
                      {scenario.results!.risk}
                    </span>
                  </div>
                )}
                {scenario.results!.confidence !== undefined && (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Confidence</span>
                      <span className="text-xs text-zinc-300">
                        {scenario.results!.confidence}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scenario.results!.confidence}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          scenario.results!.confidence >= 80
                            ? "bg-emerald-400"
                            : scenario.results!.confidence >= 50
                              ? "bg-[#d4af37]"
                              : "bg-red-400",
                        )}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="flex gap-2">
        {onRun && (scenario.status === "idle" || scenario.status === "paused") && (
          <button
            onClick={onRun}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
          >
            <Play className="h-3 w-3" />
            Run
          </button>
        )}
        {onView && hasResults && (
          <button
            onClick={onView}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
        )}
      </div>
    </motion.div>
  );
}

function formatParamKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
