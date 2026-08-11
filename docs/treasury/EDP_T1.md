# Engineering Decision Packet — Treasury Intelligence Platform (T1)

## 1. Overview

### Phase Purpose
Deliver the Treasury Intelligence Platform for Program 1 — the evidence-first, decision-ready layer over the treasury domain covering cash position, liquidity, forecast, bank accounts, payments, transfers, intercompany funding, FX exposure, and alerts.

### First Principle
> A treasury operator must be able to re-derive every recommendation by hand from the disclosed evidence.

### Scope
- **Analysis modules** (`analysis/`): cash position, liquidity, forecast — pure measured-fact functions over records.
- **Evidence providers** (`providers/`, 6): payment, transfer, funding, cash-position, forecast, bank-account — canonical evidence surfaces with the eight explainability fields.
- **Decision types + service** (`decisions/`, `services/treasury-decision-service.ts`): Payment Release, Transfer Approval, Funding Approval — deterministic recommendations via the canonical Decision Intelligence engine.
- **Workflow layer** (`workflows/`, `services/treasury-workflow-service.ts`): three approval definitions + escalation policies + decision queue.
- **Command center** (`services/treasury-command-center.ts`): aggregate read surface.
- **Data source boundary** (`data-source.ts` + `prisma-data-source.ts`): the Law 1 read boundary.
- **Verification**: 52-test suite, typecheck clean, 330-test regression pass.
- **No UI, no API routes, no writes** to the treasury domain.

### Companion Documents
`docs/treasury/ARCHITECTURE.md` · `docs/treasury/DOMAIN_MODEL.md` · `docs/treasury/VALIDATION.md` · Phase 22.4 Evidence Engine · Phase 22.5 Decision Intelligence · Phase 23 Enterprise Workflow.

---

## 2. Key Decisions

### D-01: All reads cross the `TreasuryDataSource` boundary
Every read in the intelligence layer goes through the `TreasuryDataSource` interface; the default adapter is `PrismaTreasuryDataSource`, and tests inject an in-memory stub. The interface is the constitutional Law 1 boundary — the treasury module never imports Prisma or provider SDKs.

**Rationale:** providers stay swappable and the barrel never drags `pg` into a client bundle.

### D-02: Amounts are decimal strings in the decision path
Records and evidence carry money as decimal strings at full precision. Numeric facts (`amount`, `highValue`, thresholds) are derived in exactly one place — `deriveFacts` in the decision service. No formatted money, no `Intl` in decision logic; `amountLabel()` is display-only for evidence summaries.

**Rationale:** financial integrity (Law 6) — formatting is presentation, not fact.

### D-03: Deterministic recommendations with injectable `now`
Every service accepts a `now` parameter. Identical input yields an identical recommendation and an identical `audit.determinismHash` (sha256) — verified by test. Time-sensitive facts (imminence, staleness) are computed against `now`, never `Date.now()` at evaluation time.

**Rationale:** a CFO must be able to reproduce yesterday's decision tomorrow.

### D-04: Absence is disclosed, never silent
A missing record yields a **negative identity item** plus a **blocking missing-evidence entry** for the amount; a missing policy artifact (mandate, agreement, control) yields a pending/negative item. Absence is a first-class evidence state, and a blocking gap forces `cannot-decide`.

**Rationale:** the platform must never pretend to be decision-ready on incomplete data (mirrors EDP_22_3 D-07).

### D-05: Recommendation ladder is engine-canonical
Terminal → cannot-decide · blocking gap → cannot-decide · block → reject · escalate / risk ≥ high → escalate · review / medium risk / unmet policy → needs-review · warning → approve-with-warning · else → approve. The three treasury decision types configure **rules, policies, risk factors, confidence factors** on the Decision Intelligence platform — they never implement evaluation themselves (Law 3).

**Rationale:** one evaluation engine, config-only treasury participation.

### D-06: High-value is a hard escalate for all three types
`TREASURY_HIGH_VALUE_AMOUNT` = 250,000. Any payment/transfer/funding above it escalates regardless of other conditions.

