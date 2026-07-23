# Financial Core Consolidation — Platform Report

**Phase**: 19.0
**Status**: Documentation Only — No Code Changes
**Date**: July 2026

---

## Mission

Every monetary operation must flow through the same financial primitives. No exceptions. Every balance lookup, every conversion, every allocation, every display must trace back to a single canonical representation of money.

---

## Current State

### Two Precision Strategies Coexist

The codebase has two incompatible approaches to monetary values:

| Layer | Current Strategy | Risk |
|---|---|---|
| **Database** | `Prisma.Decimal(38, 12)` — 326 fields across all models | Correct |
| **Application (TypeScript)** | `number` (IEEE 754 double) — used in GL types, allocation engine, statement builders, intelligence engines | Precision loss on large values |
| **API / Serialization** | `string` via `Number.toString()` or `toFixed()` | Rounding mismatches at boundaries |

The database stores money correctly. The application layer immediately loses precision by converting `Decimal` → `number` at the boundary. Every `Number(row.balance)` call is a precision leak.

### 100+ Formatting Implementations

There are at least **5 independent `formatCurrency` functions** with different signatures, different currency support, and different rounding behavior:

| Location | Signature | Currency Support | Compact | Rounding |
|---|---|---|---|---|
| `src/lib/format.ts:20` | `formatCurrency(amount: number)` | USD only (`$`) | Yes (B/M/K) | `toFixed(2)` |
| `src/components/design-system/micro/micro-components.tsx:86` | `formatCurrency(value: number, compact = true)` | USD only (`$`) | Configurable | `toFixed(1)` compact, `toLocaleString` full |
| `src/modules/enterprise-intelligence/types.ts:154` | `formatCurrency(amount: number)` | USD only (`$`) | Yes (B/M/K) | `toFixed(2)` |
| `src/modules/financial-reporting/ai-commentary.service.ts:459` | `private formatCurrency(value, _currency)` | USD only (`$`) | Yes (B/M/K) | `toFixed(1)` compact, `toFixed(2)` full |
| `src/modules/intelligence/anomaly-detection.service.ts:167` | `formatCurrency(value: number)` | USD only (`$`) | Yes (B/M/K) | `toFixed(2)` |
| `src/lib/format.ts:2` | `formatMoney(amountStr, currencyCode)` | ISO 4217 (Intl) | No | `minimumFractionDigits: 2` |

Additionally, `Number().toFixed()` is called in **100+ locations** across services for ad-hoc formatting. Many of these calls are in financial-critical paths: cash position builders, aged payables/receivables, treasury reports, statement builders, and reconciliation engines.

### No Money Value Object

There is no `Money` type anywhere in the codebase. Monetary values flow as:
- `Prisma.Decimal` in database reads
- Converted to `number` via `Number()` at the service boundary
- Passed as `number` through business logic
- Formatted with `toFixed()` or `Intl.NumberFormat` at the display layer

This means:
- No compile-time enforcement that two amounts are in the same currency before arithmetic
- No prevention of adding USD to EUR
- No centralization of precision rules
- No audit trail of which precision policy was applied

### Conflicting Currency Registries

Four independent `SUPPORTED_CURRENCIES` sets exist:

| Location | Currencies | Purpose |
|---|---|---|
| `src/domain/constants/currencies.ts` | 3 (USD, EUR, GBP) | Domain validation |
| `src/modules/fx/fx.service.ts` | 12 | FX sync loop |
| `src/modules/fx/fx.provider.ts` | 12 | FX provider filtering |
| `src/server/banking/accounts/currencies/engine.ts` | 35 | Banking account currencies |

Three copies of `FALLBACK_RATES` exist in `currency.service.ts`, `fx.service.ts`, and `fx.provider.ts` (MockFxProvider) — all identical values, all independently maintained.

### Near-Duplicate Currency Services

`CurrencyService` and `FxService` share 80% of their code but differ in:

| Aspect | CurrencyService | FxService |
|---|---|---|
| First parameter | `ctx: TenantContext` | `companyId: string` |
| Rate lookup order | DB → fallback → inverse DB → inverse fallback | DB → inverse DB → fallback → inverse fallback |
| `convert()` precision | `toFixed(2)` → `Number()` | `toFixed(2)` → `Number()` |
| `setRate()` | Yes (upsert + audit) | No |
| `syncRates()` | No | Yes (from external providers) |
| `getSyncStatus()` | No | Yes |
| `checkHealth()` | No | Yes |
| `listAvailableCurrencies()` | Derived from FALLBACK_RATES keys | From SUPPORTED_CURRENCIES constant |

---

## Architecture Score: 5/10

| Dimension | Score | Notes |
|---|---|---|
| **Type Safety** | 2/10 | No Money type, `number` used everywhere, no currency pairing enforcement |
| **Precision** | 7/10 | DB layer correct (Decimal 38,12); 4 Float fields fixed (Phase 19.1); `financial-precision.ts` library created; application layer improving |
| **Consistency** | 3/10 | 5+ formatCurrency, 4 SUPPORTED_CURRENCIES, 3 FALLBACK_RATES, 2 currency services |
| **Duplication** | 3/10 | CurrencyService/FxService near-duplicate, FxProvider has its own FALLBACK_RATES |
| **Extensibility** | 4/10 | Adding a new currency requires changes in 4+ files |
| **Testability** | 5/10 | Services are static classes, hard to mock |
| **Auditability** | 6/10 | ExchangeRate writes are audited, but conversions are not |

