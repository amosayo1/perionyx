"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    title: "Control",
    subtitle: "Who can move money?",
    accent: "emerald",
    items: [
      "Policy Enforcement Engine",
      "Role-based Access Control",
      "Configurable Approval Rules",
      "Multi-level Workflows",
      "Escalation Paths",
    ],
  },
  {
    title: "Visibility",
    subtitle: "Every transaction, every decision.",
    accent: "blue",
    items: [
      "Real-time Ledger",
      "Immutable Audit History",
      "Treasury & Risk Dashboards",
      "Activity & Event Feeds",
      "Balance Exposures",
    ],
  },
  {
    title: "Automation",
    subtitle: "Reduce operational overhead.",
    accent: "amber",
    items: [
      "Automated Bank Sync",
      "Multi-channel Notifications",
      "Reconciliation Engine",
      "Webhooks & REST API",
      "Background Jobs & Queues",
    ],
  },
];

const accentMap: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  emerald: {
    border: "border-gold/20",
    bg: "bg-gold/5",
    text: "text-gold",
    dot: "bg-gold",
  },
  blue: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  amber: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
};

export function ThreePillars() {
  return (
    <section id="pillars" className="relative py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Three pillars of
            <br />
            <span className="text-zinc-400">enterprise financial operations.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {pillars.map((pillar, i) => {
            const colors = accentMap[pillar.accent];
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 p-8 hover:bg-zinc-900/80 transition-all duration-500"
              >
                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-5`}>
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{pillar.title}</h3>
                <p className="text-sm text-zinc-500 mb-6">{pillar.subtitle}</p>

                <ul className="space-y-2.5">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-zinc-400">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
