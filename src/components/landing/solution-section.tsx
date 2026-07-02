"use client";

import { motion } from "framer-motion";

export function SolutionSection() {
  return (
    <section className="relative py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
            One Platform
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            One Platform.
            <br />
            <span className="text-zinc-400">Every Financial Operation.</span>
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-8">
            PERIONYX is the operating layer between your people, your policies, and your financial infrastructure. Every treasury operation, payment, approval, and audit follows the same governed workflow from request to settlement.
          </p>
          <div className="space-y-3">
            {[
              { label: "Unified approval workflows", desc: "Automated routing, escalations, and compliance reviews" },
              { label: "Real-time treasury visibility", desc: "Every balance, transaction, and risk signal in one place" },
              { label: "Permanent audit trail", desc: "Immutable, exportable, SOC 2-ready" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mt-0.5 shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm text-zinc-300 font-medium">{item.label}</span>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <span className="text-xs text-zinc-400 font-medium">Active workflow</span>
              </div>
              <div className="space-y-3">
                {[
                  { step: "01", label: "Payment request created", time: "2:14 PM", status: "completed" },
                  { step: "02", label: "Policy engine reviewed", time: "2:15 PM", status: "completed" },
                  { step: "03", label: "Treasurer approved", time: "2:18 PM", status: "completed" },
                  { step: "04", label: "Funds released", time: "2:19 PM", status: "active" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-medium ${
                      item.status === "completed" ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20" :
                      "bg-[#d4af37] text-white"
                    }`}>
                      {item.status === "completed" ? "✓" : item.step}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-zinc-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -inset-4 bg-[#d4af37]/5 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
