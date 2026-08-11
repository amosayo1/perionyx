# Treasury Intelligence Platform — Architecture

## Overview

The Treasury Intelligence Platform is the intelligence layer of the Treasury domain (Program 1). It transforms recorded treasury data into **measured facts**, discloses evidence with the canonical eight explainability fields, and produces **deterministic recommendations** for the three treasury approval workflows — payments, transfers, and intercompany funding. It never decides; the platform explains and the treasury operator renders.

It is built exclusively on the canonical Phase 22.4 / 22.5 / 23 platforms — Evidence Engine, Decision Intelligence, Enterprise Workflow — and registers only **configuration** on those platforms (Constitutional Law 3 — capability contracts). It contains no LLM, no random, no formatted money in the decision path, and no decision-making of its own.

## First Principles

1. **The business domain never imports provider SDKs (Law 1).** Every read flows through the `TreasuryDataSource` boundary. The Prisma adapter is one implementation; tests inject an in-memory stub.
2. **Everything is a measured fact.** Amounts are decimal strings at full precision until the decision service derives numeric facts. No fabricated scalars, no heuristics branded as intelligence.
3. **Absence is always disclosed.** A missing record produces negative evidence items and blocking missing-evidence entries — never silence.
4. **Deterministic with injectable `now`.** Every service accepts a `now` parameter so results are time-stable and auditable.
5. **The engine explains, the human decides (PP-102, DI-R1).** The decision service returns a reasoning graph, required human actions, and alternatives — the operator renders the judgment through the workflow.

## Module Layout

```
src/modules/treasury/intelligence/
├── types.ts                     # Canonical domain types (entity types, records, risk/rec bands)
├── constants.ts                 # Canonical ids: load keys, workflow ids, escalation ids, thresholds
├── data-source.ts               # TreasuryDataSource boundary + get/set/reset (Law 1)
├── prisma-data-source.ts        # Prisma adapter over the boundary
├── analysis/
│   ├── cash-position.ts         # Totals, currency/classification breakdown, staleness, concentration
│   ├── liquidity.ts             # Category totals, amount-weighted liquidation days
│   └── forecast.ts              # Net prediction, projected balances, confidence + risk flags
├── providers/
│   ├── helpers.ts               # item()/section()/contribution()/treasurySource()/amountLabel()
│   ├── loaders.ts               # Canonical load keys + context.load(key, fn) fallback loaders
│   ├── payment-provider.ts      # Evidence surface for treasury.payment
│   ├── transfer-provider.ts     # Evidence surface for treasury.transfer
│   ├── funding-provider.ts      # Evidence surface for treasury.funding
│   ├── cash-position-provider.ts# Evidence surface for treasury.cash-position
│   ├── forecast-provider.ts     # Evidence surface for treasury.forecast
│   ├── bank-account-provider.ts # Evidence surface for treasury.bank-account
│   └── register.ts              # registerTreasuryEvidenceProviders() (idempotent)
├── decisions/
│   ├── types.ts                 # TREASURY_PAYMENT/TRANSFER/FUNDING_DECISION_TYPE configs + fact keys
│   └── register.ts              # registerTreasuryDecisionTypes() (idempotent)
├── workflows/
│   └── definitions.ts           # registerTreasuryWorkflows() + 3 approval definitions
├── services/
│   ├── treasury-decision-service.ts    # assemble → project → evaluate (canonical decision path)
│   ├── treasury-workflow-service.ts    # create instance, attach decision, decision queue
│   └── treasury-command-center.ts      # aggregate read surface
└── index.ts                     # Full facade barrel
```

## Architecture Layers

### 1. The Data Source Boundary (`data-source.ts`)

The only place the intelligence layer reads treasury data. The `TreasuryDataSource` interface exposes nine read methods (cash positions, liquidity, forecasts, bank accounts, payments, transfers, funding, FX exposure, alerts). The default implementation is `PrismaTreasuryDataSource`, lazily constructed so the barrel never pulls Prisma into a client bundle. Tests replace it via `setTreasuryDataSource(stub)`.

This is the constitutional Law 1 boundary: swap the source without touching any engine, provider, or service.

### 2. Analysis Modules (`analysis/`)

Pure measured-fact functions over records — no I/O. Each returns a typed analysis:

- **Cash Position**: totals and per-currency breakdown (available / restricted / float, classification breakdown, bank count), stale positions (`lastSyncedAt` older than `TREASURY_BALANCE_STALE_DAYS` = 1 day or never synced), concentration risk (any bank ≥ `TREASURY_CONCENTRATION_THRESHOLD` = 50% of total cash), newest sync timestamp, and the recorded alerts passthrough.
- **Liquidity**: total liquid assets, per-category totals, and the amount-weighted average days-to-liquidate.
- **Forecast**: net prediction, opening/closing/minimum/maximum projected balances, plus flags — `negative-balance` (critical), `low-confidence` (warning), `risk-named` (info). Returns `null` when no forecast exists.

`*ForTenant` variants read through the boundary and are the default entry points.

### 3. Evidence Providers (`providers/`)

