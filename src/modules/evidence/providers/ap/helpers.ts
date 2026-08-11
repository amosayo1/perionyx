/**
 * Phase 22.4 — AP Evidence Providers: shared helpers
 *
 * Item-building + domain derivations shared by the AP providers. Providers
 * reproduce the Decision Workspace's exact evidence surface (ids, statuses,
 * confidence bases, labels) so the workspace can project the canonical
 * Evidence Package 1:1 — one source of truth, no hand-composition.
 */

import type {
  EvidenceConfidence,
  EvidenceContribution,
  EvidenceItem,
  EvidenceSection,
  EvidenceSectionId,
  EvidenceSource,
  EvidenceStatus,
} from "../../types";
import { EVIDENCE_SECTION_TITLES } from "../../types";
import type { VendorInvoice } from "@/server/procurement/ap-repositories/types";

export const RECORDED_BASIS = "Recorded fact from the AP repository";

export interface ItemSeed {
  id: string;
  sectionId: EvidenceSectionId;
  groupId: string;
  title: string;
  summary: string;
  reason: string;
  source: EvidenceSource;
  timestamp: string | null;
  importance?: "high" | "medium" | "low";
  related?: string[];
  expandable?: boolean;
  status: EvidenceStatus;
  confidence: EvidenceConfidence;
  confidenceBasis: string;
  evidence?: string[];
  order: number;
}

export function item(seed: ItemSeed): EvidenceItem {
  return {
    importance: seed.importance ?? "medium",
    related: [],
    expandable: false,
    evidence: [],
    ...seed,
  };
}

export function section(id: EvidenceSectionId, items: EvidenceItem[]): EvidenceSection {
  return {
    id,
    title: EVIDENCE_SECTION_TITLES[id],
    description: null,
    items,
  };
}

export function contribution(
  providerId: string,
  sections: EvidenceSection[],
  missing: EvidenceContribution["missing"],
  sourceSystems: string[],
): EvidenceContribution {
  return {
    providerId,
    sections,
    missing,
    sourceSystems,
    loadStats: { cacheHits: 0, cacheMisses: 0 },
  };
}

export function apSource(type: string, id: string, at: string | null): EvidenceSource {
  return { system: "ap.repository", type, id, at };
}

/** Currency resolution: invoice currency → vendor currency → USD. */
export function resolveCurrency(invoice: VendorInvoice, vendorCurrency?: string | null): string {
  return invoice.currency || vendorCurrency || "USD";
}

/** Invoice age in days — deterministic when the request pins `now`. */
export function invoiceAge(invoice: VendorInvoice, now?: string): string {
  const received = invoice.receivedDate ?? invoice.createdAt;
  const anchor = now ?? new Date().toISOString();
  const ms = new Date(anchor).getTime() - new Date(received).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const days = Math.floor(ms / 86400000);
  return `${days} days`;
}

export interface ApprovalLevelLike {
  levelNumber: number;
  levelName: string;
  minAmount: number;
  maxAmount: number | null;
  requiredRoles: string[];
}

/** Match an amount to the applicable approval level (last active as fallback). */
export function applicableLevel(
  levels: ApprovalLevelLike[],
  amount: number,
): ApprovalLevelLike | null {
  const active = [...levels].sort((a, b) => a.minAmount - b.minAmount);
  for (const level of active) {
    if (amount >= level.minAmount && (level.maxAmount == null || amount <= level.maxAmount)) {
      return level;
    }
  }
  return active[active.length - 1] ?? null;
}

export function exceptionWhy(type: string): string {
  switch (type) {
    case "DUPLICATE":
      return "Duplicate risk must be cleared to avoid a double payment.";
    case "NO_PO":
      return "A PO-less invoice has no commitment anchor — approve with escalation.";
    case "MISSING_GRN":
      return "Without receipt there is no proof the goods were delivered.";
    case "GL_CODING_REQUIRED":
      return "Uncoded spend blocks the general ledger and the close.";
    case "TAX_MISMATCH":
      return "Tax differences create reconciliation and compliance exposure.";
    case "PRICE_VARIANCE":
    case "QTY_VARIANCE":
      return "Line variances must be explained or waived before payment.";
    default:
      return "This exception must be resolved before the invoice can be paid.";
  }
}
