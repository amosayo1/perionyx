"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useDemo } from "./demo-provider";

const fields = [
  { label: "Vendor Name", value: "Stratum Security", icon: "building" },
  { label: "Amount", value: "$340,000.00", icon: "dollar" },
  { label: "Currency", value: "USD", icon: "globe" },
  { label: "Department", value: "Infrastructure", icon: "folder" },
  { label: "Vendor Classification", value: "New Vendor", icon: "tag" },
  { label: "Payment Method", value: "Wire Transfer", icon: "bank" },
] as const;

type SubmitPhase = "idle" | "validating" | "generating" | "submitted";

export function Step1PaymentRequest() {
  const { transactionId, setCanGoNext } = useDemo();
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [validatedFields, setValidatedFields] = useState(0);
  const [showId, setShowId] = useState(false);

  const handleSubmit = useCallback(() => {
    setCanGoNext(false);
    setPhase("validating");
  }, [setCanGoNext]);

  useEffect(() => {
    if (phase !== "validating") return;
    if (validatedFields < fields.length) {
      const t = setTimeout(() => setValidatedFields((p) => p + 1), 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("generating"), 400);
    return () => clearTimeout(t);
  }, [phase, validatedFields]);

  useEffect(() => {
    if (phase !== "generating") return;
    const t = setTimeout(() => setShowId(true), 600);
    const t2 = setTimeout(() => {
      setPhase("submitted");
      setCanGoNext(true);
    }, 1600);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [phase, setCanGoNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="ml-2 text-xs text-zinc-500 font-mono">New Payment Request</span>
          {phase !== "idle" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37]"
            >
              {phase === "validating" && "Validating..."}
              {phase === "generating" && "Processing..."}
              {phase === "submitted" && "Submitted"}
            </motion.span>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Infrastructure Vendor Payment</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Complete the form to submit a new payment request</p>
            </div>
            {phase === "idle" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] text-amber-400 font-medium">Draft</span>
              </div>
            )}
            {phase === "submitted" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[11px] text-[#d4af37] font-medium">Awaiting Policy Evaluation</span>
              </motion.div>
            )}
          </div>

          {/* Form fields with validation */}
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map((f, i) => {
              const isDone = phase === "idle" || validatedFields > i;
              const isValidating = phase === "validating" && validatedFields === i;

              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className={`relative space-y-1.5 p-3 rounded-xl transition-all duration-300 ${
                    isValidating
                      ? "bg-[#d4af37]/5 border border-[#d4af37]/20"
                      : phase !== "idle" && isDone
                      ? "bg-black/40 border border-[#d4af37]/10"
                      : "bg-black/40 border border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{f.label}</span>
                    {isValidating && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3.5 h-3.5 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin"
                      />
                    )}
                    {phase !== "idle" && isDone && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        strokeLinejoin="round" className="text-[#d4af37]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </div>
                  <div className="text-sm text-white font-medium">{f.value}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-1.5"
          >
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Description</span>
            <div className="px-4 py-3 rounded-xl bg-black/40 border border-white/[0.06] text-sm text-zinc-300 leading-relaxed">
              Monthly infrastructure services — cloud hosting, CDN, and security monitoring for Q2 2026
            </div>
          </motion.div>

          {/* Supporting docs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-1.5"
          >
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Supporting Documents</span>
            <div className="flex flex-wrap items-center gap-2">
              {["Stratum-SOW-2026.pdf", "vendor-assessment.pdf", "invoice-8842.pdf"].map((doc, i) => (
                <motion.div
                  key={doc}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10 hover:bg-[#d4af37]/10 transition-colors cursor-default"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-[11px] text-[#d4af37]">{doc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit button / TX ID display */}
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleSubmit}
                className="w-full px-5 py-3 text-sm font-medium rounded-xl bg-[#d4af37] text-white hover:bg-[#d4af37] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
              >
                Submit Payment Request
              </button>
            </motion.div>
          )}

          {/* Transaction ID animation */}
          {showId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/40 border border-white/[0.06]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-zinc-400">Transaction ID generated</span>
                <p className="text-sm font-mono text-[#d4af37] font-semibold">{transactionId}</p>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="ml-auto"
              >
                <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-[#d4af37] animate-spin" />
              </motion.div>
            </motion.div>
          )}

          {/* Submitted state */}
          {phase === "submitted" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-[#d4af37]">Payment submitted — routing to Policy Engine for evaluation</span>
            </motion.div>
          )}

          {/* User info */}
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 pt-3 border-t border-white/[0.04]"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border border-zinc-500" />
              <div>
                <span className="text-xs text-zinc-300">Sarah Johnson</span>
                <span className="text-[11px] text-zinc-600 ml-2">Finance Manager</span>
              </div>
              <span className="ml-auto text-[11px] text-zinc-600">Just now</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
