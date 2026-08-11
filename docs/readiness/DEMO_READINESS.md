# Demo Readiness — 2026-08-07

**Method:** live-DB verification (`postgresql://horus@localhost:5432/mydb`), data census, seed-path execution. **Consumer lens:** "Does a CFO walking through this demo see real data, real state transitions, and zero fabricated numbers?"

## Live Data Census (Postgres, 2026-08-07)

### Demo Company (tenant `cms4l23ir000136or3jydua9x`)

| Surface | Count | Status |
|---|---|---|
| AP: Vendors | **150** | ✅ SEEDED this survey (was 0) |
| AP: Invoices | **3,500** | ✅ SEEDED this survey (was 0) |
| AP: Approvals | 600 | ✅ SEEDED |
| AP: Exceptions | 350 | ✅ SEEDED |
| AP: Payments / Proposals / Batches | 649 / 250 / 120 | ✅ SEEDED |
| AP: Credits / Statements / Reconciliations | 130 / 40 / 40 | ✅ SEEDED |
| AP: Audit records | **21,780** | ✅ SEEDED (append-only trail) |
| Treasury accounts | 1 | ⚠️ seed-treasury.ts NOT yet run for demo tenant |
| Ledger entries | 0 | ⚠️ same — treasury + ledger empty |
| Payments / FX / Assets / Exec decisions | 0 | ⚠️ empty on demo tenant |

### Sandbox tenant (atlas-manufacturing-group)

| Surface | Count |
|---|---|
| Ledger entries | 10,000 |
| Transactions | 5,000 |
| Payments | 900 |
| FX rates | 60 |
| Treasury accounts | 10 |
| Exec scenarios / decisions | 3 / 60 |
| AP (vendors/invoices) | 0 — run `SEED_COMPANY_ID=… npx tsx src/server/procurement/seeds/ap-seed.ts` to populate |

## Blocker Found & Fixed (Critical, Demo-Blocker)

**Phantom company ID bug:** all 8 AP seed generators hardcoded `companyId: "cmqvfocev0001koor7ragb8bq"` — an ID with **zero rows and no tenant**. Running the seed produced 0 usable AP data and no error.

**Fix (this survey):**
- Every generator now accepts `targetCompanyId: string = companyId` (module-level `let companyId = process.env.SEED_COMPANY_ID ?? ""`), and seed functions set `companyId = targetCompanyId` first, so the module mutable propagates to every helper.
- `ap-seed.ts` now takes `--company-id` (or `SEED_COMPANY_ID`).
- **Verified live:** run produced 150 vendors / 3,500 invoices / 21,780 audit records on Demo Company; phantom ID count = **0**.

## Pre-Demo Checklist

1. ✅ AP seeded on Demo Company (this survey). For the Sandbox tenant, pass `SEED_COMPANY_ID` to `ap-seed.ts`.
2. **Run `npx tsx prisma/seed-treasury.ts` for the Demo Company tenant** — treasury accounts, transactions, ledger, forecasts are currently empty; executive cash position will show $0 and health ~50.
3. Demo on **Sandbox tenant** when the richest surface matters (5k txs, 10k ledger, 900 payments, 60 scenarios). Sandbox executives use real business logic — scenario pricing is calculated live from Seeded + 2× loaded state.
4. ✅ **Do not demo (resolved 28.1):** `/invoices` + `/audit-trail` were rebuilt on live Prisma data (1,673 open invoices / 21,780 AP audit records verified) — demoable. Remaining stubs to avoid: `/mobile-dashboard`, `/mobile/treasury`, treasury hub KPIs (`MOCK_*` — OPEN_DECISIONS D-04).
5. ✅ **Security:** all release blockers fixed in Phase 28.1 (C-01 header forgery, C-02 tick, C-03 API-key ADMIN, H-01 MFA enforcement, H-02/H-03 permissions) — network-exposed demos are safe.
6. **Brand:** all visible surfaces say Perionyx (6 executive pages fixed in 28.0).
7. **Know the numbers:** demo bootstrap endpoint publicly returns demo user/company IDs (fine for a demo tenant; seed-only tenant, no production data).

## Demo Narratives That Now Work End-to-End

- **CFO dashboard → AP drill-down:** KPI cards (open AP value, pending approvals, automation rate, exceptions) → `/work-queue` (3,500 seeded invoices with statuses/SLA/priority) → **Decision Workspace** per invoice (evidence package, recommendation, approve/escalate/block/void actions) → `/ledger`.
- **Treasury:** cash position → bank accounts, cash forecast, liquidity, payments (after treasury seed).
- **Executive:** KPI pages, risk register, scenario pilot (real pricing engine), morning briefing (real AI when configured), intelligence center.
