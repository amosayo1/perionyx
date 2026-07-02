"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

const values = [
  {
    title: "Trust by Default",
    desc: "Every feature is built with the assumption that financial operations require the highest level of integrity. We design for auditability, not convenience.",
  },
  {
    title: "Radical Transparency",
    desc: "Every action in PERIONYX is recorded, timestamped, and attributable. If money moves, you know exactly who approved it, when, and why.",
  },
  {
    title: "Engineers First",
    desc: "We build for engineering teams who need to integrate treasury operations into their existing infrastructure. APIs are a first-class product, not an afterthought.",
  },
  {
    title: "Long-Term Thinking",
    desc: "Financial infrastructure is not built overnight. We are committed to a decade-long roadmap of building the most trusted money movement platform on the market.",
  },
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", initials: "AC" },
  { name: "Sarah Mitchell", role: "CTO & Co-Founder", initials: "SM" },
  { name: "James Wright", role: "Head of Engineering", initials: "JW" },
  { name: "Priya Patel", role: "Head of Product", initials: "PP" },
  { name: "Marcus Johnson", role: "Head of Security", initials: "MJ" },
  { name: "Emily Davis", role: "Head of Design", initials: "ED" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/3 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              About PERIONYX
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Building the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#c7a961]">
              Financial Infrastructure of the Future
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-base text-zinc-400 leading-relaxed mb-10"
          >
            PERIONYX was founded to solve a simple problem: enterprises should not need to choose between
            moving money quickly and moving it safely. We believe you can have both.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]/60 mb-4 block">Our Mission</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4 leading-[1.15]">
                Make every payment
                <br />
                <span className="text-zinc-400">governed by code, not spreadsheets.</span>
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                Finance teams at growing enterprises still manage payments across a patchwork of banking portals,
                spreadsheets, email approvals, and manual reconciliation. This is error-prone, slow, and
                nearly impossible to audit.
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                PERIONYX replaces this with a single, API-first platform where every payment passes through
                policy enforcement, multi-level approvals, double-entry accounting, and permanent audit logging.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 p-8"
            >
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#d4af37] to-[#8b6b2e] mb-2">$340K</div>
              <div className="text-sm text-zinc-500 mb-6">Average enterprise payment processed through PERIONYX</div>
              <div className="space-y-4">
                {[
                  { stat: "68%", label: "Faster payment cycles" },
                  { stat: "100%", label: "Audit coverage" },
                  { stat: "0", label: "Spreadsheet dependencies" },
                ].map((item) => (
                  <div key={item.stat} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">{item.stat}</span>
                    <span className="text-xs text-zinc-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              What We Believe
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/30 p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  <h3 className="text-base font-semibold text-white">{value.title}</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              Leadership
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              The Team
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              Former operators, engineers, and finance leaders from companies that moved billions of dollars.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <span className="text-sm font-semibold text-zinc-300">{member.initials}</span>
                </div>
                <div className="text-sm font-medium text-white">{member.name}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{member.role}</div>
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
              Want to be part of the story?
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto mb-10">
              We are hiring. Book a demo to see what we are building.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/request-demo" className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-colors shadow-lg shadow-[#d4af37]/20">
                Request a Demo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl border border-white/[0.12] text-zinc-300 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.2] transition-all">
                Watch Interactive Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
