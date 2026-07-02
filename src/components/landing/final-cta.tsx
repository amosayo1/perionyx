"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Money Should Never
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#d4af37] to-[#d4af37]">
              Move Without Trust.
            </span>
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto mb-10">
            PERIONYX gives you complete control over every dollar that moves through your
            organization. From policy to approval, execution to audit.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/request-demo"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-colors duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            Request a Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl border border-white/[0.12] text-zinc-300 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.2] transition-all duration-200"
          >
            Watch Interactive Demo
          </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
