import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product | PERIONYX",
  description: "One platform for treasury, payments, approvals, governance, audit, and AI-driven financial intelligence.",
};

const capabilities = [
  {
    title: "Treasury Management",
    description: "Multi-currency wallets, real-time balance tracking, bank connectivity via Plaid, and automated reconciliation across all accounts.",
  },
  {
    title: "Payments & Wallets",
    description: "Send and receive payments across multiple currencies with idempotent execution, wire transfers, and virtual account management.",
  },
  {
    title: "Approvals & Policy",
    description: "Define custom approval policies with conditional routing, spending limits, and multi-level approval chains. Every payment is policy-enforced.",
  },
  {
    title: "Risk Intelligence",
    description: "AI-powered anomaly detection, real-time risk scoring, compliance monitoring, and proactive alerting across all financial operations.",
  },
  {
    title: "Ledger & Audit",
    description: "Double-entry accounting with immutable audit trails. Every transaction is recorded, balanced, and timestamped for full traceability.",
  },
  {
    title: "Reporting & AI",
    description: "Automated reporting, AI briefings, scheduled intelligence snapshots, and dashboard visualizations for treasury, risk, and compliance teams.",
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]">
            Product Overview
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            The Enterprise Treasury
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#d4af37]">
              Operating System
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-400 leading-relaxed">
            PERIONYX unifies treasury, payments, approvals, governance, reconciliation, audit, risk intelligence, and AI
            into a single platform purpose-built for enterprise financial operations.
          </p>
        </div>

        <div className="grid gap-px bg-white/[0.04] rounded-xl overflow-hidden md:grid-cols-2">
          {capabilities.map((cap) => (
            <div key={cap.title} className="bg-black p-8">
              <h3 className="text-lg font-semibold text-white mb-3">{cap.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/request-demo"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            Request a Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
