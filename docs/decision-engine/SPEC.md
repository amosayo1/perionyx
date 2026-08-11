# Decision Intelligence Engine — Specification (Phase 22.5)

Canonical requirements for the deterministic enterprise reasoning layer. Every item references its authority in Product System 06 (Decision Intelligence), 12 (AI), and 20 (Product Constitution) where applicable.

## 1. Scope

The engine is the single source of truth for recommendation derivation in Perionyx: **evidence → evaluation → reasoning → recommendation → human decision → audit**. It serves all future financial workflows (AP first), not just the Decision Workspace.

### In scope
- Deterministic rule, policy, risk, and confidence evaluation over normalized evidence.
- Categorical recommendations with mandatory alternatives and required human actions.
- Serializable reasoning graph and audited lifecycle transitions.
- Registry-based decision-type extensibility.
- A reference `ap.invoice` decision type.

### Out of scope (explicitly)
- LLM generation or probabilistic inference — a future LLM capability may only *summarize* the reasoning graph.
- Persistence — the engine is stateless; consumers own storage.
- Making the decision — a human approves, rejects, or escalates.

## 2. Functional Requirements

### FR-1 — No recommendation without evidence
The engine accepts only a normalized `DecisionEvidence` input. There is no "empty" recommendation path that fabricates data. `F-REQ 22.3` satisfied: every recommendation traces to evidence items, facts, or disclosed gaps.

### FR-2 — Categorical recommendation states
Recommendations are exactly one of: `approve · approve-with-warning · needs-review · escalate · reject · cannot-decide`. `RECOMMENDATION_LABELS` is the only display mapping. Never free text. (DI-R2, PP-109)

### FR-3 — Confidence bands, never scalars
Confidence is `high · moderate · low · insufficient-evidence`. Every band carries a `basis` naming the measured factors. No percentage is ever emitted. (DI-R2, DI-P4, Measured-Confidence Doctrine)

### FR-4 — Blocking gaps block
A `blocking` evidence gap produces `cannot-decide` with required human actions to resolve the gap, regardless of any other signal. A blocking gap also forces `insufficient-evidence` confidence. The engine never recommends on blocked information.

### FR-5 — Terminal states produce no decision
`state: "terminal"` produces `cannot-decide` with `nextAction: null`. No recommendation is synthesized for an entity that is already finalized.

### FR-6 — Deterministic and reproducible
Identical evidence produces an identical decision, including an identical `determinismHash` (sha256 over evidence with `now` stripped, factor definitions, and engine version). The decision is reproducible from the evidence for auditors.

### FR-7 — Reasoning graph is mandatory
Every `Decision` exposes a serializable graph with evidence, rule, policy, risk, confidence, and decision nodes plus labelled edges. (DI-P5)

### FR-8 — Alternatives are mandatory
Every recommendation lists `alternativeOutcomes` ("why not this") — reject, approve, approve-with-warning, escalate, and defer as appropriate. (DI-P7)

### FR-9 — Explanations are assembled, never written
`explainDecision()` composes sentences from fixed rule text, policy names, risk labels, and evidence identifiers. The engine never writes free-form prose about the entity.

### FR-10 — Registry extensibility
New decision domains are added by registering a `DecisionTypeConfig`; the engine is never modified (Law 3 — capability contracts). Duplicate registration is an error.

### FR-11 — Decision lifecycle is audited
State transitions follow `LEGAL_TRANSITIONS`; illegal transitions throw. Every evaluation records `created → evaluated → recommended`.

### FR-12 — Measured facts only
`facts` are provided by the adapter/caller from real record fields. The engine never computes or formats money; numeric thresholds never come from formatted display strings.

## 3. Recommendation Decision Table (priority order)

| Priority | Condition | Recommendation | Driver |
|---|---|---|---|
| 1 | `state === "terminal"` | cannot-decide | terminal |
| 2 | blocking missing evidence exists | cannot-decide | evidence-gap |
| 3 | block rule triggered | reject | block |
| 4 | escalate rule triggered **or** risk ≥ high | escalate | escalate |
| 5 | review rule triggered **or** risk medium **or** unsatisfied applicable policy | needs-review | review |
| 6 | warning rule triggered | approve-with-warning | warning |
| 7 | otherwise | approve | clean |

## 4. Condition DSL

Four condition kinds, one evaluator (`matchCondition`):

