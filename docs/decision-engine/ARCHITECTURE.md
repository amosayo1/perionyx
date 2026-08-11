# Decision Intelligence Engine — Architecture (Phase 22.5)

## 1. Purpose

The Decision Intelligence Engine is the canonical **enterprise reasoning layer** of Perionyx (Product System 06 — Decision Intelligence, 12 — AI, 20 — Product Constitution). It consumes a normalized evidence snapshot and produces:

1. A **categorical recommendation** (6 states, never free text)
2. A **confidence band** derived from measured factors (never a fabricated scalar)
3. A **risk assessment** (aggregate severity with contributing factors)
4. A **serializable reasoning graph** (evidence → rule → policy → risk → decision)
5. An **audit trail** (lifecycle transitions + determinism hash)

The engine is **deterministic enterprise reasoning — NOT an AI engine, NOT an LLM**. It answers *"what is the safest and most justifiable recommendation given the available evidence?"* and **never makes a financial decision** (PP-102, DI-R1). A future LLM capability may only summarize the deterministic reasoning graph; it may never replace it.

> First principle: *The engine explains the decision but never makes it.*

## 2. Module Layout

```
src/modules/decision-engine/
├── index.ts                     # Barrel + facade (lazy engine singleton)
├── types.ts                     # Canonical types (418 lines, single source of truth)
├── rule-engine.ts               # Declarative condition DSL + rule evaluation
├── policy-evaluator.ts          # appliesWhen / satisfiedWhen evaluation
├── risk-engine.ts               # Risk factor evaluation + aggregate severity
├── confidence.ts                # Measured confidence bands (never scalars)
├── reasoning.ts                 # Serializable reasoning graph builder
├── explanations.ts              # Fixed-text, evidence-grounded explanations
├── recommendation.ts            # Deterministic priority ladder
├── lifecycle.ts                 # Legal decision state transitions
├── registry.ts                  # DecisionTypeRegistry (extensibility)
├── adapters/
│   └── from-evidence.ts         # EvidencePackage → DecisionEvidence projection
└── providers/
    └── ap-invoice.ts            # Reference decision type: ap.invoice (AP approval)
```

## 3. Canonical Pipeline

```
EvidencePackage (22.4) ──fromEvidencePackage()──▶ DecisionEvidence
                                                    │
                      ┌─────────────┬───────────────┼────────────────┬───────────────┐
                      ▼             ▼               ▼                ▼               ▼
                 RuleEngine    PolicyEvaluator   RiskEngine     ConfidenceEngine  (metadata)
                      │             │               │                │               │
                      └─────────────┴───────────────┼────────────────┘───────────────┘
                                                    ▼
                                          synthesizeRecommendation()
                                                    │
                                                    ▼
                              Decision { reasoningGraph, audit, alternatives }
```

`DecisionIntelligenceEngine` exposes four deterministic capabilities:

| Capability | Returns | Purpose |
|---|---|---|
| `evaluateEvidence(evidence)` | `DecisionEvaluation` | Rules + policies + risk + confidence |
| `buildRecommendation(evidence)` | `RecommendationResult` | The categorical recommendation |
| `evaluateDecision(evidence)` | `Decision` | Full artifact with reasoning graph + audit |
| `explainDecision(evidence)` | `DecisionExplanation` | Human-readable, evidence-grounded |

## 4. The Normalized Input — `DecisionEvidence`

Any evidence source can be projected into this shape:

```ts
interface DecisionEvidence {
  entityType: string;        // "ap.invoice"
  entityId: string;          // "inv_1"
  tenantId: string;          // tenant isolation is absolute
  state: "actionable" | "terminal";  // is a decision even pending?
  statusLabel?: string;      // current object status
  facts: Record<string, FactValue>;  // measured booleans/numbers/strings
  items: EvidenceSnapshot[]; // normalized evidence items
  missing: MissingSnapshot[]; // blocking + advisory gaps
  stale?: boolean;           // evidence older than the threshold
  now?: string;              // injectable time (test stability)
}
```

**Contract:** the engine never fabricates facts. `facts` are provided by the caller (the workspace `buildDecisionFacts()` reads real records); numeric thresholds never come from formatted strings (the workspace formats money only for display, in exactly one `format.ts`).

## 5. The Declarative Condition DSL

