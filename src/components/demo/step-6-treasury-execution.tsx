"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDemo } from "./demo-provider";

const statusLabels = ["Queued", "Authorizing", "Sending", "Confirmed"] as const;

function AnimatedBalance({ from, to }: { from: number; to: number }) {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const diff = from - to;
    const steps = 40;
    let current = from;
    const interval = setInterval(() => {
      current -= diff / steps;
      if (current <= to) { current = to; clearInterval(interval); }
      setDisplay(Math.round(current));
    }, 50);
    return () => clearInterval(interval);
  }, [from, to]);

  return <span>${display.toLocaleString()}.00</span>;
}

export function Step6TreasuryExecution() {
  const { transactionId } = useDemo();
  const [statusIndex, setStatusIndex] = useState(0);
  const [showBalanceChange, setShowBalanceChange] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStatusIndex(1), 800);
    const t2 = setTimeout(() => setStatusIndex(2), 1800);
    const t3 = setTimeout(() => {
      setStatusIndex(3);
      setShowBalanceChange(true);
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

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
          <span className="ml-2 text-xs text-zinc-500 font-mono">Treasury — Payment Queue</span>
          {statusIndex === 3 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-[10px] px-2 py-0.5 rounded bg-gold/10 text-gold"
            >
              Confirmed
            </motion.span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Bank account */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <rect x="3" y="8" width="18" height="14" rx="2" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="12" y1="4" x2="12" y2="8" /><path d="M7 12v4" /><path d="M17 12v4" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-white">Operating Account</span>
                <p className="text-xs text-zinc-500">Chase •••• 4829</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500">Available Balance</span>
              <motion.p
                className="text-lg font-semibold font-mono text-white"
                animate={{ color: showBalanceChange ? "#a1a1aa" : "#fff" }}
                transition={{ duration: 0.5 }}
              >
                {showBalanceChange ? (
                  <AnimatedBalance from={4280000} to={3940000} />
                ) : (
                  "$4,280,000.00"
                )}
              </motion.p>
            </div>
          </div>

          {/* Wire status journey */}
          <div className="rounded-xl border border-white/[0.06] bg-black/40 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-white">Wire Transfer — Stratum Security</span>
                  <p className="text-xs text-zinc-500">{transactionId} • $340,000.00</p>
                </div>
              </div>
            </div>

            {/* Status steps */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                {statusLabels.map((label, i) => {
                  const isDone = statusIndex > i;
                  const isActive = statusIndex === i;

                  return (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isDone
                          ? "bg-gold/10 border border-gold/30"
                          : isActive
                          ? "bg-amber-500/10 border border-amber-500/30"
                          : "bg-zinc-800 border border-zinc-700"
                      }`}>
                        {isDone ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                        )}
                      </div>
                      <span className={`text-[10px] font-medium ${
                        isDone ? "text-gold" : isActive ? "text-amber-400" : "text-zinc-600"
                      }`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gold rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((statusIndex + 1) / statusLabels.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          {/* Confirmed state */}
          {statusIndex === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/5 border border-gold/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div>
                  <span className="text-xs text-gold font-medium">Wire Confirmed — Funds Sent</span>
                  <p className="text-[11px] text-zinc-500">$340,000.00 debited from Operating Account (••••4829)</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wire details */}
          <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-zinc-600 pt-3 border-t border-white/[0.04]">
            <div>
              <span className="text-zinc-500">Wire Reference:</span>
              <span className="text-zinc-400 font-mono ml-2">WIRE-88492</span>
            </div>
            <div>
              <span className="text-zinc-500">Beneficiary:</span>
              <span className="text-zinc-400 ml-2">Stratum Security Inc.</span>
            </div>
            <div>
              <span className="text-zinc-500">Status:</span>
              <span className={statusIndex === 3 ? "text-gold ml-2" : "text-amber-400 ml-2"}>
                {statusLabels[statusIndex]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
