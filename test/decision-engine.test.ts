/**
 * Phase 22.5 — Decision Intelligence Engine: unit tests
 *
 * Validates the generic reasoning core and the AP invoice reference
 * decision type. The engine is deterministic: rules, policies, risk, and
 * confidence are data evaluated over the normalized DecisionEvidence — no
 * LLM, no probabilities, no free-text recommendations.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  bandFromScore,
  buildRecommendation,
  confidenceScore,
  deriveConfidence,
  evaluateDecision,
  evaluateEvidence,
  evaluatePolicy,
  evaluateRiskFactor,
  evaluateRule,
  explainDecision,
  fromEvidencePackage,
  matchesCondition,
  resetDecisionIntelligenceEngine,
  resetDecisionTypeRegistry,
  transitionTo,
  DecisionTypeRegistry,
  type DecisionEvidence,
  type DecisionRule,
  type EvidenceSnapshot,
  type MissingSnapshot,
} from "@/modules/decision-engine";
import { AP_INVOICE_DECISION_TYPE } from "@/modules/decision-engine/providers/ap-invoice";
import { RECOMMENDATION_LABELS } from "@/modules/decision-engine/types";
import { RISK_ORDER } from "@/modules/decision-engine/risk-engine";
import type { EvidencePackage } from "@/modules/evidence";

// ──────────────────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────────────────

const NOW = "2026-08-05T00:00:00.000Z";

function item(overrides: Partial<EvidenceSnapshot>): EvidenceSnapshot {
  return {
    id: "item",
    groupId: "test",
    sectionId: "entity",
    status: "positive",
    confidence: "high",
    confidenceBasis: "measured",
    timestamp: NOW,
    ...overrides,
  };
}

function missing(overrides: Partial<MissingSnapshot> = {}): MissingSnapshot {
  return {
    id: "gap.required",
    label: "Required record",
    reason: "Needed to decide",
    impact: "blocking",
    sourceSystem: "ap.repository",
    ...overrides,
  };
}

interface ApInvoiceOverrides {
  state?: DecisionEvidence["state"];
  statusLabel?: string;
  stale?: boolean;
  items?: EvidenceSnapshot[];
  missing?: MissingSnapshot[];
  facts?: Record<string, string | number | boolean | null>;
  now?: string;
}

/** A clean, fully-evidenced, low-risk AP invoice → must recommend approve. */
function apInvoiceEvidence(overrides: ApInvoiceOverrides = {}): DecisionEvidence {
  const items: EvidenceSnapshot[] = [
    item({ id: "invoice.none", groupId: "invoice", sectionId: "entity", status: "neutral", confidence: "high", confidenceBasis: "invoice loaded" }),
    item({ id: "match.result", groupId: "matching", sectionId: "financial-context", status: "positive", confidence: "high", confidenceBasis: "overallConfidence 0.92" }),
    item({ id: "match.variance", groupId: "matching", sectionId: "financial-context", status: "positive", confidence: "high", confidenceBasis: "zero variance" }),
    item({ id: "exc.clean", groupId: "exceptions", sectionId: "risk", status: "positive", confidence: "high", confidenceBasis: "no open exceptions" }),
    item({ id: "dup.suspicion", groupId: "duplicate-detection", sectionId: "risk", status: "positive", confidence: "high", confidenceBasis: "no duplicate signal" }),
    item({ id: "vendor.activity", groupId: "vendor", sectionId: "business-context", status: "positive", confidence: "medium", confidenceBasis: "12 prior invoices" }),
    item({ id: "vendor.risk", groupId: "vendor", sectionId: "risk", status: "positive", confidence: "medium", confidenceBasis: "LOW vendor risk" }),
    item({ id: "policy.level", groupId: "policy-checks", sectionId: "policy", status: "neutral", confidence: "high", confidenceBasis: "matrix covers amount" }),
    item({ id: "similar.history", groupId: "similar-cases", sectionId: "history", status: "positive", confidence: "medium", confidenceBasis: "same supplier history" }),
    item({ id: "audit.created", groupId: "transaction-history", sectionId: "timeline", status: "positive", confidence: "high", confidenceBasis: "CREATED event present" }),
  ];
  const facts = {
    netBalance: 1100,
    totalWithTax: 1100,
    highValue: false,
    overdue: false,
    overdueDays: 0,
    openExceptions: false,
    exceptionCount: 0,
    matchConfidence: 0.92,
    matchStatus: "FULL_MATCH",
    vendorRiskLevel: "LOW",
    vendorBlocked: false,
    vendorIsNew: false,
    hasPo: true,
    hasGrn: true,
    approved: false,
    policyApplies: true,
    terminal: false,
  };
  return {
    entityType: "ap.invoice",
    entityId: "inv_1",
    tenantId: "c_1",
    state: "actionable",
    statusLabel: "Matched",
    facts,
    items,
    missing: [],
    stale: false,
    now: NOW,
    ...overrides,
  };
}

