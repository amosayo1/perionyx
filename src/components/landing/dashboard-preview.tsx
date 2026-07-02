"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const balances = [
  { label: "Operating Account", amount: "$4,280,000", change: "+2.1%", positive: true },
  { label: "Payroll Reserve", amount: "$890,000", change: "—", positive: true },
  { label: "Vendor Payments", amount: "$1,240,000", change: "-8.3%", positive: false },
];

const approvals = [
  { id: "TXN-0421", amount: "$340,000", vendor: "CloudScale Infra", status: "Pending", priority: "High" },
  { id: "TXN-0420", amount: "$128,500", vendor: "Stratum Security", status: "Approved", priority: "—" },
  { id: "TXN-0419", amount: "$2,150,000", vendor: "DataCore Solutions", status: "Pending", priority: "Urgent" },
];

function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const num = parseInt(value.replace(/[$,]/g, ""));
  useEffect(() => {
    if (isNaN(num)) { setDisplay(value); return; }
    let start = 0;
    const interval = setInterval(() => {
      start += Math.ceil(num / 40);
      if (start >= num) { start = num; clearInterval(interval); }
      setDisplay("$" + start.toLocaleString());
    }, 30);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num]);
  return <span>{display}{suffix}</span>;
}

export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-xl border border-white/[0.08] bg-zinc-900/80 backdrop-blur-sm overflow-hidden shadow-2xl"
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <span className="ml-2 text-xs text-zinc-500 font-mono">Treasury Dashboard</span>
        </div>

        <div className="p-5 grid grid-cols-5 gap-4">
          {/* Left column — balances */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Balances</span>
              <span className="text-[11px] text-[#d4af37]/70">Live</span>
            </div>
            {balances.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">{b.label}</span>
                  <span className={`text-[11px] ${b.positive ? 'text-[#d4af37]' : 'text-red-400'}`}>{b.change}</span>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">
                  <Counter value={b.amount} />
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right column — approvals table */}
          <div className="col-span-3 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Pending Approvals</span>
              <span className="text-[11px] text-amber-500/70">3 requiring attention</span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
              <span>ID</span>
              <span>Vendor</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>

            {approvals.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
                className="grid grid-cols-4 gap-2 items-center rounded-lg border border-white/[0.04] bg-black/30 px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-xs text-zinc-300 font-mono">{a.id}</span>
                <span className="text-xs text-zinc-400 truncate">{a.vendor}</span>
                <span className="text-xs text-zinc-200 text-right font-medium">{a.amount}</span>
                <span className={`text-xs text-right font-medium ${
                  a.status === "Approved" ? "text-[#d4af37]" :
                  a.priority === "Urgent" ? "text-amber-400" : "text-zinc-400"
                }`}>
                  {a.status === "Approved" ? a.status : a.priority === "Urgent" ? "Urgent" : "Pending"}
                </span>
              </motion.div>
            ))}

            {/* Activity feed at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="flex items-center gap-2 pt-2 border-t border-white/[0.04] mt-2"
            >
              <div className="flex -space-x-1">
                {[1, 2, 3].map((a) => (
                  <div key={a} className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800" />
                ))}
              </div>
              <span className="text-[11px] text-zinc-500">
                Finance team reviewing <span className="text-zinc-400">3 approvals</span>
              </span>
              <span className="ml-auto text-[11px] text-zinc-600">Updated 2m ago</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Subtle glow behind dashboard */}
      <div className="absolute -inset-20 bg-[#d4af37]/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
