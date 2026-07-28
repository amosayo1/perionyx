"use client";

import { Sparkles } from "lucide-react";
import type { PersonaRole } from "@/modules/copilot/command-center";

const QUESTIONS_BY_PERSONA: Record<PersonaRole, string[]> = {
  CEO: [
    "Summarize current treasury health",
    "Generate an executive briefing",
    "What are this quarter's strategic KPIs?",
    "Show revenue and treasury trends",
    "What risks require board attention?",
  ],
  CFO: [
    "What is our current cash position?",
    "Show pending approvals requiring my action",
    "Analyze liquidity across currencies",
    "Generate a daily financial summary",
    "What changed since yesterday?",
  ],
  Treasurer: [
    "Show today's payment activity",
    "What is our FX exposure by currency?",
    "Are there any failed or pending payments?",
    "Show bank balances across all accounts",
    "Run a liquidity forecast",
  ],
  "Risk Officer": [
    "Show open risk alerts by severity",
    "Which policies are being violated most?",
    "Summarize recent security incidents",
    "What are our top risk exposures?",
    "Show compliance status and exceptions",
  ],
  "Compliance Officer": [
    "Summarize recent compliance events",
    "Show policy exceptions this month",
    "Generate an audit trail summary",
    "Are there any regulatory concerns?",
    "Show approval compliance rates",
  ],
  Auditor: [
    "Show recent audit log activity",
    "Trace transaction TXN-48291 lifecycle",
    "Show ledger entries for the past week",
    "Verify approval compliance for large payments",
    "Generate an audit findings report",
  ],
  Developer: [
    "Show webhook delivery status",
    "Are there any connector failures?",
    "Show API key usage stats",
    "What is current platform health?",
    "Show recent integration activity",
  ],
  "Finance Manager": [
    "Show vendor payment history",
    "What payments are pending approval?",
    "Generate a vendor spend report",
    "Show reconciliation status and exceptions",
    "Show this month's transaction volume",
  ],
};

export function IntelligenceQuestions({
  persona,
  onSelect,
}: {
  persona: PersonaRole;
  onSelect: (text: string) => void;
}) {
  const questions = QUESTIONS_BY_PERSONA[persona] ?? QUESTIONS_BY_PERSONA.CFO;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold px-2 mb-1">
        Suggested Questions
      </p>
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] text-zinc-500 transition-all hover:bg-white/[0.03] hover:text-zinc-300"
        >
          <Sparkles className="h-3 w-3 shrink-0 text-zinc-600 group-hover:text-gold transition-colors" />
          <span className="leading-snug">{q}</span>
        </button>
      ))}
    </div>
  );
}