All four engines share the **single evaluator** `matchCondition()` in `rule-engine.ts`. Conditions reference only evidence items, measured facts, missing gaps, and metadata — there are no free-text or LLM-generated rules (PP-105, DI-P7).

```ts
type RuleCondition =
  | { kind: "evidence"; itemId?; groupId?; sectionId?; status?; confidence? }  // wildcard "exc.*" supported
  | { kind: "fact"; key; op: "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"in"|"not-in"|"truthy"; value? }
  | { kind: "missing"; impact?: "blocking"|"advisory"; id? }                    // id-prefix wildcard supported
  | { kind: "metadata"; decisionReady?; stale? };
```

- `evidence` conditions match by exact item id, `*`-suffix wildcard, group, section, status, and/or confidence.
- `anyConditions: RuleCondition[][]` provides OR across alternative groups (each group must fully match). Used for `risk.duplicate` (suspicion **or** formal exception) and general rule OR logic.
- `missing` conditions scope by impact — a `blocking` query matches only blocking gaps; an `advisory` query matches only advisory gaps.

## 6. The Four Engines

### 6.1 Rule Engine — `rule-engine.ts`
Each `DecisionRule` has a `level`: `block | escalate | review | warning | pass`. A rule is *triggered* when all its conditions match (or an alternative group matches). `RULE_LEVEL_ORDER` ranks levels (block = most severe).

### 6.2 Policy Evaluator — `policy-evaluator.ts`
Each `DecisionPolicy` declares `appliesWhen` and `satisfiedWhen`. A policy that does not apply is reported as **not applicable** — it is never a pass. A policy that applies and is unsatisfied flags a **control gap** (PP-201, DI-P7). The recommendation and explanation surface unsatisfied applicable policies explicitly.

### 6.3 Risk Engine — `risk-engine.ts`
Each `RiskFactorDef` declares trigger conditions and a `severity`. Triggered factors contribute their severity; the **aggregate rating is the highest triggered severity** with an explanation naming the contributors. Risk factors are structural — they exist whether or not they trigger, so the reasoning graph shows a risk was checked and cleared.

### 6.4 Confidence Engine — `confidence.ts`
Confidence is **never used to make the recommendation** — it qualifies the recommendation's trustworthiness. Each factor declares a direction and relative weight:

```
score = (Σ triggered positive weights − Σ triggered negative weights) / Σ ALL weights
```

Dividing by *all* weights means missing positives genuinely lower confidence rather than only raising it. The ratio maps to one of four categorical bands: `high (≥0.7) · moderate (≥0.4) · low · insufficient-evidence`. `basis` names exactly which measured factors drove the band. A blocking evidence gap forces `insufficient-evidence` regardless of score.

## 7. Recommendation Priority (Deterministic)

```
1. terminal state            → cannot-decide   (no decision pending)
2. blocking evidence gap     → cannot-decide   (never recommend on blocked info)
3. block rule                → reject
4. escalate rule OR risk ≥ high → escalate
5. review rule OR risk medium OR unsatisfied policy → needs-review
6. warning rule              → approve-with-warning
7. otherwise                 → approve
```

Each result carries a `driver` (the winning branch), a fixed `reason`, `triggeredRules`, `requiredHumanActions`, and a `nextAction`. The category is one of six canonical states (`RECOMMENDATION_LABELS`) — **never free text**.

## 8. Reasoning Graph (DI-P5)

`buildReasoningGraph()` produces a serializable, deterministically ordered graph:

- **evidence** nodes (one per item, with status/confidence/groupId)
- **rule** nodes (edges `evidence → rule` labelled "supports")
- **policy** nodes (edges "checks")
- **risk** nodes (edges "indicates")
- **confidence** nodes (edges `confidence → decision` labelled "qualifies")
- one **decision** node (label = recommendation, data = confidence + risk + state)

Triggered rules/risks and applicable policies edge into the decision node ("triggers" / "governs" / "raises"). This is the tamper-evident "why" a CFO can re-derive by hand.

## 9. Decision Lifecycle

`LEGAL_TRANSITIONS` governs the state machine (`created → evaluated → recommended → human-reviewed → approved/rejected/escalated → closed`, plus `reopened`). `transitionTo()` throws on illegal transitions. The engine records the audited chain `created→evaluated→recommended` on every evaluation; persistence is owned by consumers (the workspace service), keeping the core stateless and replaceable.

