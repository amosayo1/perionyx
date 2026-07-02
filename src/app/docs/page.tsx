"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

const sections = [
  {
    title: "Getting Started",
    desc: "Learn the fundamentals of PERIONYX in under 10 minutes.",
    items: [
      { label: "Quickstart Guide", desc: "Create your first payment" },
      { label: "Core Concepts", desc: "Wallets, transactions, and ledgers" },
      { label: "Authentication", desc: "API keys and access tokens" },
      { label: "Environment Setup", desc: "Sandbox vs production" },
    ],
  },
  {
    title: "Payments",
    desc: "Initiate, approve, and execute payments programmatically.",
    items: [
      { label: "Creating a Payment", desc: "POST /v1/transactions" },
      { label: "Approval Workflows", desc: "Multi-level approval chains" },
      { label: "Payment Methods", desc: "Wire, ACH, internal transfer" },
      { label: "Error Handling", desc: "Idempotency and retries" },
    ],
  },
  {
    title: "Ledger & Accounting",
    desc: "Double-entry bookkeeping for every transaction.",
    items: [
      { label: "Journal Entries", desc: "Debits and credits" },
      { label: "Wallet Management", desc: "Create and manage wallets" },
      { label: "Balance Verification", desc: "Real-time reconciliation" },
      { label: "Audit Export", desc: "SOC 2-compatible reports" },
    ],
  },
  {
    title: "Policies & Compliance",
    desc: "Enforce rules and maintain compliance automatically.",
    items: [
      { label: "Policy Engine", desc: "Define and evaluate rules" },
      { label: "Approval Rules", desc: "Threshold and role-based routing" },
      { label: "Compliance Checks", desc: "Automated regulatory checks" },
      { label: "Audit Trail", desc: "Immutable event logging" },
    ],
  },
];

const guides = [
  { title: "Integrating with Your Bank", time: "10 min", difficulty: "Intermediate" },
  { title: "Setting Up Approval Chains", time: "15 min", difficulty: "Beginner" },
  { title: "Exporting Audit Data to SIEM", time: "5 min", difficulty: "Advanced" },
  { title: "Building a Custom Dashboard", time: "20 min", difficulty: "Intermediate" },
  { title: "Migrating from Spreadsheets", time: "30 min", difficulty: "Beginner" },
  { title: "Webhook Integration Guide", time: "10 min", difficulty: "Intermediate" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              Documentation
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Everything You Need
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#d4af37]">
              to Ship
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-base text-zinc-400 leading-relaxed mb-10"
          >
            Comprehensive guides, API reference, and examples to help your team integrate PERIONYX
            into your financial infrastructure.
          </motion.p>
        </div>
      </section>

      {/* Doc Sections */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-1">{section.title}</h3>
                <p className="text-sm text-zinc-500 mb-5">{section.desc}</p>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span className="text-xs text-zinc-300">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-zinc-600">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Popular Guides
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              Step-by-step guides for common integration scenarios.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide, i) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 hover:bg-zinc-900/70 transition-all duration-300"
              >
                <h3 className="text-sm font-semibold text-white mb-2">{guide.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-600">{guide.time}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">{guide.difficulty}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Ready to integrate?
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto mb-10">
              Get started with our quickstart guide or talk to our engineering team.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl bg-[#d4af37] text-white hover:bg-[#d4af37] transition-colors shadow-lg shadow-[#d4af37]/20">
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
              <Link href="/api" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all">
                API Reference
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
