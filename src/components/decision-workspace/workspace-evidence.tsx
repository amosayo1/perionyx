"use client";

/**
 * Phase 22.3 — Decision Workspace: Center zone — Evidence Package
 *
 * Every item exposes source, status, confidence band + basis, timestamp,
 * related records, and "why it matters". Items flagged expandable reveal the
 * supporting record list. Rows carry `data-evidence-item` for j/k navigation.
 */

import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import type { DecisionWorkspaceData, EvidenceItem, EvidenceStatus } from "@/modules/decision-workspace/types";
import { formatDateTime } from "@/modules/decision-workspace/format";

const STATUS_DOT: Record<EvidenceStatus, string> = {
  positive: "bg-emerald-400",
  negative: "bg-red-400",
  neutral: "bg-zinc-500",
  pending: "bg-amber-400",
  action: "bg-gold",
};

const CONFIDENCE_CHIP: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-orange-500/10 text-orange-400",
  none: "bg-zinc-500/10 text-zinc-500",
};

const STATUS_TEXT: Record<EvidenceStatus, string> = {
  positive: "Confirmed",
  negative: "Problem",
  neutral: "Recorded",
  pending: "Attention",
  action: "Action",
};

function EvidenceItemRow({ item }: { item: EvidenceItem }) {
  const [open, setOpen] = useState(false);
  const expandable = item.expandable || item.evidence.length > 0;

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (expandable) setOpen((v) => !v);
  };

  return (
    <li
      data-evidence-item
      data-evidence-id={item.id}
      className="group rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]"
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={expandable ? `${open ? "Collapse" : "Expand"} ${item.label}` : undefined}
          tabIndex={expandable ? 0 : -1}
          className="mt-0.5 shrink-0 text-zinc-600 transition-colors hover:text-zinc-300"
        >
          {expandable ? (
            open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className={cn("mt-1 block h-1.5 w-1.5 rounded-full", STATUS_DOT[item.status])} aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13px] font-medium text-zinc-200">{item.label}</span>
            {!expandable && (
              <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", STATUS_DOT[item.status])} aria-hidden />
            )}
            <span
              className={cn(
                "rounded border border-white/[0.06] px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.08em] capitalize",
                CONFIDENCE_CHIP[item.confidence],
              )}
              title={item.confidenceBasis}
            >
              {item.confidence}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[13px] tabular-nums text-white">{item.value}</p>
            <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-600">
              {STATUS_TEXT[item.status]}
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{item.whyItMatters}</p>

          {open && (
            <div className="mt-2 space-y-1.5 border-t border-white/[0.06] pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">Basis</p>
              <p className="text-[11px] text-zinc-400">{item.confidenceBasis}</p>

              {item.evidence.length > 0 && (
                <>
                  <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">Supporting records</p>
                  <ul className="space-y-1">
                    {item.evidence.map((e) => (
                      <li key={e} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                        <Paperclip className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
                        <span className="break-all">{e}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {item.related.length > 0 && (
                <p className="pt-1 text-[10px] text-zinc-600">
                  Related: {item.related.map((r) => r.slice(0, 8)).join(", ")}
                </p>
              )}

              {item.timestamp && (
                <p className="text-[10px] text-zinc-600">Recorded {formatDateTime(item.timestamp)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function WorkspaceEvidence({ data }: { data: DecisionWorkspaceData }) {
  return (
    <div className="space-y-4">
      {data.evidenceGroups.map((group) => (
        <section
          key={group.id}
          id={`evidence-${group.id}`}
          className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-raised/70 to-surface-base/50"
        >
          <header className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
            <p className="text-[11px] text-zinc-500">{group.description}</p>
          </header>
          <ul className="divide-y divide-white/[0.04] py-1">
            {group.items.map((item) => (
              <EvidenceItemRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
