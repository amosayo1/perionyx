"use client";

import { X, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./onboarding-context";

type HintDef = {
  id: string;
  module: string;
  text: string;
};

const HINTS: HintDef[] = [
  { id: "hint-dashboard", module: "Dashboard", text: "This is an interactive sandbox — all data is simulated. Use the Mission Panel (bottom-right) to track your progress." },
  { id: "hint-transactions", module: "Transactions", text: "Every payment routes through the policy engine, approval workflow, and risk scoring — just like production." },
  { id: "hint-approvals", module: "Approvals", text: "Approval chains are role-based. The payment amount and your permission level determine which approvers are required." },
  { id: "hint-risk", module: "Risk", text: "Risk incidents are auto-generated based on transaction patterns. Sandbox alerts simulate real AML and compliance screening." },
  { id: "hint-ledger", module: "Ledger", text: "All entries are double-entry and immutable. Every credit has a corresponding debit." },
  { id: "hint-copilot", module: "Copilot", text: "Copilot queries use your sandbox company's data. Try asking 'What is my current cash position?' or 'Show pending approvals'." },
  { id: "hint-reports", module: "Reports", text: "Reports reflect real seeded data: 5000+ transactions, 250 users, 300 vendors across 18 countries." },
  { id: "hint-wallets", module: "Wallets", text: "Balances update after each transaction scenario. Intra-company transfers respect FX rate tables." },
];

export function ContextualHint({ module }: { module: string }) {
  const { dismissedHints, dismissHint } = useOnboarding();
  const hint = HINTS.find((h) => h.module === module && !dismissedHints.includes(h.id));
  if (!hint) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#d4af37]/15 bg-[#d4af37]/5 px-4 py-3"
      >
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />
        <p className="text-xs text-zinc-300 leading-relaxed flex-1">{hint.text}</p>
        <button
          onClick={() => dismissHint(hint.id)}
          className="shrink-0 rounded p-0.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
