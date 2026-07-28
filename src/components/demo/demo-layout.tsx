"use client";

import { motion } from "framer-motion";
import { useDemo } from "./demo-provider";

const stepNarrations: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Payment Request",
    subtitle: "Sarah Johnson creates a $340,000 payment request for Stratum Security, a new infrastructure vendor.",
  },
  2: {
    title: "Policy Engine",
    subtitle: "PERIONYX evaluates the payment against company policies in real time. Three policies are checked automatically.",
  },
  3: {
    title: "Approval Workflow",
    subtitle: "The payment enters a multi-level approval workflow. Each approver reviews and signs off in sequence.",
  },
  4: {
    title: "CFO Review",
    subtitle: "The CFO reviews the full payment context — vendor, amount, supporting documents, and triggered policies — before making a decision.",
  },
  5: {
    title: "Ledger Posting",
    subtitle: "PERIONYX posts a double-entry journal entry. Every debit and credit is recorded, balanced, and timestamped.",
  },
  6: {
    title: "Treasury Execution",
    subtitle: "The payment is queued for execution. Funds move from the operating account to the vendor.",
  },
  7: {
    title: "Audit Trail",
    subtitle: "Every action is permanently recorded. The audit trail captures who did what, when, and which policies were triggered.",
  },
  8: {
    title: "Dashboard Updated",
    subtitle: "The treasury dashboard reflects the changes. Balances update, pending approvals decrease, audit count increases.",
  },
  9: {
    title: "Money Moved. Governance Preserved.",
    subtitle: "One payment. Seven layers of governance. Zero shortcuts.",
  },
};

export function DemoLayout({ children }: { children: React.ReactNode }) {
  const { currentStep, totalSteps, steps, goToNext, goToPrev, canGoNext } = useDemo();
  const narration = stepNarrations[currentStep];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#090909]/80 backdrop-blur-lg border-b border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                <img src="/logo.svg" alt="Perionyx" className="h-full w-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight">PERIONYX Demo</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500">
                Step {currentStep} of {totalSteps}
              </span>
              <button
                onClick={() => window.location.href = "/"}
                className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
          <div className="relative h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gold rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep) / totalSteps) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => {}}
                className={`text-[9px] font-medium transition-colors duration-300 ${
                  s.id === currentStep
                    ? "text-gold"
                    : s.id < currentStep
                    ? "text-gold/60"
                    : "text-zinc-700"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row pt-24">
        {/* Narration panel */}
        <div className="lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.04] bg-black/30">
          <div className="p-6 lg:p-8 lg:h-full flex flex-col justify-between">
            <div>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-[11px] font-mono text-gold/60 font-medium mb-3 block">
                  STEP {String(currentStep).padStart(2, "0")}
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight mb-3">
                  {narration?.title}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {narration?.subtitle}
                </p>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-8">
              {currentStep > 1 && (
                <button
                  onClick={goToPrev}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  Back
                </button>
              )}
              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className={`px-5 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  canGoNext
                    ? "bg-gold text-white hover:bg-gold shadow-lg shadow-gold/20"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {currentStep < totalSteps ? "Continue" : "Finish"}
              </button>
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-4xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