Each provider contributes a canonical evidence surface for its entity type using the shared helpers and the required eight explainability fields (`id`, `sectionId`, `groupId`, `title`, `summary`, `reason`, `source`, `timestamp`, `status`, `confidence`, `confidenceBasis`, …). Registration order fixes cross-provider item order within shared sections.

Every loader goes through `context.load(key, fn)` with a canonical key from `TREASURY_LOAD_KEYS` — consumers may seed pre-loaded records under the same keys and the provider never re-fetches.

Required evidence is declared per provider; the assembler marks a blocking gap whenever a required item is unsatisfied. A missing entity is disclosed as a **negative identity item** plus a **blocking missing** entry for the amount — never silence.

### 4. Decision Types (`decisions/`)

Three `DecisionTypeConfig`s registered on the canonical Decision Intelligence registry:

| Entity type | Decision | Escalation rule | Review rule | Warning rule |
|---|---|---|---|---|
| `treasury.payment` | Payment Release | high-value (>250k), high/critical beneficiary risk | mandate unverified, stale evidence | imminent schedule (≤3 days) |
| `treasury.transfer` | Transfer Approval | high-value | approval-required control pending, stale | — |
| `treasury.funding` | Funding Approval | high-value | no intercompany agreement, stale | — |

Each config declares rules, internal-control policies, risk factors, and confidence factors — all referencing the treasury evidence item ids and the measured fact keys the decision service computes. Fact keys are the stable contract between service and types (`TREASURY_PAYMENT_FACT_KEYS`, etc.).

### 5. Decision Service (`services/treasury-decision-service.ts`)

The canonical decision path:

1. `assembleEvidenceFor` builds the Evidence Package (evidence providers).
2. `deriveFacts` computes measured facts from the record: amount, `highValue`, `imminent`, `mandateVerified`, `beneficiaryRiskLevel`, `approvalRequired`, `agreementPresent`, `terminal`.
3. `fromEvidencePackage` projects the package into `DecisionEvidence` with the derived facts.
4. The `DecisionIntelligenceEngine` evaluates rules, policies, risk, and confidence and synthesizes a deterministic recommendation.

Recommendation priority (from the engine): terminal state → cannot-decide · blocking gap → cannot-decide · block rule → reject · escalate rule / risk ≥ high → escalate · review rule / medium risk / unmet control → needs-review · warning rule → approve-with-warning · else → approve.

### 6. Workflow Definitions (`workflows/`)

Three approval workflows (`workflow.treasury-payment-approval`, `-transfer-`, `-funding-`) adopt the general-approval shape: routing start → role-based approval step with a decision SLA (8 business hours, 09:00–17:00 weekdays) → conditional routing on `decision.recommendation` → notify-approve / notify-review → complete. Escalation policies (time + SLA-breach) reassign to the treasury manager.

`registerTreasuryWorkflows(registry)` is called once with a fresh registry.

### 7. Workflow Service (`services/treasury-workflow-service.ts`)

Orchestration only: `createDecisionInstance` (auto-started), `attachDecision` (via the `toWorkflowDecisionContext` adapter), and `getDecisionQueue` — a projection over instances with the treasury workflow ids, approval/decision step kinds, and `decisionRequired: true` (clean approvals never appear).

### 8. Command Center (`services/treasury-command-center.ts`)

The aggregate read surface: measured cash, liquidity, forecast, FX summary (sorted by exposure), recorded alerts, the live decision queue, and movement tallies (awaiting decision, high-value awaiting decision, released today) per payments / transfers / funding. Composes everything through the boundary and the workflow service — never reasons, never writes.

## Registration

```ts
registerTreasuryEvidenceProviders();   // Evidence Engine (Phase 22.4)
registerTreasuryDecisionTypes();       // Decision Intelligence (Phase 22.5)
registerTreasuryWorkflows(registry);   // Enterprise Workflow (Phase 23)
```

All three are idempotent — the registries skip already-registered ids/configs, so repeated calls (module re-init, hot reload) are safe.

## Integration Points

| Platform | Integration |
|---|---|
| Evidence Engine | `registerEvidenceProviders` (6 providers), `assembleEvidenceFor` |
| Decision Intelligence | `getDecisionTypeRegistry` (3 types), `fromEvidencePackage`, `DecisionIntelligenceEngine` |
| Enterprise Workflow | `WorkflowRegistry.registerDefinition` (3) + `registerEscalationPolicy` (3), `EnterpriseWorkflowEngine`, `toWorkflowDecisionContext` |
| Treasury domain | `TreasuryDataSource` (Prisma today, any provider later) |

## Non-Goals

- No UI, no API routes, no writes to the treasury domain — this is the intelligence read + decision surface only.
- No LLM summarization — explicitly deferred; a future capability may only summarize the deterministic reasoning graph.
- No decision execution — payment release, transfer execution, and funding remain treasury-domain actions the operator performs.
- No cross-platform logic — the treasury module embeds no engine logic (Law 3).

## Related Documentation

- `docs/treasury/DOMAIN_MODEL.md` — entities, measured facts, decision contract, workflow states
- `docs/treasury/VALIDATION.md` — test evidence and verification results
- `docs/treasury/EDP_T1.md` — engineering decision packet
- Phase 22.4 Evidence Engine, Phase 22.5 Decision Intelligence, Phase 23 Enterprise Workflow architecture docs
