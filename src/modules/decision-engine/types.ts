/**
 * Phase 22.5 — Decision Intelligence Engine: Canonical types
 *
 * The canonical enterprise reasoning layer (Product System 06 — Decision
 * Intelligence, 12 — AI, 20 — Product Constitution). This module is the SINGLE
 * source of truth for recommendation derivation: evidence → evaluation →
 * reasoning → recommendation → human decision → audit.
 *
 * The engine is deterministic enterprise reasoning — NOT an AI engine, NOT an
 * LLM. It answers "what is the safest and most justifiable recommendation
 * given the available evidence?" and never makes a financial decision.
 *
 * Core guarantees (DI-P3, DI-P4, DI-P5, DI-P7):
 *   - No recommendation without evidence (the Evidence Package is the input).
 *   - Categorical recommendation states — never a free-text recommendation.
 *   - Confidence bands derived from measured factors — never a fabricated scalar.
 *   - Every recommendation exposes a serializable reasoning graph.
 *   - Alternatives ("why not this") are mandatory.
 *
 * The core is generic. AP concepts live ONLY in providers/ap-invoice.ts.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Recommendation (DI-R2, PP-109)
// ──────────────────────────────────────────────────────────────────────────────

/** Canonical recommendation states. No free-text recommendations. */
export type RecommendationCategory =
  | "approve"
  | "approve-with-warning"
  | "needs-review"
  | "escalate"
  | "reject"
  | "cannot-decide";

export const RECOMMENDATION_LABELS: Record<RecommendationCategory, string> = {
  approve: "Approve",
  "approve-with-warning": "Approve with warning",
  "needs-review": "Needs review",
  escalate: "Escalate",
  reject: "Reject",
  "cannot-decide": "Cannot decide",
};

// ──────────────────────────────────────────────────────────────────────────────
// Confidence (DI-P4, Measured-Confidence Doctrine)
// ──────────────────────────────────────────────────────────────────────────────

/** Decision confidence bands — derived, never a scalar percentage. */
export type DecisionConfidence = "high" | "moderate" | "low" | "insufficient-evidence";

export const DECISION_CONFIDENCE_LABELS: Record<DecisionConfidence, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
  "insufficient-evidence": "Insufficient evidence",
};

// ──────────────────────────────────────────────────────────────────────────────
// Risk (Risk Engine)
// ──────────────────────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskCategory =
  | "supplier"
  | "operational"
  | "financial"
  | "fraud"
  | "duplicate"
  | "policy"
  | "timeline";

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// ──────────────────────────────────────────────────────────────────────────────
// Evidence input — normalized, domain-neutral
// ──────────────────────────────────────────────────────────────────────────────

/** Measured domain fact exposed by an adapter. Booleans/numbers/strings only. */
export type FactValue = string | number | boolean | null;

export type EvidenceStatus = "positive" | "negative" | "neutral" | "pending" | "action";

export type EvidenceConfidence = "high" | "medium" | "low" | "none";

/**
 * A normalized snapshot of one evidence item. Any evidence source can be
 * projected into this shape — an EvidencePackage section item, a workspace
 * EvidenceGroup item, or a domain's own collection.
 */
export interface EvidenceSnapshot {
  id: string;
  groupId: string;
  sectionId?: string;
  status: EvidenceStatus;
  confidence: EvidenceConfidence;
  confidenceBasis?: string;
  timestamp?: string | null;
}

export interface MissingSnapshot {
  id: string;
  label: string;
  reason: string;
  impact: "blocking" | "advisory";
  sourceSystem?: string;
}

/**
 * The normalized input to decision evaluation. Built by an adapter (from an
 * EvidencePackage or a domain's loaded records). `facts` carries the measured
 * values rules/policies/risk/confidence reference; `state` tells the engine
 * whether a decision is even pending on this entity.
 */
