"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

const codeExamples = [
  { lang: "cURL", code: `curl https://api.vaultha.com/v1/transactions \\
  -H "Authorization: Bearer $PERIONYX_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 34000000,
    "currency": "usd",
    "source_wallet": "wal_operating",
    "destination_wallet": "wal_stratum",
    "metadata": { "vendor": "Stratum Security" }
  }'` },
  { lang: "Python", code: `from vaultha import Vaultha

client = Vaultha(api_key="sk_...")

transaction = client.transactions.create(
    amount=34000000,
    currency="usd",
    source_wallet="wal_operating",
    destination_wallet="wal_stratum",
    metadata={"vendor": "Stratum Security"},
)` },
  { lang: "Node.js", code: `import { Vaultha } from "@vaultha/sdk";

const client = new Vaultha({ apiKey: "sk_..." });

const transaction = await client.transactions.create({
  amount: 34000000,
  currency: "usd",
  sourceWallet: "wal_operating",
  destinationWallet: "wal_stratum",
  metadata: { vendor: "Stratum Security" },
});` },
];

const endpoints = [
  { method: "POST", path: "/v1/transactions", desc: "Create a payment" },
  { method: "GET", path: "/v1/transactions/:id", desc: "Retrieve a transaction" },
  { method: "GET", path: "/v1/transactions", desc: "List all transactions" },
  { method: "POST", path: "/v1/transactions/:id/approve", desc: "Approve a transaction" },
  { method: "POST", path: "/v1/transactions/:id/reject", desc: "Reject a transaction" },
  { method: "GET", path: "/v1/wallets", desc: "List wallets" },
  { method: "POST", path: "/v1/wallets/:id/credit", desc: "Credit a wallet" },
  { method: "POST", path: "/v1/wallets/:id/debit", desc: "Debit a wallet" },
];

export default function APIPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              API & Integrations
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Build on PERIONYX&apos;s
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#d4af37]">
              API-First Platform
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-base text-zinc-400 leading-relaxed mb-10"
          >
            Integrate treasury operations directly into your existing systems.
            RESTful API, webhooks, and SDKs for every major language.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-4"
          >
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl bg-[#d4af37] text-white hover:bg-[#d4af37] transition-colors shadow-lg shadow-[#d4af37]/20">
              Get API Keys
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all">
              Read Docs
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Create a Payment in Seconds
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              Our APIs are designed to be intuitive and consistent. Here is how you create a $340,000 payment.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {codeExamples.map((ex, i) => (
              <motion.div
                key={ex.lang}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]/60" />
                  <span className="text-xs font-mono text-zinc-500">{ex.lang}</span>
                </div>
                <pre className="p-4 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
                  {ex.code}
                </pre>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Core API Endpoints
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              Every resource in PERIONYX is accessible through a consistent RESTful interface.
            </p>
          </motion.div>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[11px] text-zinc-600 font-medium uppercase tracking-wider border-b border-white/[0.04] bg-black/30">
              <span className="col-span-2">Method</span>
              <span className="col-span-5">Path</span>
              <span className="col-span-5">Description</span>
            </div>
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
                className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors"
              >
                <span className={`col-span-2 text-xs font-mono font-medium ${
                  ep.method === "POST" ? "text-[#d4af37]" : "text-blue-400"
                }`}>
                  {ep.method}
                </span>
                <span className="col-span-5 text-xs font-mono text-zinc-300">{ep.path}</span>
                <span className="col-span-5 text-xs text-zinc-500">{ep.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Event-Driven Webhooks
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              Subscribe to real-time events and build reactive workflows. PERIONYX sends webhooks for every
              state change — payment created, approved, rejected, executed, and more.
            </p>
          </motion.div>
          <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#d4af37]/60" />
              <span className="text-xs font-mono text-zinc-500">Webhook Event Payload</span>
            </div>
            <pre className="p-5 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
{`{
  "event": "transaction.approved",
  "id": "evt_abc123",
  "data": {
    "transaction_id": "TXN-0421",
    "amount": 34000000,
    "status": "approved",
    "approved_by": ["user_dchen", "user_mroberts"],
    "timestamp": "2026-06-26T14:18:00Z"
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Start building today.
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto mb-10">
              Get API keys, read the documentation, and make your first API call in minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl bg-[#d4af37] text-white hover:bg-[#d4af37] transition-colors shadow-lg shadow-[#d4af37]/20">
                Read Documentation
              </Link>
              <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all">
                Get API Keys
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
