"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check, LayoutDashboard, Wallet, ArrowRightLeft, ShieldCheck, FileSearch, BarChart3, MessageSquare, Zap, BookCheck, Target } from "lucide-react";
import { useOnboarding } from "./onboarding-context";

const STEPS = [
  {
    icon: LayoutDashboard,
    title: "Executive Dashboard",
    description: "At-a-glance view of cash position, pending approvals, risk exposure, and key treasury metrics. Your command center.",
    highlight: "#dashboard",
    module: "Dashboard",
  },
  {
    icon: Wallet,
    title: "Wallets & Balances",
    description: "Multi-currency wallet overview across 18 countries. View real-time balances, FX exposure, and initiate transfers.",
    highlight: "#wallets",
    module: "Wallets",
  },
  {
    icon: ArrowRightLeft,
    title: "Payments & Transfers",
    description: "Create domestic and international payments. All transactions route through policy engine, approval workflows, and risk scoring.",
    highlight: "#transactions",
    module: "Transactions",
  },
  {
    icon: ShieldCheck,
    title: "Approval Workflows",
    description: "Multi-level approval chains with role-based rules. Approve or reject pending payment requests with full audit context.",
    highlight: "#approvals",
    module: "Approvals",
  },
  {
    icon: FileSearch,
    title: "Risk & Compliance",
    description: "Automated transaction scoring, risk incident tracking, AML screening, and real-time compliance monitoring.",
    highlight: "#risk",
    module: "Risk",
  },
  {
    icon: BarChart3,
    title: "Reconciliation",
    description: "Automated bank-to-ledger reconciliation with exception handling. Match settlements, flag discrepancies, generate reports.",
    highlight: "#reconciliation",
    module: "Reconciliation",
  },
  {
    icon: MessageSquare,
    title: "PERIONYX Copilot",
    description: "Ask natural-language questions about your treasury data. Get real-time answers backed by your company's financial context.",
    highlight: "#copilot",
    module: "Copilot",
  },
  {
    icon: BookCheck,
    title: "Audit Trail",
    description: "Immutable, timestamped log of every action. Full traceability from policy creation through payment settlement.",
    highlight: "#audit-logs",
    module: "Audit",
  },
  {
    icon: Target,
    title: "Business Scenarios",
    description: "Pre-built scenarios that demonstrate complex workflows: supplier payments, blocked transactions, FX exposure, quarter-end close, and more.",
    highlight: "",
    module: "Scenarios",
  },
  {
    icon: Zap,
    title: "You're Ready",
    description: "Explore any module freely, run scenarios, ask Copilot questions. Every action uses real business logic with simulated external data.",
    highlight: "",
    module: "",
  },
];

export function GuidedTourOverlay() {
  const { tourActive, currentTourStep, stopTour, setTourStep, addCompletedTask } = useOnboarding();
  const step = STEPS[currentTourStep];
  if (!step) return null;

  const isLast = currentTourStep === STEPS.length - 1;
  const progress = ((currentTourStep + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {tourActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            key={currentTourStep}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={stopTour}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                <step.icon className="h-5 w-5 text-gold" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs text-zinc-500">
                  Step {currentTourStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">{step.description}</p>

            <div className="h-1.5 rounded-full bg-white/[0.06] mb-5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: `${((currentTourStep) / STEPS.length) * 100}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentTourStep > 0) setTourStep(currentTourStep - 1);
                }}
                disabled={currentTourStep === 0}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>

              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTourStep(i)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === currentTourStep ? "bg-gold w-5" : "bg-white/[0.12] hover:bg-white/[0.2]"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (isLast) {
                    addCompletedTask({ id: "task-complete-tour", label: "Completed Guided Tour", module: "Onboarding" });
                    stopTour();
                  } else {
                    setTourStep(currentTourStep + 1);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-black transition-all hover:bg-gold/90"
              >
                {isLast ? (
                  <>
                    Done
                    <Check className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
