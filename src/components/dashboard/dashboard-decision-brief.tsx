"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Decision } from "@/modules/dashboard";

const TYPE_LABELS: Record<Decision["type"], string> = {
  treasury: "Treasury",
  payment: "Payments",
  approval: "Approval",
  reconciliation: "Reconciliation",
  operational: "Operations",
  risk: "Risk",
};

function confidenceBand(confidence: number): { label: string; className: string } {
  if (confidence >= 4) return { label: "High confidence", className: "text-emerald-400" };
  if (confidence >= 3) return { label: "Moderate confidence", className: "text-amber-400" };
  return { label: "Low confidence", className: "text-red-400" };
}

function DecisionCard({ decision, index }: { decision: Decision; index: number }) {
  const [open, setOpen] = useState(false);
  const band = confidenceBand(decision.score.confidence);
  const action = decision.suggestedActions[0] ?? decision.explainability.expectedOutcome;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30">
      <div className="flex items-start gap-3 px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold-muted text-[11px] font-semibold text-gold tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
              {TYPE_LABELS[decision.type]}
            </span>
            <span className={cn("text-[10px] font-medium", band.className)}>{band.label}</span>
          </div>
          <p className="mt-1 text-[13px] font-medium leading-snug text-zinc-200">{decision.title}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{decision.explainability.why}</p>
          {action && (
            <p className="mt-1.5 text-[11px] font-medium text-zinc-300">
              <span className="text-zinc-600">Suggested next:</span> {action}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`decision-evidence-${decision.id}`}
        className="flex w-full items-center gap-1.5 border-t border-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <Sparkles className="h-3 w-3" />
        Evidence package
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div id={`decision-evidence-${decision.id}`} className="space-y-2 border-t border-white/[0.04] bg-black/20 px-3 py-2.5">
          {decision.explainability.evidenceUsed.length > 0 && (
            <EvidenceLine label="Evidence used" values={decision.explainability.evidenceUsed} />
          )}
          {decision.supportingEvidence.length > 0 && (
            <EvidenceLine label="Supporting" values={decision.supportingEvidence} />
          )}
          {decision.explainability.policiesInvolved.length > 0 && (
            <EvidenceLine label="Policies involved" values={decision.explainability.policiesInvolved} />
          )}
          {decision.explainability.confidenceCalculation && (
            <EvidenceLine label="How confidence is calculated" values={[decision.explainability.confidenceCalculation]} />
          )}
          {decision.explainability.assumptions.length > 0 && (
            <EvidenceLine label="Assumptions" values={decision.explainability.assumptions} />
          )}
        </div>
      )}
    </div>
  );
}

function EvidenceLine({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">{label}</p>
      <ul className="mt-0.5 space-y-0.5 pl-3">
        {values.map((value) => (
          <li key={value} className="list-disc text-[11px] text-zinc-400">{value}</li>
        ))}
      </ul>
    </div>
  );
}

interface DashboardDecisionBriefProps {
  decisions: Decision[];
  className?: string;
}

export const DashboardDecisionBrief = memo(function DashboardDecisionBrief({
  decisions,
  className,
}: DashboardDecisionBriefProps) {
  return (
    <section aria-labelledby="dashboard-decisions" className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="dashboard-decisions" className="text-sm font-semibold text-zinc-300">
          Decision Brief
        </h2>
        <Link
          href="/cfo/decisions"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-gold hover:text-gold-hover"
        >
          All decisions
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {decisions.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5">
          <p className="text-[13px] text-zinc-400">No decisions are waiting on you.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {decisions.map((decision, index) => (
            <DecisionCard key={decision.id} decision={decision} index={index} />
          ))}
        </div>
      )}
    </section>
  );
});