---

## Consolidation Opportunities (High Priority)

### 1. Introduce Money Value Object
Create a `Money` type that pairs `Prisma.Decimal` with ISO 4217 currency code. All monetary arithmetic must flow through Money operations. Eliminates IEEE 754 risk and adds compile-time currency safety.

### 2. Merge CurrencyService + FxService
Create a single `CurrencyPlatformService` that combines rate lookup, rate sync, conversion, health monitoring, and currency metadata. Eliminate the near-duplicate implementations.

### 3. Unify SUPPORTED_CURRENCIES
Create a single source of truth with tiers: core (12), extended (35), banking-specific. All four current definitions import from one canonical list.

### 4. Consolidate FALLBACK_RATES
Single constant exported from one module. CurrencyService, FxService, and MockFxProvider all import from the same source.

### 5. Standardize formatCurrency
Single `formatCurrency(amount: Money, options?: FormatOptions)` function with locale-aware formatting, configurable compact mode, and per-currency decimal rules. Deprecate all 5+ current implementations.

### 6. Replace Number() Conversions
Audit all `Number(row.balance)` and `Number(row.amount)` calls. Replace with `Money.fromDecimal(row.balance, row.currency)` where the value enters business logic. Keep `Number()` only at the display boundary.

### 7. Fix GL Types to Use Decimal
GL types (`JournalEntry`, `BalanceSheet`, `IncomeStatement`, `AllocationRun`, etc.) currently use `number` for all monetary fields. These should use `Prisma.Decimal` or `Money` to maintain precision through the GL pipeline.

### 8. Add Conversion Audit Trail
Currency conversions currently return a result with no persistent audit record. Every conversion that feeds into a financial statement or GL entry should be logged with source rate, timestamp, and converted amount.

---

## Recommended Phases

### Phase 1: Foundation (Weeks 1-3)
- Define `Money` value object with operations
- Define single `SUPPORTED_CURRENCIES` with tiers
- Define single `FALLBACK_RATES` constant
- Create `CurrencyMetadata` registry (decimal places, symbol, name)
- Unit tests for Money operations
- **Risk**: Low — additive, no breaking changes

### Phase 2: Service Merge (Weeks 4-6)
- Create `CurrencyPlatformService` combining CurrencyService + FxService
- Migrate consumers of CurrencyService → CurrencyPlatformService
- Migrate consumers of FxService → CurrencyPlatformService
- Delete old CurrencyService and FxService
- Update fx-sync job to use new service
- **Risk**: Medium — API surface changes, require consumer migration

### Phase 3: Money Adoption (Weeks 7-9)
- Replace `number` with `Money` in GL types (JournalEntry, BalanceSheet, etc.)
- Replace `Number(row.balance)` calls with `Money.fromDecimal()` in top 20 consumers
- Add conversion audit trail
- Migrate statement builders to use Money
- **Risk**: Medium — type signature changes propagate through many files

### Phase 4: Formatting & Polish (Weeks 10-12)
- Implement canonical `formatCurrency(amount: Money)` with Intl.NumberFormat
- Deprecate old formatCurrency implementations
- Migrate all 100+ `toFixed()` calls in financial paths to use Money.toDisplay()
- Add ESLint rule: disallow `Number()` on Decimal fields
- **Risk**: Low — display layer changes, no data impact

---

## Risk Assessment

**Overall Risk: Medium**

| Risk | Severity | Mitigation |
|---|---|---|
| Precision loss in secondary paths | **High** (existing) | Money type eliminates this — priority fix |
| GL allocation rounding differences | Medium | Banker's rounding in Money.toDisplay(), truncation in Money.toDecimal() |
| Consumer migration breakage | Medium | Phase 2 migration with backward-compatible wrapper |
| Performance regression | Low | Prisma.Decimal operations are slower than `number`, but all DB reads already use Decimal |
| Data loss | **None** | No schema changes, no data migration, no existing data is lost |
| Cross-currency arithmetic bugs | Medium (existing) | Money type prevents adding different currencies at compile time |

### What Is NOT at Risk

- **Database precision** — Already correct (Decimal 38,12)
- **Audit trail** — ExchangeRate writes already audited
- **Existing functionality** — No behavioral changes, only precision improvements
- **Test suite** — All 443 tests remain valid; new tests added for Money type

---

## Success Criteria

1. Zero `Number()` calls on monetary Prisma.Decimal fields in business logic
2. Single `formatCurrency` function used across the entire UI
3. Single `SUPPORTED_CURRENCIES` constant imported by all consumers
4. Single `FALLBACK_RATES` constant imported by all consumers
5. CurrencyService and FxService merged into one service
6. Money type used in all GL types and statement builders
7. All currency conversions produce an audit record
8. `pnpm typecheck` and `pnpm build` pass with zero errors
