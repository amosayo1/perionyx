# Decision Intelligence Engine — Validation Report (Phase 22.5)

## 1. Scope

Evidence-based validation of the Phase 22.5 Decision Intelligence Engine against its specification (`SPEC.md`), the Product System constitution (06 — Decision Intelligence, 12 — AI, 20 — Product Constitution), and the Phase 22.3/22.4 contracts.

## 2. Verification Commands

```bash
NODE_OPTIONS="--max-old-space-size=8192" pnpm typecheck   # 0 new errors (only pre-existing docs/site + prisma/seed-fresh)
pnpm build                                                 # PASS
pnpm vitest run test/decision-engine.test.ts               # 40/40 PASS
pnpm vitest run test/decision-workspace.test.ts            # 14/14 PASS
pnpm vitest run test/evidence-engine.test.ts               # 11/11 PASS
```

## 3. Test Coverage

### 3.1 `test/decision-engine.test.ts` — 40 tests

| Suite | Tests | Coverage |
|---|---|---|
| rule-engine condition matching | 6 | exact ids, group/status/confidence, wildcards, fact operators (in/not-in, numeric, truthy), missing scoping (blocking vs advisory), metadata staleness, anyConditions OR |
| policy-evaluator | 3 | satisfied, unsatisfied gap, not-applicable is never a pass |
| risk-engine | 3 | aggregate worst severity, anyConditions on risk factor, clean scenario zero triggers |
| confidence-engine | 4 | band mapping, clean → high, blocking gap → insufficient-evidence, degraded partial-match score |
| synthesizeRecommendation priority ladder | 8 | approve, terminal, blocking gap, reject (block beats escalate), authority escalate, vendor-risk escalate, partial-match review, open-exception review, overdue → approve-with-warning |
| evaluateDecision artifact | 6 | complete labelled decision, reasoning graph structure, audited lifecycle transitions + version, determinism hash (time-stable, input-sensitive), blocked-vendor reject + critical risk, supporting evidence ids + alternatives |
| DecisionTypeRegistry | 3 | register/require/list, duplicate rejection, registered type evaluates |
| lifecycle | 2 | legal transition, illegal transition throws |
| explainDecision | 2 | fixed-text grounded explanation + policy refs, gap disclosure |
| fromEvidencePackage adapter | 1 | section projection, missing impact mapping, staleness, facts, state/statusLabel |

### 3.2 Regression (Phase 22.3 / 22.4)
- `test/decision-workspace.test.ts` — 14/14: 14-group layout order, item explainability fields, no fabricated scalars, decision priority, absence disclosure, supplier blocker.
- `test/evidence-engine.test.ts` — 11/11: package assembly, missing evidence, dedupe, section order.

## 4. Specification Compliance

| Spec | Requirement | Status | Evidence |
|---|---|---|---|
| FR-1 | No recommendation without evidence | ✅ | Engine accepts only `DecisionEvidence`; no empty path |
| FR-2 | Categorical recommendation states | ✅ | 6 states, `RECOMMENDATION_LABELS` only display mapping |
| FR-3 | Confidence bands, never scalars | ✅ | 4 bands + `basis`; no percentage emitted |
| FR-4 | Blocking gaps block | ✅ | `cannot-decide` + `insufficient-evidence` (tested) |
| FR-5 | Terminal → no decision | ✅ | `cannot-decide`, `nextAction: null` (tested) |
| FR-6 | Deterministic + hash | ✅ | Hash stable across `now`, differs on input change (tested) |
| FR-7 | Reasoning graph mandatory | ✅ | All 6 node kinds + qualified edges (tested) |
| FR-8 | Alternatives mandatory | ✅ | `alternativeOutcomes` always populated |
| FR-9 | Explanations assembled, never written | ✅ | `buildExplanation` uses fixed text only |
| FR-10 | Registry extensibility | ✅ | Duplicate rejection tested; engine untouched for AP |
| FR-11 | Lifecycle audited | ✅ | `created→evaluated→recommended`; illegal throws (tested) |
| FR-12 | Measured facts only | ✅ | Workspace `buildDecisionFacts()` reads real fields |
| NFR-1 | Deterministic | ✅ | Hash-verified |
| NFR-2 | Extensible | ✅ | Registry pattern |
| NFR-3 | Tenant isolated | ✅ | `tenantId` required; stateless core |
| NFR-4 | Testable | ✅ | 40 unit tests |
| NFR-5 | No dependencies | ✅ | Only `node:crypto` |
| NFR-6 | Server-side | ✅ | Barrel server-only (H-01 rule) |
| NFR-7 | Accessible explanations | ✅ | Fixed text fields |

