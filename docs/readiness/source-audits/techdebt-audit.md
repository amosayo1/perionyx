# Perionyx Technical Debt Register & Platform Validation Report

**Date:** 2026-08-07 · **Scope:** READ-ONLY audit of `/Users/horus/Desktop/vaultareloaded`
**Method:** Evidence-based grep/read of `src/` (4,011 TS/TSX files, 472 API routes). All findings cite `file:line`.

---

## 1. Executive Summary

| Severity | Count | Notes |
|---|---|---|
| Critical (P0) | 3 | Unremediated currency-formatting sprawl; growing `as any`; zero-consumer persistence layer shipped as "complete" |
| High (P1) | 4 | 3 live workflow engines; CurrencyService/FxService duplicate; UI-owned financial aggregation; incomplete EDL token migration |
| Medium (P2) | 5 | Foundation ~95% dead; identity parallel stack; legacy permission registry dead; 3 routes bypass RuntimeContext; unused analytics components |
| Low (P3) | 3 | Vault TODO stubs (documented); 5 event buses; legacy motion shim |

**Key numbers**
- `formatCurrency`: **650 occurrences / 147 files; 120 local definitions in components; 0 components import the canonical `@/lib/format.ts`** (Phase 19 debt NOT remediated — worse than the Phase 19.0 inventory)
- `as any`: **803** in src (excl. tests) — grew from 763 at Phase 25.5
- `@ts-ignore`: 0 · `@ts-expect-error`: 0
- TODO stubs: **exactly 4, all in `src/runtime/secrets/providers/vault.ts`** — claim CONFIRMED
- Dead code: `src/server/persistence/` (31 files) and `src/server/locks/` (5 files) have **zero consumers**
- Typecheck: **11 errors, ALL pre-existing** (8× `docs/site/`, 3× `prisma/seed-fresh.ts`) — no regressions
- Runtime convergence: `requireTenantContext` = 0 imports (comments only); `withRuntimeContext` = 461 files; **3 API routes still on legacy `auth()`**

---

## 2. Duplicate Inventory

