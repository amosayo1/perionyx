"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDemo } from "./demo-provider";

export function Step4CfoReview() {
  const { goToNext, transactionId, setCanGoNext } = useDemo();
  const [phase, setPhase] = useState<"idle" | "signing" | "approved">("idle");
  const [signatureProgress, setSignatureProgress] = useState(0);

  const handleApprove = () => {
    setCanGoNext(false);
    setPhase("signing");
  };

  useEffect(() => {
    if (phase !== "signing") return;
    if (signatureProgress < 100) {
      const t = setTimeout(() => setSignatureProgress((p) => Math.min(p + 5, 100)), 40);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("approved");
      setCanGoNext(true);
    }, 400);
    return () => clearTimeout(t);
  }, [phase, signatureProgress, setCanGoNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="ml-2 text-xs text-zinc-500 font-mono">CFO Review — Payment Approval</span>
          {phase === "approved" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37]"
            >
              Approved
            </motion.span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Final Approval Required</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Michael Roberts — Chief Financial Officer</p>
            </div>
            <span className="text-xs font-mono text-zinc-600">{transactionId}</span>
          </div>

          {/* Payment summary cards */}
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { label: "Vendor", value: "Stratum Security" },
              { label: "Amount", value: "$340,000.00" },
              { label: "Currency", value: "USD" },
              { label: "Department", value: "Infrastructure" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-black/40 border border-white/[0.04] p-3">
                <div className="text-[11px] text-zinc-500 mb-1">{f.label}</div>
                <div className="text-sm font-semibold text-white">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Risk assessment */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <span className="text-xs text-amber-400 font-medium">Moderate Risk — New Vendor</span>
              <p className="text-[11px] text-zinc-500">Documentation verified by Compliance. Policy engine: 2 of 3 rules triggered.</p>
            </div>
          </div>

          {/* Triggered policies (detailed) */}
          <div>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Triggered Policies</span>
            <div className="space-y-2">
              {[
                { name: "Wire Transfer Limit", detail: "Exceeds $100,000 — CFO approval required", by: "Policy Engine", status: "CFO Approval" },
                { name: "New Vendor Policy", detail: "First payment — Compliance Officer verified", by: "David Chen (Compliance)", status: "Approved" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/30 border border-white/[0.04]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37] shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400">{p.name}</span>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{p.detail}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0">{p.by}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37] shrink-0">{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action area */}
          {phase === "idle" && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleApprove}
                className="flex-1 px-5 py-3 text-sm font-medium rounded-xl bg-[#d4af37] text-white hover:bg-[#d4af37] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
              >
                Approve & Sign Payment
              </button>
              <button className="px-5 py-3 text-sm font-medium rounded-xl border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200">
                Reject
              </button>
            </div>
          )}

          {/* Signature animation */}
          {phase === "signing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="px-5 py-4 rounded-xl bg-zinc-800/40 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 border border-zinc-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">MR</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">Michael Roberts</span>
                      <p className="text-xs text-zinc-500">Chief Financial Officer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                    <span className="text-xs text-[#d4af37] font-medium">Signing...</span>
                  </div>
                </div>
                <div className="relative h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#d4af37] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${signatureProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Approved state */}
          {phase === "approved" && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20">
                <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    strokeLinejoin="round" className="text-[#d4af37]"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                </div>
                <div>
                  <span className="text-base font-semibold text-[#d4af37]">Payment Approved</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Proceeding to ledger posting...</p>
                </div>
              </div>

              {/* Approval signature details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-6 px-4 py-3 rounded-xl bg-zinc-800/40 border border-white/[0.06] text-[11px] text-zinc-500"
              >
                <span>Signed by: <span className="text-zinc-300">Michael Roberts</span></span>
                <span>Role: <span className="text-zinc-300">CFO</span></span>
                <span>Timestamp: <span className="text-zinc-300 font-mono">2:18 PM UTC</span></span>
                <span>IP: <span className="text-zinc-300 font-mono">10.0.1.12</span></span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
