"use client";

import { motion } from "framer-motion";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

const sections = [
  {
    title: "Encryption",
    description:
      "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys are managed through a hardware security module with automatic rotation.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Access Control",
    description:
      "Role-based access control with granular permissions down to the individual API endpoint. Multi-factor authentication enforced for all administrative actions.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Audit Logging",
    description:
      "Comprehensive audit trail recording every platform action. Logs are immutable with cryptographic verification and cannot be altered or deleted by any user.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Infrastructure",
    description:
      "Hosted on AWS with multi-region redundancy. Automated daily backups with 30-day retention. Dedicated database instances with network isolation per tenant.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Vulnerability Management",
    description:
      "Continuous dependency scanning, SAST, and DAST in the CI pipeline. Responsible disclosure program. Security patches reviewed and deployed within 48 hours of critical advisories.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Data Isolation",
    description:
      "Each tenant operates in an isolated database schema with row-level security policies. Cross-tenant data access is impossible by design at the database layer.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10c0 4.5-3 8.3-7 9.6V14h3l-1-4h-2V7c0-1 1-2 2-2h1V2c-1 0-3 .5-4 2a6 6 0 0 0-6 0C9 2.5 7 2 6 2v1h1c1 0 2 1 2 2v3H7l-1 4h3v7.6C5 20.3 2 16.5 2 12A10 10 0 0 1 12 2z" />
      </svg>
    ),
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Navigation />

      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/3 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              Security
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Security is
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#c7a961]">
              engineered at every layer.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-base text-zinc-400 leading-relaxed"
          >
            PERIONYX is built with a security-first architecture. Encryption, access control, audit logging, and data isolation are not features we add later — they are foundational to the platform.
          </motion.p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-6 hover:border-white/[0.1] transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4">
                  {s.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
