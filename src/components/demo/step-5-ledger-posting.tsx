"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDemo } from "./demo-provider";

type LedgerEntry = {
  account: string;
  accountCode: string;
  side: "Debit" | "Credit";
  amount: string;
  type: "DEBIT" | "CREDIT";
  category: string;
};

const entries: LedgerEntry[] = [
  { account: "Infrastructure Expense", accountCode: "6200-INFRA", side: "Debit", amount: "$340,000.00", type: "DEBIT", category: "Operating Expense" },
  { account: "Operating Account (Cash)", accountCode: "1100-CASH", side: "Credit", amount: "$340,000.00", type: "CREDIT", category: "Cash & Equivalents" },
];

export function Step5LedgerPosting() {
  const { transactionId } = useDemo();
  const [posted, setPosted] = useState(false);
  const [balanced, setBalanced] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPosted(true), 800);
    const t2 = setTimeout(() => setBalanced(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="ml-2 text-xs text-zinc-500 font-mono">General Ledger — Journal Entry</span>
          {posted && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37]"
            >
              {balanced ? "Balanced & Posted" : "Posted"}
            </motion.span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Journal header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Journal Entry JE-2026-0421</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Infrastructure vendor payment — Stratum Security</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10">
              <div className={`w-1.5 h-1.5 rounded-full ${posted ? "bg-[#d4af37]" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-[11px] font-medium text-[#d4af37]">{posted ? "Posted" : "Posting..."}</span>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] text-zinc-600 font-medium uppercase tracking-wider border-b border-white/[0.04]">
              <span className="col-span-4">Account</span>
              <span className="col-span-2">Code</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2 text-right">Debit</span>
              <span className="col-span-2 text-right">Credit</span>
            </div>

            {entries.map((entry, i) => (
              <div key={entry.account}>
                <motion.button
                  initial={{ opacity: 0, x: entry.type === "DEBIT" ? -20 : 20 }}
                  animate={{ opacity: posted ? 1 : 0, x: posted ? 0 : entry.type === "DEBIT" ? -20 : 20 }}
                  transition={{ delay: i * 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                  className={`w-full grid grid-cols-12 gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    expandedRow === i
                      ? "bg-[#d4af37]/5 border border-[#d4af37]/20"
                      : "bg-black/40 border border-white/[0.04] hover:bg-black/60 hover:border-white/[0.08]"
                  }`}
                >
                  <span className="col-span-4 text-sm text-white font-medium flex items-center gap-2">
                    {expandedRow === i ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37] shrink-0">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600 shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                    {entry.account}
                  </span>
                  <span className="col-span-2 text-xs text-zinc-500 font-mono">{entry.accountCode}</span>
                  <span className={`col-span-2 text-sm font-mono ${
                    entry.type === "DEBIT" ? "text-[#d4af37]" : "text-amber-400"
                  }`}>
                    {entry.side}
                  </span>
                  <span className="col-span-2 text-sm text-right text-white font-mono">
                    {entry.type === "DEBIT" ? entry.amount : "—"}
                  </span>
                  <span className="col-span-2 text-sm text-right text-white font-mono">
                    {entry.type === "CREDIT" ? entry.amount : "—"}
                  </span>
                </motion.button>

                {/* Expandable detail */}
                {expandedRow === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="ml-6 mt-1 mb-2 px-4 py-3 rounded-lg bg-black/60 border border-white/[0.04]"
                  >
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Category</span>
                        <p className="text-xs text-zinc-400 mt-0.5">{entry.category}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Reference</span>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{transactionId}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Approval Chain</span>
                        <p className="text-xs text-zinc-400 mt-0.5">David Chen (Compliance) → Michael Roberts (CFO)</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                      <div>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Timestamp</span>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">2:19 PM UTC</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Linked Payment</span>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{transactionId}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Posted By</span>
                        <p className="text-xs text-zinc-400 mt-0.5">System (Automated)</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Balance verification */}
          {balanced && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/10"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-xs text-[#d4af37] font-medium">Ledger Balanced</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">$340,000.00 DR = $340,000.00 CR</span>
            </motion.div>
          )}

          {/* Meta footer */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-600 pt-2 border-t border-white/[0.04]">
            <span>Posted by: <span className="text-zinc-500">System</span></span>
            <span>Timestamp: <span className="text-zinc-500 font-mono">2:19 PM UTC</span></span>
            <span>Reference: <span className="text-zinc-500 font-mono">{transactionId}</span></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