## 5. Product System Compliance

| Principle | Status | Evidence |
|---|---|---|
| DI-R1 / PP-102 — AI explains, never decides | ✅ | Engine returns recommendations; no mutation, no writes |
| DI-R2 — Bands with basis, no fake scalars | ✅ | `confidenceBasis` names measured factors |
| DI-P4 — Measured confidence | ✅ | Score from triggered factor weights |
| DI-P5 — Serializable reasoning graph | ✅ | `reasoningGraph` on every Decision |
| DI-P7 — Alternatives mandatory | ✅ | `alternativeOutcomes` on every Decision |
| PP-105 — No free-text rules | ✅ | Declarative condition DSL |
| PP-201 — Control gaps disclosed | ✅ | Unsatisfied applicable policies surface in recommendation + explanation |
| Law 3 — Capability contracts, engine never modified per domain | ✅ | Registry-based; AP type is data |
| Law 13 — Data classification | ✅ | No new sensitive data handling; tenant scoped |

## 6. Bugs Found & Fixed During Validation

| Bug | Fix | Location |
|---|---|---|
| `risk.duplicate` declared `anyConditions` but `evaluateRiskFactor` ignored them | `evaluateRiskFactor` now evaluates `anyConditions` (same as rule engine) | `risk-engine.ts` |
| `matchMissing` with `impact: "advisory"` returned *all* missing (blocking + advisory) | Advisory queries now scope to advisory-only gaps | `rule-engine.ts` |
| `risk.no-match` severity `high` made any partial match **escalate** instead of review | Downgraded to `medium` → partial match now `needs-review` | `providers/ap-invoice.ts` |
| `risk.overdue` severity `medium` pushed overdue invoices to `needs-review` | Downgraded to `low` → overdue is `approve-with-warning` (holding a late invoice in review worsens the delay) | `providers/ap-invoice.ts` |
| Confidence weights capped clean scenarios below `high` (0.5 max) | Rebalanced to positives 0.80 / negatives 0.20 → clean = 0.80 → `high` | `providers/ap-invoice.ts` |
| `conf.audit-missing` referenced `status: ["none"]` (invalid `EvidenceStatus`) and required a NOT-exists evidence condition the DSL does not have | Removed the factor; absence of audit lowers confidence by missing the positive factor | `providers/ap-invoice.ts` |

## 7. Integration Validation

The workspace service now feeds the **same** evidence package into both the 14-group layout and the engine:

```
assembleEvidencePackage(input) ──▶ projectEvidenceGroups(pkg, invoice)   (14 groups, unchanged)
                                └▶ evaluateDecision(fromEvidencePackage(pkg, { state, statusLabel, facts }))
```

- `DecisionWorkspaceData` gains one additive field: `decision`.
- Phase 22.3 `summary.recommendation` (deterministic, band + basis) remains the UI contract — no UI change.
- No new API routes; no permission changes (no new mutations).
- The workspace tests (14) still pass unmodified, proving backward compatibility.

## 8. Non-Compliance / Residual Gaps

| Gap | Severity | Note |
|---|---|---|
| Legacy `decision-intelligence` module remains | Low | Separately consumed (automation-studio, copilot, dashboard, workflow decision step); migration is a future phase, intentionally out of scope |
| `AP_DECISION_FACT_KEYS` includes keys not yet referenced by rules (`openExceptions`, `exceptionCount`, `matchConfidence`, `matchStatus`, `hasPo`, `hasGrn`, `approved`) | Low | Kept as the documented measured-facts contract; rules may reference them as the domain evolves |
| `Decision.audit.transitions` are in-memory per evaluation | Low | Persistence is consumer-owned by design (spec FR); the workspace service records the artifact |
| Evidence staleness relies on `pkg.metadata.freshness.stale` | Low | True when any item is older than the evidence threshold; threshold constant owned by evidence engine |

## 9. Verdict

**PASS.** The Decision Intelligence Engine is deterministic, spec-compliant (12/12 FR, 7/7 NFR), constitution-aligned, and non-breaking to the Decision Workspace, Evidence Engine, and AP surface. 40 new tests + 25 regression tests pass; typecheck and production build pass with zero new errors.
