# Treasury Intelligence Platform — Validation

## Scope

This document records the validation evidence for the Treasury Intelligence Platform (Program 1, Phases 22.4 / 22.5 / 23). The platform is verified by a 52-test suite (`test/treasury-intelligence.test.ts`) exercising the canonical constants, the three analysis modules, the six evidence providers, the decision service, the workflow layer, and the command center.

## Test Matrix

| Area | Tests | Coverage |
|---|---|---|
| Canonical constants | 4 | six entity types; three workflow ids + escalation policies; thresholds as numbers not strings; evidence load keys |
| Cash position | 7 | totals/currency/classification breakdown; staleness (older than 1 day or never synced); concentration ≥ threshold; newest sync timestamp; recorded alerts passthrough; empty stability; `forTenant` boundary read |
| Liquidity | 5 | category totals; amount-weighted liquidation days; multi-entry aggregation; empty stability; `forTenant` boundary read |
| Forecast | 4 | null when absent; critical flag on negative minimum; low-confidence + named-risk flags; clean high-confidence projection; `forTenant` most-recent selection |
| Evidence providers | 9 | complete payment package; blocking missing disclosure; unverified mandate pending; transfer approval control; funding intercompany agreement; cash/forecast/bank-account packages; seeded-record reuse (no re-fetch); idempotent registration |
| Decision types + service | 16 | idempotent registration; approve clean payment; approve-with-warning imminent; escalate high-value; escalate high-risk beneficiary; needs-review unverified mandate; cannot-decide terminal; cannot-decide missing record; transfer control unmet → needs-review, cleared → approve; escalate high-value transfer; funding without agreement → needs-review, with agreement → approve; full decision artifact (reasoning graph + audit); determinism (identical input → identical recommendation and hash) |
| Workflows | 7 | three definitions; general-approval shape; escalation policies (time + SLA-breach); auto-started instance; decision attach + queue surfacing; `decisionRequired` filter excludes clean approvals; approve-path completion |
| Command center | 3 | full composition (cash, liquidity, forecast, fx, alerts, movements); null forecast; pending non-clean decisions in queue |

## Verification Commands

```bash
pnpm vitest run test/treasury-intelligence.test.ts          # 52/52 PASS
pnpm vitest run test/decision-engine.test.ts                # 40/40 PASS (canonical platform regression)
pnpm vitest run test/evidence-engine.test.ts                # 11/11 PASS (canonical platform regression)
pnpm vitest run test/enterprise-workflow.test.ts            # 44/44 PASS (canonical platform regression)
pnpm tsc --noEmit                                          # 0 new errors (only pre-existing docs/site + seed-fresh)
```

## Regression Run

Targeted regression — 10 files / 330 tests passed:

- `test/treasury-intelligence.test.ts` (52)
- `test/decision-engine.test.ts` (40)
- `test/enterprise-workflow.test.ts` (44)
- `test/evidence-engine.test.ts` (11)
- `test/runtime.test.ts` (60)
- `test/procurement/ap-api.test.ts` (52)
- `test/dashboard-composition.test.ts` (16)
- `test/decision-workspace.test.ts` (14)
- `test/work-queue-domain.test.ts` (22)
- `test/treasury.service.test.ts` (19)

## Constitutional Compliance

| Law | Status | Evidence |
|---|---|---|
| Law 1 — domains never import provider SDKs | ✅ | All reads via `TreasuryDataSource`; `PrismaTreasuryDataSource` lazily constructed behind the barrel so no client bundle ever pulls `pg` |
| Law 2 — vendor terminology never enters the domain | ✅ | Platform-neutral types only |
| Law 3 — capability contracts, registry config only | ✅ | `registerTreasuryEvidenceProviders` / `registerTreasuryDecisionTypes` / `registerTreasuryWorkflows` — no engine logic embedded |
| Law 6 — financial integrity never compromised | ✅ | Decimal-string amounts; single `deriveFacts` numeric derivation; `cannot-decide` on any blocking gap or terminal state |
| Law 15 — events are vendor-neutral | ✅ | Workflow escalation/decision events reference treasury ids, never provider payloads |

## Security Review (AGENTS 10-question checklist)

1. **Exposes sensitive financial data?** No — read-only intelligence surface; no new API routes; no serialization of raw records beyond evidence summaries the operator already has access to.
2. **Requires a new permission?** No — consumes existing treasury records via the boundary; no new mutation paths.
3. **Cross-tenant access?** No — every boundary read is keyed by tenant id; the command center and decision queue are tenant-scoped.
4. **Audit logging?** N/A — no mutations; every decision carries an `audit` trail (determinism hash, sources, timestamps).
5. **Encryption required?** No — no new secrets, PII, or credentials introduced.
6. **Reversible?** N/A — the platform performs no writes.
7. **Privilege escalation?** No — no permission changes; no elevation of existing endpoints.
8. **New secrets?** No — none introduced.
9. **Rate limiting?** N/A — no public endpoint introduced.
10. **Complies with security architecture?** Yes — tenant isolation preserved, no provider SDKs, deterministic and auditable decision output.

## Known Limitations

- Decision recommendations are deterministic rules — an LLM summarizer is intentionally deferred (the reasoning graph is the contract for any future capability).
- `pnpm build` currently fails on a pre-existing, unrelated blocker (`src/app/layout.tsx` resolving `next/font/google` Geist in Turbopack; `node_modules/geist` absent). The failure occurs before any treasury code is bundled; treasury typecheck and tests are green.
- The full `pnpm test` suite times out after 600s on pre-existing slowness; the targeted regression set above is the verified signal.
