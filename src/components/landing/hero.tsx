"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardPreview } from "./dashboard-preview";
import { SandboxEntryButton } from "./sandbox-entry-button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]">
            Enterprise Treasury Operating System
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-5"
        >
          One Platform.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#c7a961] to-[#d4af37]">
            Total Financial Control.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-base sm:text-lg text-zinc-400 leading-relaxed mb-10"
        >
           PERIONYX unifies treasury, payments, approvals, governance, audit, risk intelligence, and reporting into one enterprise treasury operating system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 mb-16 flex-wrap"
        >
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/request-demo"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
            >
              Request a Demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <span className="text-[10px] text-zinc-600">Speak with a treasury specialist</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl border border-white/[0.12] text-zinc-300 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.2] transition-all duration-200"
            >
              Watch Interactive Demo
            </Link>
            <span className="text-[10px] text-zinc-600">Self-guided product tour</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <SandboxEntryButton />
            <span className="text-[10px] text-zinc-600">Full product. No sign-up required.</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl px-6 mb-12"
      >
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/60 to-black/60 backdrop-blur-sm p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Enterprise Platform Modules</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px bg-white/[0.04] rounded-xl overflow-hidden">
            {[
              "Treasury", "Payments", "Approvals", "Policies",
              "Ledger", "Audit", "Risk & AI", "Reporting",
            ].map((label) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-2 bg-black/40 px-3 py-6 transition-colors hover:bg-white/[0.03]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/40" />
                <span className="text-[11px] font-medium text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <DashboardPreview />
    </section>
  );
}
