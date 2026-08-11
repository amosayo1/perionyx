# Treasury Intelligence Platform — Domain Model

## Purpose

The domain model of the Treasury Intelligence Platform (Program 1). It describes the entities the intelligence layer consumes, the measured facts it derives, the decision contract it serves, and the workflows it drives — all platform-neutral and boundary-pure.

## Entities

### Entity Types (canonical ids)

| Entity type | Meaning | Decision type | Workflow |
|---|---|---|---|
| `treasury.payment` | A payment awaiting release | Payment Release | `workflow.treasury-payment-approval` |
| `treasury.transfer` | An intra-entity cash movement | Transfer Approval | `workflow.treasury-transfer-approval` |
| `treasury.funding` | An intercompany funding request | Funding Approval | `workflow.treasury-funding-approval` |
| `treasury.cash-position` | A recorded bank cash position | — (evidence only) | — |
| `treasury.forecast` | A recorded cash forecast | — (evidence only) | — |
| `treasury.bank-account` | A bank account record | — (evidence only) | — |

### Records (consumed through `TreasuryDataSource`)

| Record | Key fields |
|---|---|
| `CashPositionRecord` | currency, classification (operating/reserve/restricted/float/other), total/available/ledger/float/bank balance (decimal strings), bankAccountId, institutionName, lastSyncedAt |
| `LiquidityPositionRecord` | category, amount (decimal string), daysToLiquidate |
| `CashForecastRecord` | horizon (week/month/quarter), confidence (high/medium/low), generatedAt, predictedInflows/Outflows, netPrediction, opening/closing/minimum/maximum projected balances, keyRisks, keyAssumptions |
| `BankAccountRecord` | name, currency, bankName, balance, isActive, lastSyncedAt |
| `TreasuryPaymentRecord` | beneficiaryName, beneficiaryRiskLevel, amount, currency, method, status, scheduledDate, initiatorId, reference, bankConfirmationId, mandateVerified |
| `TreasuryTransferRecord` | source/targetAccountId, currency, amount, fundingType, status, reason, approvalRequired, requestedAt, executedAt |
| `TreasuryFundingRecord` | source/targetEntityId, currency, amount, purpose, status, intercompanyAgreementRef, requestedAt |
| `FxExposureRecord` | currency, exposure, rate, counterpartyRiskLevel, hedged, measuredAt |
| `TreasuryAlertRecord` | severity (info/warning/critical), category (liquidity/balance-staleness/sla-breach/failed-payment/fx/concentration/approval/mandate), title, message, target |

## Value Objects

- **Money** — decimal strings at full precision. Never formatted in the decision path; `amountLabel()` is display-only for evidence summaries.
- **Risk band** — `low | medium | high | critical` (duck-typed from Decision Intelligence).
- **Recommendation band** — `approve | approve-with-warning | needs-review | escalate | reject | cannot-decide`.
- **Evidence source** — `{ system: "treasury.prisma", type, id, at }`.

## Measured Facts

The decision service derives facts from records (never from formatted strings, never from heuristics):

### `treasury.payment`
| Fact | Derivation |
|---|---|
| `paymentStatus` | `record.status` |
| `amount` | `Number(record.amount)` |
| `highValue` | `amount > TREASURY_HIGH_VALUE_AMOUNT` (250,000) |
| `imminent` | `daysUntil(scheduledDate, now) <= TREASURY_IMMINENT_DAYS` (3) |
| `mandateVerified` | `record.mandateVerified` |
| `beneficiaryRiskLevel` | `record.beneficiaryRiskLevel` |
| `terminal` | status in {approved, rejected, released, processing, failed, returned, cancelled} |

### `treasury.transfer`
| Fact | Derivation |
|---|---|
| `amount` | `Number(record.amount)` |
| `highValue` | `amount > TREASURY_HIGH_VALUE_AMOUNT` |
| `approvalRequired` | `record.approvalRequired` |
| `terminal` | status in {approved, rejected, executed, failed, cancelled} |

### `treasury.funding`
| Fact | Derivation |
|---|---|
| `amount` | `Number(record.amount)` |
| `highValue` | `amount > TREASURY_HIGH_VALUE_AMOUNT` |
| `agreementPresent` | `Boolean(record.intercompanyAgreementRef)` |
| `terminal` | status in {approved, rejected, executed, failed, cancelled} |

## Decision Contract

Each decision type declares rules, policies, risk factors, and confidence factors over the evidence items and facts above.

### Recommendation ladder (engine-wide, highest first)

1. terminal state → `cannot-decide`
2. blocking evidence gap → `cannot-decide`
3. block rule → `reject`
4. escalate rule or risk ≥ high → `escalate`
5. review rule, medium risk, or unsatisfied applicable policy → `needs-review`
6. warning rule → `approve-with-warning`
7. otherwise → `approve`

### Expected outcomes per scenario

| Scenario | Recommendation |
|---|---|
| Clean, low-value, mandate-verified payment | `approve` |
| Payment scheduled ≤ 3 days out | `approve-with-warning` |
| Payment > 250,000 | `escalate` |
| High/critical beneficiary risk | `escalate` |
| Unverified beneficiary mandate | `needs-review` |
| Approval-required transfer with control pending | `needs-review` |
| Funding without intercompany agreement | `needs-review` |
| Any terminal status / missing record | `cannot-decide` |

## Workflow Model

All three workflows share the general-approval shape:

```
start (routing) → approval (role: treasury-approver, SLA 8bh)
   └─ decision.recommendation ∈ {approve, approve-with-warning} → notify-approve → complete
   └─ otherwise                                                    → notify-review → complete
```

- **autoStart**: true — creating an instance starts it and activates the approval step.
- **requiresDecision**: true — the workflow consumes the attached Decision Intelligence artifact.
- **Escalation**: `escalation.treasury-{payment,transfer,funding}` — time trigger (2h assigned) and SLA-breach; level 0 notify manager, level 1 reassign-and-notify to treasury manager.
- **Decision queue**: `treasury.decision-queue` — instances on the three treasury workflows at an approval/decision step **with a non-clean recommendation attached** (clean approvals never surface).

## State of the Decision

- **actionable** — a decision is pending; the evidence package is decision-ready or has non-blocking gaps.
- **terminal** — the entity is already finalized (released/executed/rejected/…); the recommendation is `cannot-decide` with no next action.

## Invariants

1. Amounts are decimal strings in records and evidence; numeric facts are derived in one place (`deriveFacts`).
2. A terminal entity never receives an approve-family recommendation.
3. A blocking evidence gap never receives any recommendation other than `cannot-decide`.
4. High-value (> 250k) always escalates for all three decision types.
5. Every missing input is disclosed (negative item or missing-evidence entry) — never silent.
6. `registerTreasury*` calls are idempotent; registration preserves order.
7. The intelligence layer never imports Prisma (Law 1) and never embeds platform logic (Law 3).
