"use client";

import { motion } from "framer-motion";

const steps = [
  { label: "Invoice", color: "bg-zinc-800" },
  { label: "Slack", color: "bg-zinc-800" },
  { label: "Email", color: "bg-zinc-800" },
  { label: "Spreadsheet", color: "bg-zinc-800" },
  { label: "Bank Portal", color: "bg-zinc-800" },
  { label: "Accounting", color: "bg-zinc-800" },
  { label: "Audit", color: "bg-zinc-800" },
];

export function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Company payments become harder to control
            <br />
            <span className="text-zinc-400">as businesses grow.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/[0.06] text-sm text-zinc-400"
              >
                {s.label}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/5 border border-red-500/10 text-red-400 text-xs mb-6">
              Operational chaos
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Payments pass through Slack messages, email threads, spreadsheets, and bank portals.
              Finance teams lose visibility, approvals get missed, and audits become a nightmare.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