export interface DecisionEvidence {
  entityType: string;
  entityId: string;
  tenantId: string;
  /** "actionable" (decision pending) or "terminal" (already decided/finalized). */
  state: "actionable" | "terminal";
  /** Current object status label, when known. */
  statusLabel?: string;
  /** Measured facts, e.g. { netBalance: 1100, matchConfidence: 0.92 }. */
  facts: Record<string, FactValue>;
  /** Normalized evidence items. */
  items: EvidenceSnapshot[];
  /** Missing evidence — blocking gaps and advisory gaps. */
  missing: MissingSnapshot[];
  /** True when the underlying evidence is stale (older than the threshold). */
  stale?: boolean;
  /** Injectable evaluation time — keeps packages time-stable in tests. */
  now?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Conditions — the declarative rule/policy DSL (deterministic, no prose)
// ──────────────────────────────────────────────────────────────────────────────

export interface EvidenceCondition {
  kind: "evidence";
  /** Exact item id(s); a field omitted = wildcard. */
  itemId?: string | string[];
  groupId?: string | string[];
  sectionId?: string;
  status?: EvidenceStatus[];
  confidence?: EvidenceConfidence[];
}

export interface MissingCondition {
  kind: "missing";
  /** Blocking-only when set. */
  impact?: "blocking" | "advisory";
  /** Exact or id-prefix match. */
  id?: string;
}

export interface MetadataCondition {
  kind: "metadata";
  decisionReady?: boolean;
  stale?: boolean;
}

export type FactOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not-in" | "truthy";

export interface FactCondition {
  kind: "fact";
  key: string;
  op: FactOperator;
  /** Scalar or array (for in / not-in). */
  value?: FactValue | FactValue[];
}

export type RuleCondition = EvidenceCondition | MissingCondition | MetadataCondition | FactCondition;

// ──────────────────────────────────────────────────────────────────────────────
// Rules (Rule Engine)
// ──────────────────────────────────────────────────────────────────────────────

export type RuleLevel = "block" | "escalate" | "review" | "warning" | "pass";

export interface DecisionRule {
  id: string;
  label: string;
  /** The level this rule pushes the recommendation toward when triggered. */
  level: RuleLevel;
  /** All conditions must match. */
  conditions: RuleCondition[];
  /** Alternative groups — each group must fully match (OR across groups). */
  anyConditions?: RuleCondition[][];
  /** Structured explanation — fixed text, never prose assembled at runtime. */
  explanation: string;
  /** Evidence item ids this rule references (supporting evidence). */
  evidenceIds?: string[];
}

export interface RuleEvaluation {
  ruleId: string;
  label: string;
  triggered: boolean;
  level: RuleLevel | null;
  evidenceIds: string[];
  reason: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Policies (Policy Evaluator)
// ──────────────────────────────────────────────────────────────────────────────

export type PolicyCategory =
  | "approval-authority"
  | "segregation-of-duties"
  | "compliance"
  | "internal-control"
  | "business-policy"
  | "approval-matrix"
  | "fraud-control";

export interface DecisionPolicy {
  id: string;
  name: string;
  category: PolicyCategory;
  /** All must match for the policy to APPLY to this entity. */
  appliesWhen: RuleCondition[];
  /** All must match for the policy to be SATISFIED. */
  satisfiedWhen: RuleCondition[];
  explanation: string;
}

export interface PolicyEvaluation {
  policyId: string;
  name: string;
  category: PolicyCategory;
  applies: boolean;
  /** null when the policy does not apply. */
  satisfied: boolean | null;
  reason: string;
  evidenceIds: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Risk factors (Risk Engine)
// ──────────────────────────────────────────────────────────────────────────────

export interface RiskFactorDef {
  id: string;
  label: string;
  category: RiskCategory;
  severity: RiskLevel;
  conditions: RuleCondition[];
  anyConditions?: RuleCondition[][];
  evidenceIds?: string[];
}

export interface RiskFactorResult {
  id: string;
  label: string;
  category: RiskCategory;
  severity: RiskLevel;
  triggered: boolean;
  evidenceIds: string[];
  reason: string | null;
}

export interface RiskAssessment {
  /** Aggregate rating — the maximum triggered severity with explanation. */
  level: RiskLevel;
  factors: RiskFactorResult[];
  explanation: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Confidence factors (Confidence Engine)
// ──────────────────────────────────────────────────────────────────────────────

export interface ConfidenceFactorDef {
  id: string;
  label: string;
  /** Positive contributes up; negative contributes down. */
  direction: "positive" | "negative";
  /** Relative weight within the factor set (0..1). */
  weight: number;
  conditions: RuleCondition[];
}

export interface ConfidenceFactorResult {
  id: string;
  label: string;
  direction: "positive" | "negative";
  triggered: boolean;
  reason: string | null;
}

export interface DecisionConfidenceResult {
  band: DecisionConfidence;
  factors: ConfidenceFactorResult[];
  /** Names the measured inputs behind the band — never a fake scalar. */
  basis: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Reasoning graph (DI-P5)
// ──────────────────────────────────────────────────────────────────────────────

export type ReasoningNodeKind = "evidence" | "rule" | "policy" | "risk" | "confidence" | "decision";

export interface ReasoningNode {
  id: string;
  kind: ReasoningNodeKind;
  label: string;
  /** Ids of other nodes this node derives from. */
  references: string[];
  /** Serializable summary — status/confidence/level, never prose walls. */
  data: Record<string, string | number | boolean | null>;
}

export interface ReasoningEdge {
  from: string;
  to: string;
  label: string;
}

export interface ReasoningGraph {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Decision lifecycle (06 §10)
// ──────────────────────────────────────────────────────────────────────────────

export type DecisionLifecycleState =
  | "created"
  | "evaluated"
  | "recommended"
  | "human-reviewed"
  | "approved"
  | "rejected"
  | "escalated"
  | "reopened"
  | "closed";

export interface LifecycleTransition {
  from: DecisionLifecycleState;
  to: DecisionLifecycleState;
  at: string;
  actor: string;
  reason: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// The Decision (06 §9, §10)
// ──────────────────────────────────────────────────────────────────────────────

export interface DecisionAuditMetadata {
  engineVersion: string;
  lifecycle: DecisionLifecycleState;
  /** Append-only in-memory transition chain for the current evaluation. */
  transitions: LifecycleTransition[];
  /** Determinism digest: sha256 over inputs + factor ids + engine version. */
  determinismHash: string;
  sourceSystems: string[];
}

export interface Decision {
  id: string;
  type: string;
  entity: { type: string; id: string };
  statusLabel: string | null;
  recommendation: RecommendationCategory;
  recommendationLabel: string;
  confidence: DecisionConfidence;
  confidenceBasis: string;
  reasoningGraph: ReasoningGraph;
  triggeredRules: RuleEvaluation[];
  triggeredPolicies: PolicyEvaluation[];
  supportingEvidence: string[];
  missingEvidence: MissingSnapshot[];
  riskAssessment: RiskAssessment;
  requiredHumanActions: string[];
  alternativeOutcomes: string[];
  audit: DecisionAuditMetadata;
  version: string;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Explanations (06 §6)
// ──────────────────────────────────────────────────────────────────────────────

export interface DecisionExplanation {
  summary: string;
  reasoning: string[];
  supportingEvidence: string[];
  evidenceGaps: MissingSnapshot[];
  policyReferences: { policyId: string; name: string; satisfied: boolean | null }[];
  riskSummary: string;
  nextAction: string | null;
  alternativeOutcomes: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Decision type configuration (registry)
// ──────────────────────────────────────────────────────────────────────────────

export interface DecisionTypeConfig {
  entityType: string;
  label: string;
  rules: DecisionRule[];
  policies: DecisionPolicy[];
  riskFactors: RiskFactorDef[];
  confidenceFactors: ConfidenceFactorDef[];
}