| # | Module | Locations | Verdict |
|---|---|---|---|
| 1 | Currency service | `src/modules/currency/currency.service.ts:18` (CurrencyService) vs `src/modules/fx/fx.service.ts:24` (FxService) | **DUPLICATE** — byte-identical `FALLBACK_RATES` (`currency.service.ts:9-16` vs `fx.service.ts:15-22`); both read/write `prisma.exchangeRate`; live consumers on both sides (CurrencyService: `src/modules/transactions/transactions.service.ts`, `/api/v1/currencies/{convert,rates}`; FxService: `src/modules/queue/jobs/fx-sync.job.ts`, `/api/v1/fx/{sync,status,rates}`) |
| 2 | Supported currency sets | `src/domain/constants/currencies.ts:1` (3: USD/EUR/GBP) · `src/modules/fx/fx.service.ts:11-13` + `fx.provider.ts:4-6` (12) · `src/server/banking/accounts/currencies/engine.ts:3-8` (35) · `src/server/installer/installation-validator.ts:7-9` (10) · `src/server/fpa/fpa-seed.ts:106` (10) · `src/modules/sandbox/sandbox-enterprise-seed.ts:153` (6) | **CONFLICT** — 6 divergent sets (3–35 currencies); Phase 18.0/19.0 finding stands |
| 3 | formatCurrency | 120 local component definitions (e.g. `src/components/investments/credit-quality-chart.tsx:18`, `holdings-table.tsx:7`, `fpa-strategic-planning.tsx:6`) vs canonical `src/lib/format.ts:20` | **DUPLICATE (worst)** — zero components import the canonical formatter; 650 call sites total |
| 4 | Workflow engines | `src/modules/workflow/engine.ts:45` (WorkflowEngine, singleton) · `src/modules/orchestration/workflow-engine.ts:6` (OrchestrationExecutionEngine) · `src/modules/enterprise-workflow/engine.ts:18` (EnterpriseWorkflowEngine, singleton) | **TRIPLICATE, all live** — orchestration aliases legacy name at `src/modules/orchestration/orchestration.service.ts:16` (`static WorkflowEngine = OrchestrationExecutionEngine`); Phase 18.0's "two engines, different Prisma tables" is now three |
| 5 | Event buses | `src/modules/connector-platform/event-hooks.ts` (ConnectorEventBus, `Map<EventType, Set<Handler>>`) · `src/server/cache/cache-events.ts` · `src/server/banking/orchestrator/events/events.ts` · `src/server/realtime/event-bus.ts` · `src/server/procurement/domain/events/event-bus.ts` (APDomainEventBus) | **5 implementations** — Phase 18.1A reduced 7→2, but banking + realtime buses remain; classic identical `Map<EventType, Set<Handler>>` pattern in connector + cache + AP |
| 6 | Permission registries | `src/modules/rbac/permission-registry.ts` (24 permissions) vs `src/server/iam/permissions.ts` (104 `GranularPermission`s) | **CONFLICT (resolved in practice)** — IAM is canonical (used by `/api/v1/admin/permissions/route.ts:2,9`, identity permissions page, `src/server/identity/permission-manager.ts:1`); legacy 24-perm registry has **zero runtime consumers** (only re-exported at `src/modules/rbac/index.ts:10`) — should be deleted |
| 7 | Identity stacks | `src/server/identity/` (13 files: authentication, session-manager, sso-handler…) vs `src/server/auth/` (auth.ts + require-session.ts, 11 consumers) + `src/server/iam/` | **PARALLEL** — `server/identity` consumed ONLY by 9 admin pages (`src/app/(shell)/system/identity/*`); real auth path is `server/auth` (see §3) |
| 8 | Foundation vs Runtime | `src/server/foundation/{config,secrets,capability-registry,provider-runtime}` vs `src/runtime/{configuration,secrets,capabilities}` | **DUPLICATE (runtime won)** — both exist; runtime is initialized in `src/server/infrastructure.ts:68-87`; foundation duplicates have ~zero consumers (§3) |

---

## 3. Dead Code Inventory

