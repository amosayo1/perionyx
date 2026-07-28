"use client";

import { motion } from "framer-motion";

const outcomes = [
  {
    title: "Prevent Unauthorized Payments",
    desc: "Policy enforcement blocks non-compliant payments before they leave your accounts. Rules apply to every transaction automatically.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Accelerate Finance Operations",
    desc: "Automated workflows remove manual bottlenecks. Payments move from request to settlement in minutes, with full governance preserved.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
      </svg>
    ),
  },
  {
    title: "Prepare for Audits",
    desc: "Every action is recorded immutably. Export complete audit trails with a single click — SOC 2, SOX, and regulatory-ready.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Reduce Operational Risk",
    desc: "Multi-level approvals, role-based access, escalation paths, and policy enforcement eliminate single points of failure in every workflow.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Scale Treasury Operations",
    desc: "From thousands to millions of transactions. Horizontally scalable architecture designed for enterprise multi-entity deployments.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Enterprise Governance",
    desc: "RBAC, segregation of duties, approval hierarchies, data isolation, and compliance controls built into every layer of the platform.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export function WhyPerionyx() {
  return (
    <section className="relative py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-gold/20 bg-gold/5 text-gold mb-6">
            Enterprise Outcomes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Outcomes, not features.
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto">
            Every capability in PERIONYX is designed to solve a specific operational problem for enterprise finance teams.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outcomes.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/30 to-black/30 p-5 hover:bg-zinc-900/50 hover:border-white/[0.1] transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold mb-4 group-hover:bg-gold/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
