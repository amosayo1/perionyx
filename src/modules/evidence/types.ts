/**
 * Phase 22.4 — Evidence Engine: Canonical types
 *
 * The Evidence Package is the atomic unit of Decision Intelligence
 * (Product System 06 §3). This module is the SINGLE source of truth for
 * evidence assembly — no screen composes evidence by hand anymore.
 *
 * Every item exposes the eight explainability fields (Title, Summary,
 * Reason, Source, Timestamp, Importance, Related entity, Expandability),
 * a categorical confidence band with a measured basis (DI-R2), provenance,
 * and absence handling. No AI, no recommendation, no writes.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Sections
// ──────────────────────────────────────────────────────────────────────────────

export type EvidenceSectionId =
  | "identity"
  | "entity"
  | "type"
  | "status"
  | "tenant"
  | "business-context"
  | "financial-context"
  | "relationships"
  | "history"
  | "policy"
  | "risk"
  | "timeline"
  | "supporting-documents"
  | "communications"
  | "missing-evidence"
  | "metadata";

export const EVIDENCE_SECTION_ORDER: EvidenceSectionId[] = [
  "identity",
  "entity",
  "type",
  "status",
  "tenant",
  "business-context",
  "financial-context",
  "relationships",
  "history",
  "policy",
  "risk",
  "timeline",
  "supporting-documents",
  "communications",
  "missing-evidence",
  "metadata",
];

export const EVIDENCE_SECTION_TITLES: Record<EvidenceSectionId, string> = {
  identity: "Identity",
  entity: "Entity",
  type: "Type",
  status: "Status",
  tenant: "Tenant",
  "business-context": "Business Context",
  "financial-context": "Financial Context",
  relationships: "Relationships",
  history: "History",
  policy: "Policy",
  risk: "Risk",
  timeline: "Timeline",
  "supporting-documents": "Supporting Documents",
  communications: "Communications",
  "missing-evidence": "Missing Evidence",
  metadata: "Metadata",
};

// ──────────────────────────────────────────────────────────────────────────────
// Item anatomy
// ──────────────────────────────────────────────────────────────────────────────

export type EvidenceStatus = "positive" | "negative" | "neutral" | "pending" | "action";

/** Categorical confidence band with mandatory basis (DI-R2, DI-P4). */
export type EvidenceConfidence = "high" | "medium" | "low" | "none";

/** Importance to the decision (the phase's "Importance"). */
export type EvidenceImportance = "high" | "medium" | "low";

export interface EvidenceSource {
  /** Canonical source system, e.g. "ap.repository", "prisma". */
  system: string;
  /** Record type, e.g. "VendorInvoice", "ThreeWayMatch". */
  type: string;
  /** Record id. */
  id: string;
  /** When the source fact was recorded. */
  at: string | null;
}

/**
 * One explainable fact. The canonical EvidenceItem — a superset of the
 * Phase 22.3 Decision Workspace item, re-exported by consumers so there is
 * exactly ONE model.
 */
