/**
 * Phase 22.3 — Decision Workspace: Types
 *
 * The Decision Workspace is the canonical Perionyx financial decision surface
 * (Product System 06 — Decision Intelligence). Every value exposed to the
 * surface is either measured data, a derived categorical band with a basis,
 * or a human explanation. No fabricated scalars.
 */

import type {
  VendorInvoice,
  Vendor,
  POReference,
  GRNReference,
  InvoiceLineItem,
  InvoiceAttachment,
  ThreeWayMatch,
  InvoiceException,
  ApprovalRecord,
  APAuditRecord,
  PaymentRecord,
  VendorCredit,
  VendorInvoiceStatus,
} from "@/server/procurement/ap-repositories/types";

import type { Decision as DecisionIntelligenceDecision } from "@/modules/decision-engine";

// ──────────────────────────────────────────────────────────────────────────────
// Evidence (06 §3 — Evidence Package)
// ──────────────────────────────────────────────────────────────────────────────

export type EvidenceStatus = "positive" | "negative" | "neutral" | "pending" | "action";

/** Categorical confidence band with mandatory basis (DI-R2, DI-P4). */
export type EvidenceConfidence = "high" | "medium" | "low" | "none";

export interface EvidenceItem {
  id: string;
  groupId: string;
  label: string;
  value: string;
  status: EvidenceStatus;
  confidence: EvidenceConfidence;
  /** What was actually measured/observed — never "from the model". */
  confidenceBasis: string;
  /** Supporting record references (human labels + ids). */
  evidence: string[];
  timestamp: string | null;
  /** Related record ids (invoice/PO/GRN/vendor). */
  related: string[];
  /** The "so what" for a CFO/Controller. */
  whyItMatters: string;
  expandable?: boolean;
}

export interface EvidenceGroup {
  id: string;
  title: string;
  description: string;
  order: number;
  items: EvidenceItem[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Recommendation (DI-R3, DI-P7)
// ──────────────────────────────────────────────────────────────────────────────

export type RecommendationCategory = "approve" | "review" | "reject" | "no-signal";

export interface RiskFactor {
  severity: "high" | "medium" | "low";
  label: string;
}

export interface Recommendation {
  category: RecommendationCategory;
  confidence: EvidenceConfidence;
  /** What drove the category — a plain-language basis. */
  basis: string;
  /** Evidence item ids that support this recommendation. */
  supportingEvidence: string[];
  /** What is missing from the evidence package. */
  evidenceGaps: string[];
  riskFactors: RiskFactor[];
  /** "Why not the other action" (DI-P7). */
  alternatives: string[];
  suggestedAction: string | null;
  derivedAt: string;
  /** Reserved for DI platform output. Never a fabricated scalar. */
  ai: null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Decision Summary (left zone)
// ──────────────────────────────────────────────────────────────────────────────

export interface DecisionSummary {
  status: { label: string; explanation: string };
  recommendation: Recommendation;
  risks: RiskFactor[];
  requiredAction: string | null;
  businessImpact: {
    exposure: string;
    overdueDays: number | null;
    aging: string;
    highValue: boolean;
  } | null;
  policy: { label: string; threshold: string; applies: boolean } | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Decision Timeline (06 §9, F-39)
// ──────────────────────────────────────────────────────────────────────────────

export type TimelineAction =
  | "CREATED"
  | "STATUS_CHANGED"
  | "UPDATED"
  | "APPROVED"
  | "REJECTED"
  | "DELEGATED"
  | "ESCALATED"
  | "EXCEPTION"
  | "RESOLVED"
  | "PAID"
  | "VOIDED";

export interface TimelineEntry {
  id: string;
  at: string;
  actor: string;
  actorRole: string | null;
  action: TimelineAction;
  detail: string;
  evidence: string[];
  outcome: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Decision Actions (right zone)
// ──────────────────────────────────────────────────────────────────────────────

export type AvailableAction =
  | "approve"
  | "reject"
  | "escalate"
  | "block"
  | "dispute"
  | "void";

export interface ActionContext {
  available: AvailableAction[];
  /** Actions that require a free-text reason (min length enforced server-side). */
  requiresReason: AvailableAction[];
  terminal: boolean;
  /** Consequence preview per available action (DI-P8, F-37). */
  consequence: Record<AvailableAction, string>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Assembled surface
// ──────────────────────────────────────────────────────────────────────────────

export interface DecisionWorkspaceData {
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  status: { label: string; explanation: string };
  summary: DecisionSummary;
  evidenceGroups: EvidenceGroup[];
  timeline: TimelineEntry[];
  actions: ActionContext;
  /**
   * Phase 22.5 — Decision Intelligence output. Additive: the Phase 22.3
   * `summary.recommendation` surface stays authoritative for the current UI;
   * this is the canonical engine-derived decision artifact.
   */
  decision: DecisionIntelligenceDecision;
  /** Compact context the action panel needs for confirmations. */
  context: {
    status: VendorInvoiceStatus;
    totalWithTax: number;
    vendorName: string;
    terminal: boolean;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Evidence assembly input (what the workspace service gathers)
// ──────────────────────────────────────────────────────────────────────────────

export interface WorkspaceEvidenceInput {
  invoice: VendorInvoice;
  vendor: Vendor | null;
  lineItems: InvoiceLineItem[];
  attachments: InvoiceAttachment[];
  exceptions: InvoiceException[];
  approvals: ApprovalRecord[];
  match: ThreeWayMatch | null;
  audit: APAuditRecord[];
  payments: PaymentRecord[];
  openCredits: VendorCredit[];
  recentInvoices: VendorInvoice[];
  approvalLevels: ApprovalLevelInput[];
  po: POReference | null;
  grn: GRNReference | null;
}

export interface ApprovalLevelInput {
  levelNumber: number;
  levelName: string;
  minAmount: number;
  maxAmount: number | null;
  requiredRoles: string[];
}

export type { VendorInvoice };
