"use client";

import { motion } from "framer-motion";

const layers = [
  {
    label: "Application Layer",
    items: ["Multi-tenant RBAC", "Approval Engine", "Policy Engine", "Notification Service"],
  },
  {
    label: "Core Engine",
    items: ["Transaction Engine", "Double-entry Ledger", "Wallet Service", "Reconciliation Engine"],
  },
  {
    label: "Integration Layer",
    items: ["Bank Connectors", "Webhooks & Events", "REST API Gateway", "Queue & Background Jobs"],
  },
  {
    label: "Infrastructure",
    items: ["Isolated Data Stores", "Immutable Audit Log", "Rate Limiting", "Encryption at Rest & Transit"],
  },
];

export function EnterpriseArchitecture() {
  return (
    <section id="architecture" className="relative py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-gold/20 bg-gold/5 text-gold mb-6">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Built for
            <br />
            <span className="text-zinc-400">the most demanding environments.</span>
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto">
            Four layers of isolation, security, and resilience. Every component is independently deployable and horizontally scalable.
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 p-5 hover:border-white/[0.1] transition-colors duration-300"
              >
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.15em] mb-4 pb-3 border-b border-white/[0.04]">
                  {layer.label}
                </div>
                <div className="space-y-2.5">
                  {layer.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-zinc-400"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold/40 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.97%", label: "Platform Uptime" },
              { value: "SOC 2", label: "Type II Compliant" },
              { value: "AES-256", label: "Encryption Standard" },
              { value: "<50ms", label: "P99 API Latency" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