export interface EvidenceItem {
  /** Stable key, unique within the package; used for dedupe. */
  id: string;
  /** Canonical section. */
  sectionId: EvidenceSectionId;
  /** Logical grouping key for consumers (invoice, line-items, matching, …). */
  groupId: string;
  /** Title — short noun phrase. */
  title: string;
  /** Summary — the value in plain language, already formatted. */
  summary: string;
  /** Reason — why this matters to the decision. */
  reason: string;
  /** Source — system, record type, record id. */
  source: EvidenceSource;
  /** Timestamp — when the source fact was recorded. */
  timestamp: string | null;
  /** Importance to the decision. */
  importance: EvidenceImportance;
  /** Related entity record ids (invoice/PO/GRN/vendor). */
  related: string[];
  /** Expandability — true when related detail exists behind EvidenceResolver. */
  expandable: boolean;
  /** Signal color. */
  status: EvidenceStatus;
  /** Categorical band — never a scalar. */
  confidence: EvidenceConfidence;
  /** What was actually measured — never "from the model". */
  confidenceBasis: string;
  /** Supporting record references (human labels + ids). */
  evidence: string[];
  /** Position within section — stable, deterministic. */
  order: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Missing evidence (mandatory)
// ──────────────────────────────────────────────────────────────────────────────

export interface MissingEvidence {
  id: string;
  sectionId: EvidenceSectionId;
  /** What is missing. */
  label: string;
  /** Why it matters to the decision. */
  reason: string;
  /** Blocking gaps prevent the decision from proceeding. */
  impact: "blocking" | "advisory";
  /** Whether the decision may proceed with this missing. */
  canProceed: boolean;
  /** Source system that looked and found nothing. */
  sourceSystem: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Request, sections, package
// ──────────────────────────────────────────────────────────────────────────────

export interface EvidenceRequest {
  /** e.g. "ap.invoice". */
  entityType: string;
  entityId: string;
  tenantId: string;
  /** Section filter — partial assembly. Empty/undefined = all sections. */
  sections?: EvidenceSectionId[];
  /** Per-section cap for list-like sections (0 = no cap). */
  maxItemsPerSection?: number;
  /** Injectable assembly time — keeps packages time-stable in tests. */
  now?: string;
  /**
   * Pre-loaded data seeded into the assembly context under load keys.
   * Providers call `context.load(key, fn)`; a seeded key is returned without
   * calling `fn` — consumers (e.g. the Decision Workspace) avoid re-fetching
   * records they already loaded. Keys are module-convention strings.
   */
  seed?: Record<string, unknown>;
}

export interface EvidenceSection {
  id: EvidenceSectionId;
  title: string;
  description: string | null;
  items: EvidenceItem[];
}

export interface EvidencePackageMetadata {
  assembledAt: string;
  evidenceVersion: string;
  entityType: string;
  entityId: string;
  tenantId: string;
  providerIds: string[];
  sourceSystems: string[];
  itemCount: number;
  duplicatesSkipped: number;
  sections: EvidenceSectionId[];
  /** No blocking missing evidence. */
  decisionReady: boolean;
  freshness: {
    oldestTimestamp: string | null;
    newestTimestamp: string | null;
    /** True when any item is older than STALE_AFTER_DAYS. */
    stale: boolean;
  };
  contentHash: string;
}

export interface EvidencePackage {
  request: EvidenceRequest;
  sections: EvidenceSection[];
  missing: MissingEvidence[];
  metadata: EvidencePackageMetadata;
}

// ──────────────────────────────────────────────────────────────────────────────
// Providers
// ──────────────────────────────────────────────────────────────────────────────

/** A fact a provider requires; the assembler marks it missing when unsatisfied. */
export interface RequiredEvidence {
  id: string;
  sectionId: EvidenceSectionId;
  label: string;
  reason: string;
  /** Blocking gaps prevent the decision from proceeding. */
  blocking: boolean;
  /**
   * Item ids that satisfy this requirement when present. Exact id match,
   * or a prefix ending in `*` (e.g. "doc:*") matching any emitted item id
   * that starts with the prefix.
   */
  satisfiedBy: string[];
}

export interface EvidenceContribution {
  providerId: string;
  /** Systems this provider read from. */
  sourceSystems: string[];
  sections: EvidenceSection[];
  missing: MissingEvidence[];
  loadStats: { cacheHits: number; cacheMisses: number };
}

export interface IEvidenceProvider {
  /** Unique provider id. */
  readonly id: string;
  /** Human-readable name. */
  readonly name: string;
  /** Entity types this provider serves, e.g. ["ap.invoice"]. */
  readonly entityTypes: string[];
  /** Systems the provider reads from. */
  readonly sourceSystems: string[];
  /** Evidence requirements — the assembler computes missing from these. */
  readonly required: RequiredEvidence[];
  /**
   * Assemble this provider's contribution for the request.
   * MUST NOT throw for missing data — emit absence items + missing entries.
   */
  provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Assembly context
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Per-request context. Providers share a memoized load cache so a record is
 * fetched at most once per assembly ("avoid duplicate queries"). Consumers may
 * seed pre-loaded data (the Decision Workspace already loads everything for its
 * other zones) — providers then never re-fetch.
 */
export interface EvidenceAssemblyContext {
  request: EvidenceRequest;
  /** Memoized loader — same key returns the same value per assembly. */
  load<T>(key: string, fn: () => Promise<T>): Promise<T>;
  /** Seed pre-loaded data so providers skip the fetch. */
  seed<T>(key: string, value: T): void;
  /** Read a seeded value. */
  get<T>(key: string): T | undefined;
}
