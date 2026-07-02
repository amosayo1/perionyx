"use client";

import { motion, useScroll } from "framer-motion";
import { useRef, useState } from "react";

const stages = [
  {
    title: "Payment Requested",
    desc: "A team member initiates a payment — invoice, transfer, or expense. PERIONYX captures every detail, including approvals needed and policies to enforce.",
    detail: "Purpose, amount, vendor, currency, attached documents",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M9 15l3-3 3 3" />
      </svg>
    ),
  },
  {
    title: "Policy Engine",
    desc: "Every payment is evaluated against your company's policies — amount limits, vendor rules, currency restrictions, and regulatory requirements.",
    detail: "Real-time rule evaluation, automated flagging, block or allow decisions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Approval Workflow",
    desc: "Multi-level approval chains route the payment to the right people. Sequential or parallel approvals, escalation paths, and compliance reviews.",
    detail: "Role-based routing, approval authorities, timeouts, escalations",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Funds Released",
    desc: "Once approved, funds move through your connected bank or internal ledger. PERIONYX executes the transfer and confirms settlement.",
    detail: "Bank integrations, ledger updates, settlement confirmation",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Ledger Updated",
    desc: "Double-entry ledger records every movement. Every debit and credit is balanced, versioned, and immutable.",
    detail: "Double-entry bookkeeping, balance verification, version control",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Audit Recorded",
    desc: "Every action is permanently recorded. Complete audit trail with timestamps, actor identities, and before-after state for every transaction.",
    detail: "Immutable records, exportable reports, SOC-ready format",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export function WorkflowTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  function scrollToStep(index: number) {
    const el = document.getElementById(`workflow-step-${index}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveStep(index);
  }

  return (
    <section id="workflow" ref={containerRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
            One Workflow in the Operating System
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Follow Every Payment
            <br />
            <span className="text-zinc-400">From Request to Settlement</span>
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto">
            This represents one workflow inside PERIONYX — the full governed lifecycle of a single payment. The same engine powers treasury operations, compliance checks, ledger postings, and audit trails across your entire organization.
          </p>
        </motion.div>

        {/* Step navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {stages.map((stage, i) => (
            <button
              key={stage.title}
              onClick={() => scrollToStep(i)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all duration-200 ${
                activeStep === i
                  ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]"
                  : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]"
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[31px] top-0 bottom-0 w-px bg-gradient-to-b from-[#d4af37]/40 via-[#d4af37]/20 to-transparent" />

          <div className="space-y-24">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.title}
                id={`workflow-step-${i}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                onViewportEnter={() => setActiveStep(i)}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-8"
              >
                {/* Circle marker */}
                <div className="relative z-10 flex items-start">
                  <div className="w-[62px] h-[62px] rounded-xl border border-white/[0.08] bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center text-[#d4af37] shadow-lg">
                    {stage.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-mono text-[#d4af37]/60 font-medium">0{i + 1}</span>
                    <h3 className="text-lg font-semibold text-white">{stage.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-xl mb-3">{stage.desc}</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.04]">
                    <span className="text-[11px] text-zinc-500">{stage.detail}</span>
                  </div>
                </div>

                {/* Right decorative element */}
                <div className="hidden lg:block absolute right-0 top-0 w-32 h-32 bg-[#d4af37]/3 rounded-full blur-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
