/**
 * Program 1 — Treasury Intelligence Platform: Evidence Provider Helpers
 *
 * Item-building helpers shared by the treasury evidence providers. Mirrors the
 * AP provider pattern (src/modules/evidence/providers/ap/helpers.ts) so the
 * treasury evidence surface uses the canonical eight explainability fields
 * and never hand-composes EvidencePackages.
 */

import type {
  EvidenceConfidence,
  EvidenceContribution,
  EvidenceItem,
  EvidenceSection,
  EvidenceSectionId,
  EvidenceSource,
  EvidenceStatus,
} from "@/modules/evidence/types";
import { EVIDENCE_SECTION_TITLES } from "@/modules/evidence/types";

export const RECORDED_BASIS = "Recorded fact from the treasury platform";

export interface TreasuryItemSeed {
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

export function item(seed: TreasuryItemSeed): EvidenceItem {
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

export function treasurySource(type: string, id: string, at: string | null): EvidenceSource {
  return { system: "treasury.prisma", type, id, at };
}

/** Amount display — tabular, signed, no thousand-separator noise for evidence. */
export function amountLabel(value: string, currency: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return `${value} ${currency}`;
  return `${numeric.toFixed(2)} ${currency}`;
}