| Kind | Matches | Operators / Fields |
|---|---|---|
| `evidence` | evidence items | `itemId` (exact or `*` suffix), `groupId`, `sectionId`, `status[]`, `confidence[]` |
| `fact` | measured facts | `eq neq gt gte lt lte in not-in truthy` |
| `missing` | missing evidence | `impact` (blocking/advisory scoping), `id` (exact or `*` prefix) |
| `metadata` | package metadata | `decisionReady`, `stale` |

`anyConditions: RuleCondition[][]` = OR across groups; every condition inside a group must match.

## 5. Confidence Specification

```
score = (Σ triggered positive weights − Σ triggered negative weights) / Σ all weights
bands:  score ≥ 0.70 → high · score ≥ 0.40 → moderate · else → low
        blocking gap present → insufficient-evidence (overrides score)
```

Rules:
1. Confidence never influences the recommendation category — it qualifies trustworthiness.
2. Missing positives lower confidence (denominator includes all weights).
3. `basis` must name the triggered factors ("positive: …; negative: …") or the blocking-gap reason.

## 6. Risk Specification

- Aggregate rating = the highest triggered severity (`critical 0 < high 1 < medium 2 < low 3`).
- Every factor is evaluated and reported, triggered or not — cleared risks are visible in the graph.
- The aggregate carries an explanation naming the number of triggered factors.
- Risk ≥ high forces `escalate`; risk medium contributes to `needs-review`.

## 7. `ap.invoice` Reference Behavior

| Scenario | Rules fired | Risk | Confidence | Recommendation |
|---|---|---|---|---|
| Clean full match, known supplier, authority defined | none | low | high | approve |
| Partial / unverified three-way match | inv.match-review | medium (risk.no-match) | moderate | needs-review |
| Open exception | inv.exception-review | medium (risk.unresolved-exception) | moderate | needs-review |
| High-value invoice, no matrix entry | inv.authority-escalation, inv.policy-gap | medium (risk.high-value) | moderate | escalate |
| Supplier risk HIGH/CRITICAL | inv.vendor-risk-escalation | high | — | escalate |
| Duplicate suspicion high confidence | inv.duplicate | high (risk.duplicate) | moderate | reject |
| Blocked vendor | inv.blocked-vendor | critical (risk.blocked-vendor) | — | reject |
| Overdue (only warning) | inv.overdue-warning | low (risk.overdue) | high | approve-with-warning |
| Blocking gap (e.g. supplier identity) | — | — | insufficient-evidence | cannot-decide |
| Terminal status (PAID) | — | — | — | cannot-decide |

## 8. Audit Metadata Specification

```ts
audit: {
  engineVersion: "1.0.0",
  lifecycle: "recommended",
  transitions: [{ from: "created", to: "evaluated", at, actor: "engine", reason },
                { from: "evaluated", to: "recommended", at, actor: "engine", reason }],
  determinismHash: sha256(JSON({ evidence (now stripped), rules, policies, riskFactors, confidenceFactors, version })),
  sourceSystems: [...],   // union of item section/group ids + missing source systems
}
```

`now` is excluded from the determinism hash so tests and re-evaluations are time-stable.

## 9. Lifecycle State Machine

```
created → evaluated → recommended → human-reviewed → approved | rejected | escalated → closed
                ↕                                   ↕
            reopened ←———————————— rejected
reopened → evaluated
escalated → human-reviewed | reopened | closed
```

Illegal transitions throw `Illegal decision transition: {from} → {to}`.

## 10. Non-Functional Requirements

| # | Requirement | Commitment |
|---|---|---|
| NFR-1 | Deterministic | Same input → same output, bit-for-bit (hash-verified) |
| NFR-2 | Extensible | New domains via registry, zero engine edits |
| NFR-3 | Tenant isolated | `tenantId` required on input; engine holds no cross-tenant state |
| NFR-4 | Testable | Pure, injectable `now`; 40 unit tests in `test/decision-engine.test.ts` |
| NFR-5 | No dependencies | Only `node:crypto`; framework-agnostic core |
| NFR-6 | Server-side | Barrel is server-only; client components deep-import types/format |
| NFR-7 | Accessible explanations | Fixed text, no prose walls; screen-reader-friendly fields |

## 11. Exit Criteria (definition of done)

1. `pnpm typecheck` passes with no new errors.
2. `pnpm build` passes.
3. `test/decision-engine.test.ts` (40), `test/evidence-engine.test.ts` (11), `test/decision-workspace.test.ts` (14) all pass.
4. No modification to the legacy `decision-intelligence` module.
5. No new API surface; workspace payload is additive.
