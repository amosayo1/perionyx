/**
 * Phase 22.5 — Decision Intelligence: Evidence adapter
 *
 * Bridges the canonical Evidence Package (Phase 22.4) into the normalized
 * DecisionEvidence the engine consumes. Domain-neutral: any evidence source
 * can implement this projection. Facts (measured numeric/boolean values the
 * rules reference) are provided by the caller — the adapter never fabricates
 * them, and numeric thresholds never come from formatted strings.
 */

import type { EvidencePackage } from "@/modules/evidence";
import type { DecisionEvidence, EvidenceSnapshot, FactValue, MissingSnapshot } from "../types";

export interface FromEvidenceOptions {
  /** "actionable" (decision pending) or "terminal" (already finalized). */
  state?: DecisionEvidence["state"];
  /** Current object status label, when known. */
  statusLabel?: string;
  /** Measured facts for the reference rules — provided by the caller. */
  facts?: Record<string, FactValue>;
}

export function fromEvidencePackage(pkg: EvidencePackage, options: FromEvidenceOptions = {}): DecisionEvidence {
  const items: EvidenceSnapshot[] = [];
  for (const section of pkg.sections) {
    for (const item of section.items) {
      items.push({
        id: item.id,
        groupId: item.groupId,
        sectionId: item.sectionId,
        status: item.status,
        confidence: item.confidence,
        confidenceBasis: item.confidenceBasis,
        timestamp: item.timestamp,
      });
    }
  }

  const missing: MissingSnapshot[] = pkg.missing.map((m) => ({
    id: m.id,
    label: m.label,
    reason: m.reason,
    impact: m.impact === "blocking" ? "blocking" : "advisory",
    sourceSystem: m.sourceSystem,
  }));

  return {
    entityType: pkg.request.entityType,
    entityId: pkg.request.entityId,
    tenantId: pkg.request.tenantId,
    state: options.state ?? "actionable",
    statusLabel: options.statusLabel,
    facts: options.facts ?? {},
    items,
    missing,
    stale: pkg.metadata.freshness.stale,
    now: pkg.request.now,
  };
}

/**
 * Convenience for domains that hold their evidence as records: derive
 * EvidenceSnapshots from a caller-supplied projection. Kept generic so the
 * engine can be driven without the Evidence Package when a domain has its own
 * collection already in memory.
 */
export function snapshotsFrom(records: Array<{
  id: string;
  groupId?: string;
  sectionId?: string;
  status: EvidenceSnapshot["status"];
  confidence: EvidenceSnapshot["confidence"];
  confidenceBasis?: string;
  timestamp?: string | null;
}>): EvidenceSnapshot[] {
  return records.map((r) => ({
    id: r.id,
    groupId: r.groupId ?? "",
    sectionId: r.sectionId,
    status: r.status,
    confidence: r.confidence,
    confidenceBasis: r.confidenceBasis,
    timestamp: r.timestamp ?? null,
  }));
}
