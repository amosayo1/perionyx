"use client";

/**
 * Phase 22.3 — Decision Workspace: Left zone — Decision Summary
 *
 * Answers one question: "what is the decision and how confident can I be?"
 * Renders status, current recommendation (categorical + band + basis),
 * evidence gaps, risk summary, business impact, and the governing policy.
 */

import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, Clock, Banknote, Landmark, Target } from "lucide-react";
import type { DecisionWorkspaceData, RecommendationCategory } from "@/modules/decision-workspace/types";
import { formatDateTime } from "@/modules/decision-workspace/format";

const CATEGORY_STYLES: Record<RecommendationCategory, { badge: string; ring: string; label: string }> = {
  approve: { badge: "bg-emerald-500/15 text-emerald-400", ring: "border-emerald-500/30", label: "Approve" },
  review: { badge: "bg-amber-500/15 text-amber-400", ring: "border-amber-500/30", label: "Needs review" },
  reject: { badge: "bg-red-500/15 text-red-400", ring: "border-red-500/30", label: "Reject" },
  "no-signal": { badge: "bg-zinc-500/15 text-zinc-400", ring: "border-zinc-500/30", label: "No signal" },
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-orange-400",
  none: "text-zinc-500",
};

const RISK_STYLES: Record<string, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-zinc-400",
};

function Section({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-raised/70 to-surface-base/50 p-4", className)}>
      <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {icon}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function WorkspaceSummary({ data }: { data: DecisionWorkspaceData }) {
  const { summary, status } = data;
  const rec = summary.recommendation;
  const cat = CATEGORY_STYLES[rec.category];

  return (
    <div className="space-y-4">
      {/* Status */}
      <Section title="Status" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" aria-hidden />
          <span className="text-sm font-semibold text-white">{status.label}</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{status.explanation}</p>
      </Section>

      {/* Recommendation */}
      <Section title="Current recommendation" icon={<Target className="h-3.5 w-3.5" />} className={cn("border", cat.ring)}>
        <div className="flex items-center justify-between gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-semibold", cat.badge)}>
            {cat.label}
          </span>
          <span className="text-[10px] text-zinc-600">
            Derived {formatDateTime(rec.derivedAt)}
          </span>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-zinc-300">{rec.basis}</p>

        <div className="mt-3 flex items-center gap-2 text-[11px]">
          <span className="text-zinc-600">Confidence</span>
          <span className={cn("font-medium capitalize", CONFIDENCE_STYLES[rec.confidence])}>{rec.confidence}</span>
          <span className="text-zinc-600">· basis:</span>
          <span className="text-zinc-500">{rec.ai === null ? "evidence-derived (deterministic)" : "AI-assisted"}</span>
        </div>

        {rec.suggestedAction && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-gold/10 px-3 py-2.5">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold">Required next action</p>
              <p className="mt-0.5 text-[13px] font-medium text-white">{rec.suggestedAction}</p>
            </div>
          </div>
        )}

        {rec.alternatives.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">Why not the alternative</p>
            {rec.alternatives.map((alt) => (
              <p key={alt} className="text-[11px] leading-relaxed text-zinc-500">{alt}</p>
            ))}
          </div>
        )}
      </Section>

      {/* Evidence gaps */}
      {rec.evidenceGaps.length > 0 && (
        <Section title="What's missing" icon={<Clock className="h-3.5 w-3.5" />}>
          <ul className="space-y-1.5">
            {rec.evidenceGaps.map((gap) => (
              <li key={gap} className="flex items-start gap-2 text-[12px] text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" aria-hidden />
                {gap}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-zinc-600">Absence of evidence is disclosed, never hidden.</p>
        </Section>
      )}

      {/* Risks */}
      <Section title="Risk summary" icon={<ShieldAlert className="h-3.5 w-3.5" />}>
        {rec.riskFactors.length === 0 ? (
          <p className="text-[13px] text-zinc-500">No material risks identified in the evidence.</p>
        ) : (
          <ul className="space-y-2">
            {rec.riskFactors.map((r) => (
              <li key={r.label} className="flex items-start gap-2">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", r.severity === "high" ? "bg-red-400" : r.severity === "medium" ? "bg-amber-400" : "bg-zinc-500")} aria-hidden />
                <span className="text-[12px] text-zinc-300">{r.label}</span>
                <span className={cn("ml-auto text-[10px] font-medium uppercase", RISK_STYLES[r.severity])}>{r.severity}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Business impact */}
      <Section title="Business impact" icon={<Banknote className="h-3.5 w-3.5" />}>
        {summary.businessImpact && (
          <dl className="space-y-2">
            <div className="flex items-center justify-between">
              <dt className="text-[12px] text-zinc-500">Exposure</dt>
              <dd className="text-[13px] font-semibold tabular-nums text-white">{summary.businessImpact.exposure}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[12px] text-zinc-500">Overdue</dt>
              <dd className={cn("text-[13px] tabular-nums", summary.businessImpact.overdueDays !== null ? "font-semibold text-red-400" : "text-zinc-400")}>
                {summary.businessImpact.overdueDays !== null ? `${summary.businessImpact.overdueDays} days` : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[12px] text-zinc-500">Aging</dt>
              <dd className="text-[13px] tabular-nums text-zinc-300">{summary.businessImpact.aging}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[12px] text-zinc-500">Classification</dt>
              <dd className="text-[13px] text-zinc-300">
                {summary.businessImpact.highValue ? "High value" : "Standard"}
              </dd>
            </div>
          </dl>
        )}
      </Section>

      {/* Governing policy */}
      <Section title="Governing policy" icon={<Landmark className="h-3.5 w-3.5" />}>
        {summary.policy ? (
          <div>
            <p className="text-[13px] font-medium text-white">{summary.policy.label}</p>
            <p className="mt-1 text-[12px] tabular-nums text-zinc-400">{summary.policy.threshold}</p>
            <p className="mt-2 text-[11px] text-zinc-600">
              {summary.policy.applies
                ? "This approval matrix entry governs the decision."
                : "No matrix entry covers this amount — approval authority is undefined."}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-zinc-500">No policy data available.</p>
        )}
      </Section>
    </div>
  );
}
