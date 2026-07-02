"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDemo } from "./demo-provider";

const policies = [
  {
    name: "Wire Transfer Limit",
    condition: "Amount exceeds $100,000",
    rule: "Any wire transfer over $100,000 requires CFO approval",
    status: "triggered" as const,
    reason: "$340,000.00 exceeds policy threshold of $100,000.00",
    icon: "alert",
  },
  {
    name: "New Vendor Policy",
    condition: "Vendor has no prior payment history",
    rule: "First payments to new vendors require Compliance Officer review",
    status: "triggered" as const,
    reason: "Stratum Security is classified as a new vendor (0 prior payments)",
    icon: "alert",
  },
  {
    name: "Country Risk Assessment",
    condition: "Vendor jurisdiction — United States",
    rule: "US-based vendors are low risk — no additional controls required",
    status: "passed" as const,
    reason: "Jurisdiction classified as Low Risk (Tier 1)",
    icon: "shield",
  },
];

export function Step2PolicyEngine() {
  const { transactionId } = useDemo();
  const [phase, setPhase] = useState<"waiting" | "evaluating" | "complete">("waiting");
  const [currentPolicy, setCurrentPolicy] = useState(-1);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("evaluating"), 600);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== "evaluating" || currentPolicy >= policies.length) return;
    const t = setTimeout(() => setCurrentPolicy((p) => p + 1), 900);
    return () => clearTimeout(t);
  }, [phase, currentPolicy]);

  useEffect(() => {
    if (currentPolicy === policies.length) {
      const t = setTimeout(() => setPhase("complete"), 500);
      return () => clearTimeout(t);
    }
  }, [currentPolicy]);

  const triggered = policies.filter((p) => p.status === "triggered").length;
  const riskLevel = triggered >= 2 ? "Medium" : "Low";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Payment entering engine banner */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-zinc-900/40 border border-white/[0.06]"
      >
        <div className="flex items-center gap-2">
          {phase === "waiting" ? (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-400 font-medium">Awaiting evaluation</span>
            </>
          ) : phase === "evaluating" ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-xs text-[#d4af37] font-medium">Evaluating policies</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-[#d4af37] font-medium">Evaluation complete</span>
            </>
          )}
        </div>
        <span className="text-xs text-zinc-600 font-mono">{transactionId}</span>
        <span className="text-xs text-zinc-600 ml-auto">$340,000.00 USD</span>
      </motion.div>

      {/* Overall progress */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Policy Engine Progress</span>
          <span className="text-zinc-400 font-mono">
            {Math.min(currentPolicy + 1, policies.length)} / {policies.length}
          </span>
        </div>
        <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-[#d4af37] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentPolicy + 1) / policies.length) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Policy cards */}
      <div className="space-y-3">
        {policies.map((policy, i) => {
          const isVisible = currentPolicy >= i;
          const isActive = currentPolicy === i && phase === "evaluating";

          return (
            <motion.div
              key={policy.name}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : 10,
                scale: isVisible ? 1 : 0.97,
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                isActive
                  ? "border-[#d4af37]/30 bg-[#d4af37]/5 shadow-lg shadow-[#d4af37]/5"
                  : isVisible
                  ? "border-white/[0.06] bg-zinc-900/40"
                  : "border-white/[0.03] bg-zinc-900/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-[#d4af37]/10 border border-[#d4af37]/20"
                      : isVisible && policy.status === "triggered"
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : isVisible
                      ? "bg-[#d4af37]/10 border border-[#d4af37]/20"
                      : "bg-zinc-800 border border-zinc-700"
                  }`}>
                    {!isVisible ? (
                      <div className="w-3 h-3 rounded-full border-2 border-zinc-600" />
                    ) : isActive ? (
                      <div className="w-3 h-3 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
                    ) : policy.status === "triggered" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{policy.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{policy.condition}</p>
                  </div>
                </div>

                {isVisible && !isActive && (
                  <div className={`text-right shrink-0 ${
                    policy.status === "triggered" ? "bg-amber-500/10 text-amber-400" : "bg-[#d4af37]/10 text-[#d4af37]"
                  } px-2.5 py-1 rounded-lg`}>
                    <span className="text-[11px] font-medium">{policy.status === "triggered" ? "Triggered" : "Passed"}</span>
                  </div>
                )}

                {isActive && (
                  <div className="px-2.5 py-1 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20">
                    <span className="text-[11px] text-[#d4af37] font-medium">Checking...</span>
                  </div>
                )}
              </div>

              {/* Expandable detail */}
              {isVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3, delay: isActive ? 0 : 0.2 }}
                  className="mt-3 pt-3 border-t border-white/[0.04]"
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Rule</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{policy.rule}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Result</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{policy.reason}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Risk score */}
      {currentPolicy >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/40 border border-white/[0.06]"
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={riskLevel === "Medium" ? "text-amber-400" : "text-[#d4af37]"}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-xs text-zinc-400">Risk Score</span>
          </div>
          <span className={`text-sm font-semibold ${riskLevel === "Medium" ? "text-amber-400" : "text-[#d4af37]"}`}>
            {riskLevel}
          </span>
        </motion.div>
      )}

      {/* Complete state */}
      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs text-[#d4af37]">
            {triggered} of {policies.length} policies triggered — {triggered > 0 ? `${triggered} approval${triggered > 1 ? "s" : ""} required` : "no approvals required"}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