**Rationale:** threshold authority consistent with the AP permission matrix; singular, tunable constant.

### D-07: Workflows adopt the general-approval shape
The three treasury workflows reuse the platform's general-approval definition shape: routing start → role-based approval (treasury-approver, 8-hour business SLA) → conditional routing on `decision.recommendation` → notify-approve/notify-review → complete, with time + SLA-breach escalation to the treasury manager. No bespoke workflow engine logic.

**Rationale:** treasury approvals are structurally approvals; bespoke shapes would violate Law 3 and fragment the platform.

### D-08: The decision queue surfaces only non-clean decisions
`getDecisionQueue` returns instances on the three treasury workflows at an approval/decision step **where the attached decision is not a clean approval** (`decisionRequired: true`). Released clean approvals never pollute the queue.

**Rationale:** the queue answers "what needs a human's attention?" — the same trust principle as Dashboard v2's attention queue.

### D-09: Command center is a pure aggregate
`TreasuryCommandCenterService` composes analyses, FX summary, alerts, movements, and the decision queue — it never reasons, never decides, never writes.

**Rationale:** a single read surface for consumers; all judgment flows through the decision service.

---

## 3. Alternatives Considered

| Alternative | Decision | Why rejected |
|---|---|---|
| Read Prisma directly in providers/services | Rejected (D-01) | Violates Law 1; couples module to `pg`; breaks client-bundle safety |
| `Intl`-formatted money in decisions | Rejected (D-02) | Two representations = drift and integrity risk |
| `Date.now()` at evaluation time | Rejected (D-03) | Non-reproducible decisions break auditability |
| Silent absent fields | Rejected (D-04) | Trust violation; blocks no-review path on incomplete data |
| Custom treasury evaluator | Rejected (D-05) | Duplicates Decision Intelligence; violates Law 3 |
| Per-type bespoke workflow shapes | Rejected (D-07) | Fragments the workflow platform; blocks cross-domain reuse |
| Queue shows all instances | Rejected (D-08) | Clean approvals are noise, not attention items |

---

## 4. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Threshold drift (250k, staleness 1d, imminent 3d, concentration 50%) | Low | All in `constants.ts`, asserted as numeric not string; single source |
| Fact-key contract drift between service and decision types | Low | Canonical `TREASURY_PAYMENT/TRANSFER/FUNDING_FACT_KEYS`; covered by decision tests |
| Evidence item-id drift with the platforms | Low | Six-provider tests pin item ids/sections/grouping |
| Registration order changes cross-provider section order | Low | Idempotent registration preserves order; documented in `register.ts` |
| `pnpm build` pre-existing Geist/font blocker | Medium (unrelated) | Fails before treasury code is bundled; tracked separately; typecheck + tests green |
| Full-suite runtime timeout (pre-existing) | Medium (unrelated) | Targeted 330-test regression verified |

---

## 5. Verification

```bash
pnpm vitest run test/treasury-intelligence.test.ts          # 52/52 PASS
pnpm vitest run test/decision-engine.test.ts                # 40/40 PASS
pnpm vitest run test/evidence-engine.test.ts                # 11/11 PASS
pnpm vitest run test/enterprise-workflow.test.ts            # 44/44 PASS
pnpm tsc --noEmit                                          # 0 new errors (pre-existing docs/site + seed-fresh only)
```

Regression: 10 files / 330 tests pass (incl. runtime 60, ap-api 52, dashboard-composition 16, decision-workspace 14, work-queue-domain 22, treasury.service 19).

---

## 6. Sign-off

| Role | Status |
|---|---|
| Engineering (typecheck) | ✅ Pass |
| Test (52 treasury + 330 regression) | ✅ Pass |
| Security checklist (AGENTS 10 questions) | ✅ Pass |
| Constitutional compliance (Laws 1, 2, 3, 6, 15) | ✅ Pass |

*Architecture decision record: see `docs/treasury/ARCHITECTURE.md` — this EDP supersedes no prior ADRs and introduces no new infrastructure.*
