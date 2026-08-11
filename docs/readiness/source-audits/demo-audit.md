# Perionyx — CFO Demo Readiness Audit

Date: 2026-08-07 | Scope: read-only audit, live DB verification (postgresql://horus@localhost:5432/mydb)
Auditor: file-search agent | Target: executive (CFO) demo on localhost

## 1. Verdict

**NOT READY for a CFO demo on the Demo Company tenant. CONDITIONALLY READY on the Sandbox tenant — but only after AP invoices are seeded.** The engineering is largely honest (real AI providers wired, real Prisma computation, no fabricated KPIs), but the two demo paths have critical data gaps:

- **Demo Company (sandbox=false)** is a hollow shell: 1 wallet, 0 transactions, 0 ledger entries, 0 treasury accounts, 0 AP invoices, 0 approvals. Every data-driven module shows empty states.
- **Sandbox tenant (atlas-manufacturing-group)** is richly populated (5,000 transactions, 10,000 ledger entries, 20,002 audit logs, 459 approval threads) — but **zero AP invoices** (ProcurementVendorInvoice = 0 rows for ALL companies).

## 2. Key Numbers (live DB)

| Metric | Demo Company | Sandbox (Atlas) |
|---|---|---|
| Wallets | 1 | 13 |
| Transactions | 0 | 5,000 |
| Ledger entries | 0 | 10,000 |
| Treasury accounts | 0 | 14 |
| Audit logs | 2 | 20,002 |
| Risks | 0 | 150 |
| Approval threads | 0 | 459 |
| Notifications | 0 | 500 |
| Calendar events | 0 | 122 |
| Policies / approval rules | 0 / 1 | 30 / 6 |
| Copilot conversations | 0 | 8 |
| Reconciliations | 0 | 18 |
| ProcurementVendor | 0 | 0 |
| ProcurementVendorInvoice | 0 | 0 |

DB pollution: 100+ "Test Company test-co-*-4iqj" rows from test suites.

## 3. Findings (severity-ranked)

### CRIT-01 — AP comprehensive seed targets a non-existent tenant
`src/server/procurement/seeds/vendor-generator.ts:15` and `invoice-generator.ts:17` hardcode `COMPANY_ID = "cmqvfocev0001koor7ragb8bq"`. Verified via psql: **0 rows** — this company does not exist. Running `ap-seed.ts` (~28K records: 158 vendors, 3,527 invoices, 21,800 audit records) writes nothing visible. Actual Demo Company id is `cms4l23ir000136or3jydua9x`.

### CRIT-02 — AP module is empty for every tenant
`ProcurementVendor` and `ProcurementVendorInvoice` = 0 rows across the entire DB. Consequence: the Decision Workspace (`src/app/(shell)/procurement/invoices/[invoiceId]/page.tsx` — calls `notFound()` on missing invoice) 404s on every URL; the AP work queue shows "No items in queue" (empty state exists, `work-queue-page-client.tsx:211`); all 65 `/api/v1/ap/*` endpoints return empty collections.

### HIGH-01 — Two parallel AP worlds with conflicting data
Legacy in-memory `procurementService` (`src/app/(shell)/procurement/page.tsx:2-26`) shows seeded vendors/POs/invoices/contracts on /procurement pages, while the new Prisma AP (`/api/v1/ap`, work queue, decision workspace) shows empty. A CFO clicking from a populated list into an invoice detail gets a 404. The `DataFreshnessIndicator` (`accounting/overview/page.tsx:36`) honestly labels "not persisted" — but the contradiction itself is the demo hazard.

### HIGH-02 — `pnpm db:seed` produces an empty demo tenant
Only `prisma/seed.ts` is wired (`prisma.config.ts:13` → `tsx prisma/seed.ts`). `seed-ap.ts`, `seed-treasury.ts`, and the comprehensive `ap-seed.ts` are manual `npx tsx` runs. Any fresh provisioning yields Demo Company with 1 wallet + 2 audit logs and nothing else.

### MED-01 — Executive health score defaults to 50
`src/modules/executive-command-center/executive-command-center.ts:1093`: `(health?.score as number) ?? 50`. With empty specialist data the dashboard shows a mediocre ~50 health score and `riskScore = 100 - 50` — not fabricated, but it will read as "average" on an empty company.

### MED-02 — "AI Insights" panels are rule-based templates, not LLM
`src/components/accounts-receivable/ar-executive-insights.tsx:6-21`: canned titles (DSO Trending Up, Collection Efficiency…) parameterized by real metrics, rendered under an "AI Insights" header. Honest data, misleading label. Same pattern in accounting/order-to-cash/procurement executive-insights components.

### LOW-01 — In-memory modules show seeded demo data for every tenant
Accounting (`accountingService`, `accounting/overview/page.tsx:11-23`), procurement, financial-close, AR services — in-memory seeds with honest "not persisted" freshness indicators. Fine for demo consistency, but numbers won't match Prisma-backed modules (GL, treasury).

### LOW-02 — VaR panel labels Monte Carlo honestly
`value-at-risk-panel.tsx:114` — "10,000 simulated paths with stochastic modeling". Honest; not a finding to fix, just avoid overclaiming during demo.

## 4. What Works (verified strengths)

- **Real AI wiring**: `src/modules/copilot/ai.service.ts` streams via `promptExecutionService` + `aiProviderRegistry` (openai/anthropic/gemini/azure/cohere/grok/mistral) with `isAvailable()` gating; `AI_API_KEY` and `GEMINI_API_KEY` are set in `.env`.
- **Sandbox scenarios are real services**: `/api/v1/sandbox/scenario` (e.g. high-value-supplier-payment USD 2,850,000, reconciliation, FX) executes real business logic; `/api/v1/sandbox/intelligence` generates a real executive briefing (`briefings.service` → `generateExecutiveBriefing`); `/api/v1/sandbox/reset` exists.
- **Sandbox labeling is honest**: banner "all data is simulated" (`sandbox-banner.tsx:18-21`), `trust-indicator.tsx` "Simulated" level.
- **Dashboard v2 is honest**: `composition.service.ts:42` returns `pctDelta: null` when previous = 0 (no fake deltas); high-value threshold 25,000 (`:20`); real per-section fallibility.
- **CFO advisor computes from real data**: `cfo-advisor.service.ts:1309-1332` sums `treasuryCashPosition` rows; revenue trend from `ledgerEntry` (`:1351-1372`).
- **Work queue has a proper empty state** ("No items in queue"), invoices 404 intentionally rather than render broken.
- Landing page (`src/app/page.tsx`) is marketing-only — no leaked internals.

## 5. Module Readiness Matrix (Demo Company)

| Module | Ready? | Evidence |
|---|---|---|
| Landing / auth | ✅ | Marketing page + real login |
| Executive dashboard | ⚠️ | Works, but health ≈ 50 (MED-01), zero KPIs have deltas |
| Treasury | ⚠️ | 0 accounts — empty unless seed-treasury.ts run |
| GL | ⚠️ | 0 ledger entries |
| AP / work queue / decision workspace | ❌ | 0 invoices → 404s and empty queue (CRIT-02) |
| Accounting / procurement (legacy) | ⚠️ | Shows in-memory seed; conflicts with Prisma data (HIGH-01) |
| Copilot | ⚠️ | Real AI, but 0 conversations/context on demo company |
| Sandbox tenant | ⚠️ | Rich data but no AP; banner honest about simulation |

## 6. Pre-Demo Checklist (ordered)

1. **Fix the phantom company ID** in `vendor-generator.ts:15` / `invoice-generator.ts:17` → use `cms4l23ir000136or3jydua9x` (Demo Company) or the sandbox tenant id.
2. **Run the comprehensive AP seed** (`npx tsx src/server/procurement/seeds/ap-seed.ts`) and verify `SELECT count(*) FROM "ProcurementVendorInvoice"` > 0.
3. **Run `seed-treasury.ts`** so treasury + executive cash position show non-zero, real values (cash positions feed CFO advisor + briefings).
4. **Decide the demo tenant**: Demo Company (clean, needs seeds) vs Sandbox (rich, honest "simulated" banner, has scenarios + reset). Recommended: Sandbox after step 2, to also demo scenarios + Copilot with context.
5. **Rehearse the invoice detail path**: after seeding, verify `invoices/[invoiceId]` renders evidence package, not 404.
6. **Script the DB cleanup** of test-co-* companies if the company switcher is shown.
7. Optional polish: rename "AI Insights" template panels (MED-02) or avoid demoing them; know that executive health will read ~50 on sparse data (MED-01).

## 7. Post-Audit Notes

- All findings cite exact file:line; all DB counts verified live via psql.
- Zero fabrication found in server-side metrics (the strongest asset: composition.service, cfo-advisor, executive-command-center all compute from Prisma).
- The demo risk is not dishonesty — it is emptiness. Fix the seed path (steps 1-3) and the demo becomes credible end-to-end.
