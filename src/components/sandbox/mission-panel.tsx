"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, Lightbulb, Target, ArrowRight, RotateCcw, Sparkles, ChevronRight, ListChecks } from "lucide-react";
import { useOnboarding } from "./onboarding-context";

const MODULE_ICONS: Record<string, string> = {
  Dashboard: "📊",
  Transactions: "💳",
  Approvals: "✅",
  Ledger: "📒",
  Audit: "🔍",
  Risk: "⚠️",
  Reports: "📈",
  Copilot: "🤖",
  Reconciliation: "🔄",
  Wallets: "💼",
  Scenarios: "🎯",
  Onboarding: "🚀",
};

const MISSIONS = [
  { id: "mission-executive-view", label: "View Executive Dashboard", module: "Dashboard", href: "/dashboard" },
  { id: "mission-first-payment", label: "Create Your First Payment", module: "Transactions", href: "/transactions" },
  { id: "mission-review-approval", label: "Review and Approve a Payment", module: "Approvals", href: "/approvals" },
  { id: "mission-ledger-check", label: "Inspect Ledger Entries", module: "Ledger", href: "/ledger" },
  { id: "mission-scenario", label: "Run Transaction Scenario", module: "Scenarios", href: "" },
  { id: "mission-risk-check", label: "Review Risk Alerts", module: "Risk", href: "/risk" },
  { id: "mission-run-recon", label: "Run Reconciliation", module: "Reconciliation", href: "/reconciliation" },
  { id: "mission-copilot", label: "Ask Copilot a Question", module: "Copilot", href: "/copilot" },
  { id: "mission-audit", label: "View Audit Trail", module: "Audit", href: "/audit-logs" },
  { id: "mission-report", label: "Generate a Report", module: "Reports", href: "/reports" },
];

export function MissionPanel() {
  const {
    missionPanelOpen,
    setMissionPanelOpen,
    completedTasks,
    addCompletedTask,
    startTour,
    selectedPersona,
    getSuggestedNext,
  } = useOnboarding();

  const completedIds = new Set(completedTasks.map((t) => t.id));
  const taskCounts = MISSIONS.reduce(
    (acc, m) => {
      if (completedIds.has(m.id)) acc.done++;
      acc.total++;
      return acc;
    },
    { done: 0, total: 0 }
  );

  const suggested = getSuggestedNext();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setMissionPanelOpen(!missionPanelOpen)}
        className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-xs font-bold text-black shadow-lg transition-all hover:bg-[#d4af37]/90"
      >
        <Target className="h-4 w-4" />
        Missions
        {taskCounts.done > 0 && (
          <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[10px]">
            {taskCounts.done}/{taskCounts.total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {missionPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMissionPanelOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[60] w-80 border-l border-white/[0.06] bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-white/[0.06] p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-[#d4af37]" />
                  <h2 className="text-sm font-semibold text-white">Missions</h2>
                </div>
                <button
                  onClick={() => setMissionPanelOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                {/* Progress */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">Progress</span>
                    <span className="text-xs font-medium text-white">
                      {taskCounts.done}/{taskCounts.total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#d4af37]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(taskCounts.done / taskCounts.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Suggested next */}
                {suggested && (
                  <button
                    onClick={() => {
                      addCompletedTask({ id: suggested.id, label: suggested.label, module: suggested.module });
                    }}
                    className="flex items-center gap-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-3 mb-4 text-left transition-all hover:bg-[#d4af37]/10"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/10">
                      <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">Suggested Next</p>
                      <p className="text-[11px] text-zinc-400 truncate">{suggested.label}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#d4af37] shrink-0" />
                  </button>
                )}

                {/* Mission list */}
                <div className="space-y-1">
                  {MISSIONS.map((mission) => {
                    const done = completedIds.has(mission.id);
                    return (
                      <button
                        key={mission.id}
                        onClick={() => {
                          if (!done) addCompletedTask({ id: mission.id, label: mission.label, module: mission.module });
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                          done
                            ? "opacity-50 hover:opacity-70"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-zinc-600" />
                        )}
                        <span className="text-xs shrink-0 opacity-60">{MODULE_ICONS[mission.module] ?? "📋"}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs truncate ${done ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                            {mission.label}
                          </p>
                          <p className="text-[10px] text-zinc-600">{mission.module}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom section */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={startTour}
                    className="flex w-full items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:bg-white/[0.04] hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restart Guided Tour
                  </button>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="text-[10px] text-zinc-500 mb-1">
                      Viewing as <span className="font-semibold text-zinc-300">{selectedPersona}</span>
                    </p>
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                      Missions adapt based on your role. Task completion syncs across sessions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
