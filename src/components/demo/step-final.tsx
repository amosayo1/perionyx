"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { label: "Total Moved", value: "$340,000" },
  { label: "Approvals", value: "2" },
  { label: "Policies Evaluated", value: "3" },
  { label: "Audit Events", value: "7" },
  { label: "Ledger Entries", value: "2" },
  { label: "Wire Confirmed", value: "Yes" },
];

export function StepFinal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 mb-8"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          strokeLinejoin="round" className="text-[#d4af37]"
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4"
      >
        Money Moved.
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#d4af37]">
          Governance Preserved.
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed mb-10"
      >
        Every payment in PERIONYX follows company policy before money moves.
        From approval to accounting and audit, finance teams always know
        exactly what happened and who approved it.
      </motion.p>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 + i * 0.08, duration: 0.3 }}
            className="rounded-xl bg-black/40 border border-white/[0.04] p-3"
          >
            <div className="text-xs font-semibold text-white font-mono">{stat.value}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="flex items-center justify-center gap-4 flex-wrap"
      >
        <Link
          href="/request-demo"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl bg-[#d4af37] text-white hover:bg-[#d4af37] transition-colors duration-200 shadow-lg shadow-[#d4af37]/20"
        >
          Request a Demo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
        >
          Return to Home
        </Link>
      </motion.div>
    </motion.div>
  );
}