| File/Dir | Files | Evidence of zero consumers |
|---|---|---|
| `src/server/persistence/` | 31 | `rg "server/persistence" src` → **0 hits outside the folder** (all imports, incl. `@/server/persistence`, `prisma-repository-registry`, `persistence/registry`: empty). Phase 7E shipped as "Complete" but never wired |
| `src/server/locks/` | 5 | `rg "server/locks" src` → 0 hits outside folder. Phase 7E.3 distributed locks never adopted |
| `src/server/foundation/` | 23 | Barrel `foundation/index.ts`: **0 consumers**. Per-subfolder: `capability-registry` 0, `secrets` 0, `provider-runtime` 0, `config` 1 (`src/runtime/configuration/registry.ts:22` imports `foundation/config/types` — types only), `classification` 1 (`src/server/infrastructure.ts:16-17`, 88-93 — real). **Phase 25.5 "zero adoption" claim CONFIRMED** (~95% dead) |
| `src/modules/rbac/permission-registry.ts` | 1 | 24-perm legacy registry: `rg "PermissionRegistry"` consumers all resolve to IAM; only `src/modules/rbac/index.ts:10` re-exports it. `rbac.service.ts` validates against Prisma `Permission` table (line 57 `upsert`), not this registry |
| `src/server/observability/logger.ts` | 1 | Now a 1-line compat shim re-exporting `@/lib/logger` (line 3); 0 direct importers — retains file purely for the barrel |
| `src/components/enterprise/analytics/` | 13 (~1,500 lines) | Phase 8B.5 components: 1 consumer total (`src/components/enterprise/intelligence-panel.tsx`) — 12/13 unused |
| `src/server/identity/` | 13 | **NOT dead** — 9 page consumers confirmed (`src/app/(shell)/system/identity/users/page.tsx:1,6` etc.), but isolated to admin pages; architecture debt (§2 #7) |

**Not dead (verified live):** `src/server/cache/` (11 consumer files, canonical `getCached`), `src/server/observability/` (barrel exports used), `src/server/realtime/` (SSE + event bus).

---

## 4. TypeScript Quality Metrics

| Metric | Count | Evidence |
|---|---|---|
| `as any` (src, excl. tests) | **803** | `rg "as any" src -g '*.ts' -g '*.tsx' -g '!**/__tests__/**' -g '!**/*.test.*'` — 246 in app+components, 537 in modules+server+lib, ~20 in runtime/domain. Grew from 763 (Phase 25.5) |
| `@ts-ignore` | **0** | — |
| `@ts-expect-error` | **0** | — |
| TODO/FIXME/HACK | **4 TODO** | All in `src/runtime/secrets/providers/vault.ts:25,30,36,60` — **claim CONFIRMED**; 0 TODOs anywhere else in src. Note: the Vault provider is a stub — every method throws "not implemented" (lines 31,37,42,47,52) |

---

## 5. UI-Owned Reasoning Findings (Engine Boundary)

**Violations — client components computing financial logic inline:**

| File:Line | What it computes |
|---|---|
| `src/components/investments/portfolio-overview.tsx:37-39` | Sums `marketValue`, `bookValue`, `unrealizedGain` from raw holdings via `.reduce()` — portfolio totals computed in the browser |
| `src/components/fpa/fpa-rolling-forecast.tsx:49-50` | Sums `confidenceLower`/`confidenceUpper` across forecast line items via `.reduce()` — financial aggregation in client |
| 120 components (incl. all 16 `src/components/investments/*`, FPA, fixed-assets, risk-v2) | Define their own `formatCurrency` (e.g. `credit-quality-chart.tsx:18`) — money formatting logic duplicated in every UI file, none use the Phase 19 standard |
| `src/components/fpa/fpa-analytics-dashboard.tsx:42-43` | Derives verdict thresholds from `budgetVariancePercent` / `forecastAccuracyPercent` (borderline presentation logic, flagged) |

**Compliant (verified):**
- `src/components/dashboard/dashboard-page-client.tsx:12,33` — imports `dashboardService`, a thin client fetch wrapper (`src/modules/dashboard/dashboard-service.ts:4-10` calls `/api/dashboard/data`) — correct client→API pattern
- `src/components/work-queue/work-queue-page-client.tsx:172` — uses canonical `toWorkQueueSlaLabel` (H-01 consolidation)
- `src/components/decision-workspace/*` — server pre-formats money (`format.ts`); client imports only `formatDateTime`/types
- Zero client components import `@/lib/financial-precision` (server-only, 13 consumers — correct)
- 136 client components import from `@/modules`/`@/server` — the overwhelming majority are **type-only** imports (orchestration, command-center, dashboard, copilot) — acceptable

---

## 6. Platform Validation Checklist

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | `pnpm typecheck` passes except pre-existing | **PASS** | `tsc --noEmit` → exactly 11 errors, all pre-existing: 8× `docs/site/` (TS2307 missing docusaurus/prism modules, e.g. `docs/site/docusaurus.config.ts:1-3`) + 3× `prisma/seed-fresh.ts` (TS2353, lines 63/139/149). Zero errors in `src/` |
| 2 | `requireTenantContext` fully removed | **PASS** | 2 files, both comments only: `src/server/context/tenant-context.ts:7`, `src/server/http/init-runtime-context.ts:9,86`. Function deleted (Phase 26.0A) |
| 3 | `withRuntimeContext` is canonical path | **PASS (3 stragglers)** | 461 files use it; Server Actions wired (`src/components/automation-studio/actions.ts:4,12`). Remaining legacy `auth()` routes: `src/app/api/v1/realtime/stats/route.ts:7,11`, `src/app/api/v1/realtime/health/route.ts`, `src/app/api/v1/invites/[token]/accept/route.ts` |
| 4 | UI components don't own financial reasoning | **FAIL** | §5 — portfolio-overview, fpa-rolling-forecast aggregate in browser; 120 local formatCurrency implementations |
| 5 | No new regression surface | **PASS** | typecheck clean; no build run per instructions |
| 6 | EDL token migration complete (22.0B.1) | **FAIL** | 13 files still carry legacy gold `#c9a84c`/`#d4a843` (active className `text-[#d4a843]` at `src/app/(shell)/system/system-tabs.tsx:28`; `src/app/(shell)/setup/page.tsx` 10 occurrences); 38 files carry legacy surfaces `#1a1a2e`/`#101010` (incl. 8 fixed-assets pages, `src/design-system/tokens/colors.ts`); `src/components/enterprise/motion/tokens.ts` remains a `@deprecated` shim with 35+ consumers vs 3 direct EDL imports |
| 7 | Deprecated accounting pages flagged | **PASS** | `DeprecationBanner` on 14 `/accounting/` pages (`src/app/(shell)/accounting/executive/page.tsx` etc.) |
| 8 | EnterpriseTable migration | **PARTIAL** | Ledger/transactions/audit-logs use `EnterpriseTable` (`ledger/page.tsx:10`) but still import legacy `FilterBuilder` + `InspectorPanel` from `@/components/data-table/` (`ledger/page.tsx:11-12`, `transactions/page.tsx:25-26`, `audit-logs/page.tsx:9-10`); incident components also use legacy inspector (`src/components/incidents/incident-table.tsx:6`) |

---

## 7. Top 10 Debt Items (Ranked)

1. **P0 — 120 local `formatCurrency` implementations / 650 call sites, zero adoption of canonical `@/lib/format.ts:20`.** Financial Formatting Standard (Phase 19.0) unimplemented in UI; every investments/FPA/fixed-assets screen formats money its own way. (Evidence: §2 #3)
2. **P0 — 803 `as any` in src** (up from 763 at Phase 25.5; 246 in app+components). Undermines the "strict mode" constitution claim. (§4)
3. **P0 — `src/server/persistence/` (31 files) shipped as "Complete" (Phase 7E) with zero consumers**, alongside `src/server/locks/` (5 files). ~2,000+ lines of unexercised repository/migration/unit-of-work infrastructure. (§3)
4. **P1 — Three live workflow engines** (`modules/workflow/engine.ts:45`, `modules/orchestration/workflow-engine.ts:6`, `modules/enterprise-workflow/engine.ts:18`) with the legacy-name alias at `orchestration.service.ts:16`. Phase 18.0's duplicate became a triplicate. (§2 #4)
5. **P1 — CurrencyService vs FxService duplicate** with identical FALLBACK_RATES + 6 conflicting SUPPORTED_CURRENCIES sets (3→35). Both write `prisma.exchangeRate`. (§2 #1, #2)
6. **P1 — Client-side financial aggregation** in `portfolio-overview.tsx:37-39` and `fpa-rolling-forecast.tsx:49-50` — violates the engine-boundary constitution (server computes, UI renders). (§5)
7. **P1 — EDL migration incomplete**: legacy gold in 13 files, legacy surfaces in 38 files, legacy motion shim with 35+ consumers. Governance tooling exists but has not been run to completion. (§6 #6)
8. **P2 — Foundation platform ~95% dead**: 23 files with 2 partial consumers; `foundation/index.ts` barrel has zero importers; capability-registry/secrets/provider-runtime have zero consumers. Phase 25.5 finding confirmed. (§3)
9. **P2 — 3 API routes bypass the canonical RuntimeContext path** (`realtime/stats`, `realtime/health`, `invites/[token]/accept`) — first-class convergence gaps. (§6 #3)
10. **P2 — Dead legacy permission registry** (`modules/rbac/permission-registry.ts`, 24 perms, zero consumers) kept alive by barrel re-export; delete after confirming no Prisma RBAC dependency. (§2 #6)