## 10. Determinism & Audit

Every `Decision` carries:

```ts
audit: {
  engineVersion,            // DECISION_ENGINE_VERSION = "1.0.0"
  lifecycle: "recommended",
  transitions: [...],       // append-only chain
  determinismHash,          // sha256 over evidence (now stripped) + factor ids + version
  sourceSystems,            // from item sections/groups + missing source systems
}
```

Two evaluations of identical evidence produce **identical** decisions and hashes — `now` is excluded from the hash. This makes the engine auditable, testable, and safe for regulators: the recommendation is reproducible from the evidence.

## 11. Registry-Based Extensibility (Law 3)

Adding a new decision domain = registering a `DecisionTypeConfig` keyed by `entityType`. The engine is **never modified** for a new domain:

```ts
getDecisionTypeRegistry().register({ entityType: "ap.invoice", rules, policies, riskFactors, confidenceFactors });
```

`DecisionTypeRegistry` rejects duplicate registration. The facade (`index.ts`) lazily registers AP providers on first use; `resetDecisionIntelligenceEngine()` / `resetDecisionTypeRegistry()` are test hooks.

## 12. The Reference Decision Type — `ap.invoice`

The first registered config, fully declarative (see `providers/ap-invoice.ts`):

- **12 rules** — 3 block (inv.duplicate, inv.duplicate-exception, inv.blocked-vendor), 2 escalate (inv.authority-escalation, inv.vendor-risk-escalation), 4 review (inv.match-review, inv.exception-review, inv.policy-gap, inv.stale-evidence), 3 warning (inv.overdue-warning, inv.first-supplier-warning, inv.open-credit-warning)
- **4 policies** — pol.three-way-match, pol.approval-authority, pol.blocked-vendor, pol.duplicate-control
- **8 risk factors** — critical (blocked vendor), high (duplicate, vendor risk), medium (no-match, unresolved exception, high-value), low (overdue, first supplier)
- **11 confidence factors** — 6 positive / 5 negative, weights sum to 1.0 (clean package → `high`)
- **`AP_DECISION_FACT_KEYS`** — the 17-key measured-facts contract the workspace must provide

Rule conditions reference the canonical Phase 22.4 evidence item ids (`match.result`, `dup.suspicion`, `vendor.blocked`, `exc.*`, `policy.none`, `policy.level`, `similar.none`, `credit.open`, `audit.*`) and measured facts (`highValue`, `overdue`, `vendorRiskLevel`, …).

## 13. Integration with the Decision Workspace (additive)

`src/modules/decision-workspace/workspace-service.ts` feeds the **same** evidence package it already assembles for the 14-group layout into the engine:

```
assembleEvidencePackage(input)            # Phase 22.4 providers (seeded with loaded records)
  ├─ projectEvidenceGroups(pkg, invoice)  # 14-group workspace layout (unchanged)
  └─ evaluateDecision(fromEvidencePackage(pkg, {
       state, statusLabel, facts: buildDecisionFacts(loaded) }))
```

`buildDecisionFacts()` reads real record fields (netBalance, highValue ≥ $25K threshold, overdue via ageDays, open exceptions from OPEN/IN_REVIEW/ESCALATED, match confidence, vendor risk/blocked, PO/GRN presence, approval state). `DecisionWorkspaceData` gains one additive field: `decision: Decision`. The Phase 22.3 `summary.recommendation` remains the UI contract; no API surface was added and no existing field was changed.

## 14. Legacy Boundary

`src/modules/decision-intelligence/` is a **separate, older Phase 7 module** (scoring engine, briefing, jobs) consumed by automation-studio, command-center, copilot, dashboard, and the workflow decision step. Phase 22.5 does **not** touch it. `decision-engine` is the canonical Phase 22.5 module; the legacy module is a migration candidate for a future phase.

## 15. Design Constraints Honored

- **No LLM, no probabilities** — the engine never fabricates confidence or recommendations.
- **No new API surface** — reuses the existing workspace payload; actions still use existing AP endpoints.
- **Server-side only** — the barrel is server-only; client components deep-import `types`/`format` only (H-01 hazard).
- **No new dependencies** — the engine uses only `node:crypto` for the determinism hash.
- **Deterministic** — same evidence in → same decision out.
