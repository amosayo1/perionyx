"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const views = [
  {
    id: "dashboard",
    label: "Executive Overview",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-zinc-500 font-medium mb-1">Total Balance</div>
            <div className="text-2xl font-bold text-white">$6,410,000</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
            <span className="text-xs text-zinc-500">All accounts healthy</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Operating", "Payroll", "Vendor"].map((a) => (
            <div key={a} className="rounded-lg border border-white/[0.06] bg-black/40 p-3">
              <div className="text-[11px] text-zinc-500 mb-1">{a}</div>
              <div className="text-sm font-semibold text-white">
                {a === "Operating" ? "$4.28M" : a === "Payroll" ? "$890K" : "$1.24M"}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "approvals",
    label: "Approval Flow",
    content: (
      <div className="space-y-3">
        {[
          { vendor: "CloudScale Infra", amount: "$340,000", status: "Pending", by: "Awaiting CFO" },
          { vendor: "DataCore Solutions", amount: "$2,150,000", status: "Pending", by: "Awaiting CEO" },
          { vendor: "Stratum Security", amount: "$128,500", status: "Approved", by: "Approved by Treasurer" },
        ].map((a) => (
          <div key={a.vendor} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-black/30 p-3">
            <div>
              <div className="text-xs text-zinc-300 font-medium">{a.vendor}</div>
              <div className="text-[11px] text-zinc-500">{a.by}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-200 font-medium">{a.amount}</div>
              <div className={`text-[11px] ${a.status === "Approved" ? "text-[#d4af37]" : "text-amber-400"}`}>{a.status}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "policies",
    label: "Policy Builder",
    content: (
      <div className="space-y-3">
        {[
          { name: "Wire Transfer Limit", action: "Require Approval", threshold: "$100,000" },
          { name: "New Vendor Payment", action: "Block", threshold: "First payment" },
          { name: "International Transfer", action: "Flag", threshold: "Any amount" },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-black/30 p-3">
            <div>
              <div className="text-xs text-zinc-300 font-medium">{p.name}</div>
              <div className="text-[11px] text-zinc-500">Threshold: {p.threshold}</div>
            </div>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
              p.action === "Block" ? "bg-red-500/10 text-red-400" :
              p.action === "Flag" ? "bg-amber-500/10 text-amber-400" :
              "bg-[#d4af37]/10 text-[#d4af37]"
            }`}>
              {p.action}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "audit",
    label: "Audit Timeline",
    content: (
      <div className="space-y-2">
        {[
          { action: "Payment approved — CFO", time: "2:18 PM", id: "TXN-0421" },
          { action: "Policy matched — Wire Limit Rule", time: "2:15 PM", id: "TXN-0421" },
          { action: "Payment initiated — John D.", time: "2:14 PM", id: "TXN-0421" },
        ].map((e) => (
          <div key={e.time} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-black/30 p-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/60 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-zinc-300">{e.action}</span>
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">{e.time}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ProductShowcase() {
  const [active, setActive] = useState("dashboard");

  return (
    <section className="relative py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Everything your finance team needs.
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                active === v.id
                  ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm p-6 shadow-2xl"
          >
            <div className="flex items-center gap-1.5 mb-5 pb-4 border-b border-white/[0.04]">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">
                {views.find((v) => v.id === active)?.label}
              </span>
            </div>
            {views.find((v) => v.id === active)?.content}
          </motion.div>
          <div className="absolute -inset-4 bg-[#d4af37]/3 rounded-full blur-3xl -z-10" />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#d4af37] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            See these views in the interactive demo
          </Link>
        </div>
      </div>
    </section>
  );
}