function withItem(ev: DecisionEvidence, ...items: EvidenceSnapshot[]): DecisionEvidence {
  return { ...ev, items: [...ev.items, ...items] };
}

function withoutItem(ev: DecisionEvidence, id: string): DecisionEvidence {
  return { ...ev, items: ev.items.filter((i) => i.id !== id) };
}

beforeEach(() => {
  resetDecisionIntelligenceEngine();
  resetDecisionTypeRegistry();
});

// ──────────────────────────────────────────────────────────────────────────────
// Condition matching (rule engine)
// ──────────────────────────────────────────────────────────────────────────────

describe("rule-engine — condition matching", () => {
  it("matches evidence by exact id, group, status, and confidence", () => {
    const ev = apInvoiceEvidence();
    expect(matchesCondition({ kind: "evidence", itemId: "match.result", status: ["positive"], confidence: ["high"] }, ev)).toBe(true);
    expect(matchesCondition({ kind: "evidence", itemId: "match.result", status: ["negative"] }, ev)).toBe(false);
    expect(matchesCondition({ kind: "evidence", groupId: "matching", status: ["positive"] }, ev)).toBe(true);
  });

  it("matches wildcard item ids by prefix", () => {
    const ev = apInvoiceEvidence();
    expect(matchesCondition({ kind: "evidence", itemId: "match.*", status: ["positive"] }, ev)).toBe(true);
    expect(matchesCondition({ kind: "evidence", itemId: "exc.*", status: ["negative", "pending"] }, ev)).toBe(false);
  });

  it("supports string arrays for in / not-in facts", () => {
    const ev = apInvoiceEvidence({ facts: { ...apInvoiceEvidence().facts, vendorRiskLevel: "CRITICAL" } });
    expect(matchesCondition({ kind: "fact", key: "vendorRiskLevel", op: "in", value: ["HIGH", "CRITICAL"] }, ev)).toBe(true);
    expect(matchesCondition({ kind: "fact", key: "vendorRiskLevel", op: "not-in", value: ["HIGH"] }, ev)).toBe(true);
  });

  it("evaluates numeric fact operators", () => {
    const ev = apInvoiceEvidence();
    expect(matchesCondition({ kind: "fact", key: "netBalance", op: "gte", value: 1000 }, ev)).toBe(true);
    expect(matchesCondition({ kind: "fact", key: "netBalance", op: "gt", value: 1000 }, ev)).toBe(true);
    expect(matchesCondition({ kind: "fact", key: "netBalance", op: "lt", value: 1000 }, ev)).toBe(false);
    expect(matchesCondition({ kind: "fact", key: "highValue", op: "eq", value: false }, ev)).toBe(true);
    expect(matchesCondition({ kind: "fact", key: "overdue", op: "truthy" }, ev)).toBe(false);
  });

  it("matches missing evidence, scoped to blocking by default when asked", () => {
    const ev = apInvoiceEvidence({ missing: [missing({ id: "supplier.identity", impact: "blocking" })] });
    expect(matchesCondition({ kind: "missing", impact: "blocking" }, ev)).toBe(true);
    expect(matchesCondition({ kind: "missing", impact: "advisory" }, ev)).toBe(false);
  });

  it("matches metadata staleness", () => {
    const ev = apInvoiceEvidence({ stale: true });
    expect(matchesCondition({ kind: "metadata", stale: true }, ev)).toBe(true);
  });

  it("evaluates anyConditions as OR across groups", () => {
    const ev = apInvoiceEvidence();
    const rule: DecisionRule = {
      id: "r.or",
      label: "OR rule",
      level: "warning",
      conditions: [{ kind: "evidence", itemId: "does.not.exist" }],
      anyConditions: [[{ kind: "evidence", itemId: "match.result", status: ["positive"] }]],
      explanation: "fires via alternative group",
    };
    const res = evaluateRule(rule, ev);
    expect(res.triggered).toBe(true);
    expect(res.level).toBe("warning");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Policy evaluator
// ──────────────────────────────────────────────────────────────────────────────

describe("policy-evaluator", () => {
  it("reports satisfied when applicable", () => {
    const ev = apInvoiceEvidence();
    const policy = AP_INVOICE_DECISION_TYPE.policies.find((p) => p.id === "pol.three-way-match")!;
    const res = evaluatePolicy(policy, ev);
    expect(res.applies).toBe(true);
    expect(res.satisfied).toBe(true);
  });

  it("flags a gap when applicable but unsatisfied", () => {
    const ev = withoutItem(apInvoiceEvidence(), "match.variance");
    const policy = AP_INVOICE_DECISION_TYPE.policies.find((p) => p.id === "pol.three-way-match")!;
    const res = evaluatePolicy(policy, ev);
    expect(res.applies).toBe(true);
    expect(res.satisfied).toBe(false);
  });

  it("is never a pass when it does not apply", () => {
    const ev = withoutItem(apInvoiceEvidence(), "vendor.blocked");
    const policy = AP_INVOICE_DECISION_TYPE.policies.find((p) => p.id === "pol.blocked-vendor")!;
    const res = evaluatePolicy(policy, ev);
    expect(res.applies).toBe(false);
    expect(res.satisfied).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Risk engine
// ──────────────────────────────────────────────────────────────────────────────

describe("risk-engine", () => {
  it("aggregates to the highest triggered severity", () => {
    const ev = apInvoiceEvidence();
    const blocked = evaluateRiskFactor(
      AP_INVOICE_DECISION_TYPE.riskFactors.find((f) => f.id === "risk.blocked-vendor")!,
      ev,
    );
    expect(blocked.triggered).toBe(false);

    const highValue = evaluateRiskFactor(
      AP_INVOICE_DECISION_TYPE.riskFactors.find((f) => f.id === "risk.high-value")!,
      apInvoiceEvidence({ facts: { ...apInvoiceEvidence().facts, highValue: true } }),
    );
    expect(highValue.triggered).toBe(true);
    expect(highValue.severity).toBe("medium");
  });

  it("supports anyConditions on a risk factor (duplicate exception alternative)", () => {
    const ev = withoutItem(apInvoiceEvidence(), "dup.suspicion");
    const withException = withItem(ev, item({ id: "dup.exc.open", groupId: "duplicate-detection", sectionId: "risk", status: "negative", confidence: "high", confidenceBasis: "formal exception open" }));
    const factor = AP_INVOICE_DECISION_TYPE.riskFactors.find((f) => f.id === "risk.duplicate")!;
    expect(evaluateRiskFactor(factor, withException).triggered).toBe(true);
    expect(evaluateRiskFactor(factor, ev).triggered).toBe(false);
  });

  it("never triggers in a clean scenario", () => {
    const ev = apInvoiceEvidence();
    const triggered = evaluateEvidence(ev).risk.factors.filter((f) => f.triggered);
    expect(triggered).toEqual([]);
    expect(evaluateEvidence(ev).risk.level).toBe("low");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Confidence engine
// ──────────────────────────────────────────────────────────────────────────────

describe("confidence-engine", () => {
  it("maps measured scores to categorical bands", () => {
    expect(bandFromScore(0.9, false)).toBe("high");
    expect(bandFromScore(0.5, false)).toBe("moderate");
    expect(bandFromScore(0.2, false)).toBe("low");
    expect(bandFromScore(0.9, true)).toBe("insufficient-evidence");
  });

  it("derives a high band for a fully-clean package", () => {
    const res = deriveConfidence(AP_INVOICE_DECISION_TYPE.confidenceFactors, apInvoiceEvidence());
    expect(res.band).toBe("high");
    expect(res.basis).toContain("clean full match");
    expect(res.basis).toContain("duplicate check clear");
  });

  it("derives insufficient-evidence when a blocking gap exists", () => {
    const ev = apInvoiceEvidence({ missing: [missing()] });
    const res = deriveConfidence(AP_INVOICE_DECISION_TYPE.confidenceFactors, ev);
    expect(res.band).toBe("insufficient-evidence");
    expect(res.basis).toContain("blocking evidence gaps present");
  });

  it("lowers the band when a key factor is missing (partial match)", () => {
    const clean = confidenceScore(AP_INVOICE_DECISION_TYPE.confidenceFactors, apInvoiceEvidence());
    const partial = confidenceScore(
      AP_INVOICE_DECISION_TYPE.confidenceFactors,
      withoutItem(apInvoiceEvidence(), "match.result"),
    );
    expect(partial).toBeLessThan(clean);
    expect(partial).toBeLessThan(0.7);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Recommendation priority
// ──────────────────────────────────────────────────────────────────────────────

describe("synthesizeRecommendation — priority ladder", () => {
  it("approves a clean full match", () => {
    const rec = buildRecommendation(apInvoiceEvidence());
    expect(rec.category).toBe("approve");
    expect(rec.driver).toBe("clean");
    expect(rec.nextAction).toBe("Confirm approval");
  });

  it("cannot-decide on a terminal state", () => {
    const rec = buildRecommendation(apInvoiceEvidence({ state: "terminal", statusLabel: "Paid" }));
    expect(rec.category).toBe("cannot-decide");
    expect(rec.driver).toBe("terminal");
    expect(rec.nextAction).toBeNull();
  });

  it("cannot-decide on a blocking evidence gap — never recommend on blocked info", () => {
    const rec = buildRecommendation(apInvoiceEvidence({ missing: [missing({ label: "Supplier identity" })] }));
    expect(rec.category).toBe("cannot-decide");
    expect(rec.driver).toBe("evidence-gap");
    expect(rec.requiredHumanActions[0]).toContain("Resolve the blocking evidence gaps");
  });

  it("rejects on a confirmed duplicate (block rule beats escalate)", () => {
    const flagged = withItem(
      withoutItem(apInvoiceEvidence(), "dup.suspicion"),
      item({ id: "dup.suspicion", groupId: "duplicate-detection", sectionId: "risk", status: "negative", confidence: "high", confidenceBasis: "duplicate confidence 0.9" }),
    );
    const rec = buildRecommendation(flagged);
    expect(rec.category).toBe("reject");
    expect(rec.driver).toBe("block");
    expect(rec.reason).toContain("Confirmed duplicate invoice");
  });

  it("escalates when authority is undefined on a high-value invoice", () => {
    const ev = withItem(
      apInvoiceEvidence({ facts: { ...apInvoiceEvidence().facts, highValue: true } }),
      item({ id: "policy.none", groupId: "policy-checks", sectionId: "policy", status: "pending", confidence: "low", confidenceBasis: "no matrix entry found" }),
    );
    const rec = buildRecommendation(ev);
    expect(rec.category).toBe("escalate");
    expect(rec.driver).toBe("escalate");
  });

  it("escalates on high or critical supplier risk", () => {
    const ev = apInvoiceEvidence({ facts: { ...apInvoiceEvidence().facts, vendorRiskLevel: "HIGH" } });
    const rec = buildRecommendation(ev);
    expect(rec.category).toBe("escalate");
    expect(rec.driver).toBe("escalate");
  });

  it("needs-review on a partial / unverified match", () => {
    const ev = withItem(
      withoutItem(apInvoiceEvidence(), "match.result"),
      item({ id: "match.result", groupId: "matching", sectionId: "financial-context", status: "pending", confidence: "low", confidenceBasis: "no match result" }),
    );
    const rec = buildRecommendation(ev);
    expect(rec.category).toBe("needs-review");
    expect(rec.driver).toBe("review");
  });

  it("needs-review on an open exception", () => {
    const ev = withItem(
      apInvoiceEvidence(),
      item({ id: "exc.open", groupId: "exceptions", sectionId: "risk", status: "negative", confidence: "high", confidenceBasis: "GL coding required" }),
    );
    const rec = buildRecommendation(ev);
    expect(rec.category).toBe("needs-review");
    expect(rec.requiredHumanActions[0]).toContain("Review the flagged");
  });

  it("approves-with-warning when only a warning rule fires", () => {
    const ev = apInvoiceEvidence({ facts: { ...apInvoiceEvidence().facts, overdue: true, overdueDays: 4 } });
    const rec = buildRecommendation(ev);
    expect(rec.category).toBe("approve-with-warning");
    expect(rec.driver).toBe("warning");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Full decision artifact
// ──────────────────────────────────────────────────────────────────────────────

describe("evaluateDecision — the Decision artifact", () => {
  it("produces a complete, labelled decision", () => {
    const d = evaluateDecision(apInvoiceEvidence());
    expect(d.id).toBe("dec:ap.invoice:inv_1");
    expect(d.recommendation).toBe("approve");
    expect(d.recommendationLabel).toBe(RECOMMENDATION_LABELS.approve);
    expect(d.confidence).toBe("high");
    expect(d.confidenceBasis.length).toBeGreaterThan(0);
    expect(d.riskAssessment.level).toBe("low");
    expect(d.missingEvidence).toEqual([]);
  });

  it("builds a serializable reasoning graph with evidence → rule → decision edges", () => {
    const d = evaluateDecision(apInvoiceEvidence());
    const kinds = d.reasoningGraph.nodes.map((n) => n.kind);
    expect(kinds).toContain("evidence");
    expect(kinds).toContain("rule");
    expect(kinds).toContain("policy");
    expect(kinds).toContain("risk");
    expect(kinds).toContain("confidence");
    expect(kinds).toContain("decision");
    const decisionNode = d.reasoningGraph.nodes.find((n) => n.kind === "decision")!;
    expect(decisionNode.label).toBe("approve");
    expect(decisionNode.data.confidence).toBe("high");
    expect(d.reasoningGraph.edges.some((e) => e.to === decisionNode.id && e.label === "qualifies")).toBe(true);
    expect(d.reasoningGraph.edges.some((e) => e.to === decisionNode.id && e.label === "triggers")).toBe(false);
  });

  it("records the audited lifecycle transitions and version", () => {
    const d = evaluateDecision(apInvoiceEvidence());
    expect(d.audit.lifecycle).toBe("recommended");
    expect(d.audit.transitions.map((t) => `${t.from}→${t.to}`)).toEqual(["created→evaluated", "evaluated→recommended"]);
    expect(d.audit.engineVersion).toBe("1.0.0");
    expect(d.version).toBe("1.0.0");
  });

  it("is deterministic — same input hashes to the same digest, different input differs", () => {
    const a = evaluateDecision(apInvoiceEvidence({ now: "2026-08-05T00:00:00.000Z" }));
    const b = evaluateDecision(apInvoiceEvidence({ now: "2026-08-06T00:00:00.000Z" }));
    const c = evaluateDecision(apInvoiceEvidence({ stale: true }));
    expect(a.audit.determinismHash).toBe(b.audit.determinismHash);
    expect(a.audit.determinismHash).not.toBe(c.audit.determinismHash);
  });

  it("rejects a blocked vendor (blocking rule + critical risk)", () => {
    const ev = withItem(
      apInvoiceEvidence(),
      item({ id: "vendor.blocked", groupId: "vendor", sectionId: "risk", status: "negative", confidence: "high", confidenceBasis: "payment blacklist" }),
    );
    const d = evaluateDecision(ev);
    expect(d.recommendation).toBe("reject");
    expect(d.riskAssessment.level).toBe("critical");
    expect(d.requiredHumanActions).toContain("Rejection is irreversible — confirm before acting.");
  });

  it("lists supporting evidence ids for the triggered signals", () => {
    const ev = withItem(
      apInvoiceEvidence({ facts: { ...apInvoiceEvidence().facts, highValue: true } }),
      item({ id: "policy.none", groupId: "policy-checks", sectionId: "policy", status: "pending", confidence: "low", confidenceBasis: "no matrix entry" }),
    );
    const d = evaluateDecision(ev);
    expect(d.supportingEvidence).toContain("policy.none");
    expect(d.alternativeOutcomes.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Registry
// ──────────────────────────────────────────────────────────────────────────────

describe("DecisionTypeRegistry", () => {
  it("registers, requires, and lists configs", () => {
    const registry = new DecisionTypeRegistry();
    registry.register(AP_INVOICE_DECISION_TYPE);
    expect(registry.has("ap.invoice")).toBe(true);
    expect(registry.require("ap.invoice").label).toBe("AP Invoice Approval");
    expect(registry.list()).toHaveLength(1);
  });

  it("rejects duplicate registration", () => {
    const registry = new DecisionTypeRegistry();
    registry.register(AP_INVOICE_DECISION_TYPE);
    expect(() => registry.register(AP_INVOICE_DECISION_TYPE)).toThrow(/already registered/);
  });

  it("requires a registered type before evaluation", () => {
    expect(() => evaluateDecision(apInvoiceEvidence())).not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────────────────────────────────────────────

describe("lifecycle", () => {
  it("transitions along the legal chain", () => {
    const r = transitionTo("recommended", "human-reviewed", "analyst", NOW, "case review");
    expect(r.state).toBe("human-reviewed");
    expect(r.transition.from).toBe("recommended");
    expect(r.transition.actor).toBe("analyst");
  });

  it("throws on illegal transitions", () => {
    expect(() => transitionTo("created", "approved", "analyst", NOW)).toThrow(/Illegal decision transition/);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Explanation
// ──────────────────────────────────────────────────────────────────────────────

describe("explainDecision", () => {
  it("assembles a fixed-text, evidence-grounded explanation", () => {
    const ex = explainDecision(apInvoiceEvidence());
    expect(ex.summary).toContain(RECOMMENDATION_LABELS.approve);
    expect(ex.riskSummary).toContain("Risk level Low");
    expect(ex.policyReferences.map((p) => p.policyId)).toEqual(["pol.three-way-match", "pol.approval-authority"]);
    expect(ex.nextAction).toBe("Confirm approval");
    expect(ex.alternativeOutcomes.length).toBeGreaterThan(0);
  });

  it("discloses blocking gaps and control gaps", () => {
    const ex = explainDecision(
      apInvoiceEvidence({ missing: [missing({ label: "Supplier identity" })] }),
    );
    expect(ex.evidenceGaps[0].impact).toBe("blocking");
    expect(ex.reasoning.some((l) => l.includes("Blocking evidence gap"))).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Adapter — fromEvidencePackage
// ──────────────────────────────────────────────────────────────────────────────

describe("fromEvidencePackage", () => {
  it("projects package sections, missing evidence, staleness, and facts", () => {
    const pkg: EvidencePackage = {
      request: { entityType: "ap.invoice", entityId: "inv_1", tenantId: "c_1", now: NOW },
      sections: [
        {
          id: "financial-context",
          title: "Financial Context",
          description: null,
          items: [
            {
              id: "match.result",
              sectionId: "financial-context",
              groupId: "matching",
              title: "Three-way match",
              summary: "Full match",
              reason: "Variance check",
              source: { system: "ap.repository", type: "ThreeWayMatch", id: "m_1", at: NOW },
              timestamp: NOW,
              importance: "high",
              related: ["inv_1"],
              expandable: true,
              status: "positive",
              confidence: "high",
              confidenceBasis: "overallConfidence 0.92",
              evidence: [],
              order: 1,
            },
          ],
        },
      ],
      missing: [
        {
          id: "supplier.identity",
          sectionId: "identity",
          label: "Supplier identity",
          reason: "Required to pay",
          impact: "blocking",
          canProceed: false,
          sourceSystem: "ap.repository",
        },
      ],
      metadata: {
        assembledAt: NOW,
        evidenceVersion: "1.0.0",
        entityType: "ap.invoice",
        entityId: "inv_1",
        tenantId: "c_1",
        providerIds: ["ap-vendor"],
        sourceSystems: ["ap.repository"],
        itemCount: 1,
        duplicatesSkipped: 0,
        sections: ["financial-context"],
        decisionReady: false,
        freshness: { oldestTimestamp: NOW, newestTimestamp: NOW, stale: true },
        contentHash: "abc",
      },
    };

    const ev = fromEvidencePackage(pkg, {
      state: "actionable",
      statusLabel: "Matched",
      facts: { netBalance: 1100, highValue: false },
    });
    expect(ev.entityType).toBe("ap.invoice");
    expect(ev.entityId).toBe("inv_1");
    expect(ev.state).toBe("actionable");
    expect(ev.statusLabel).toBe("Matched");
    expect(ev.stale).toBe(true);
    expect(ev.items).toHaveLength(1);
    expect(ev.items[0].id).toBe("match.result");
    expect(ev.items[0].groupId).toBe("matching");
    expect(ev.missing).toHaveLength(1);
    expect(ev.missing[0].impact).toBe("blocking");
    expect(ev.facts).toEqual({ netBalance: 1100, highValue: false });
    expect(ev.now).toBe(NOW);
  });
});
