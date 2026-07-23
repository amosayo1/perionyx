# Financial Integrity Inventory — Phase 19.0

> **Status:** Complete  
> **Date:** 2026-07-21  
> **Scope:** Full inventory of money representation, currency services, formatting, precision, arithmetic, validation, and schema anomalies across the platform.

---

## Executive Summary

The platform has **two fundamentally different precision strategies**: Prisma.Decimal (correct for money) and native JavaScript `number` (unsafe for money). There is no unified Money value object. CurrencyService and FxService are near-duplicates with different APIs and different fallback ordering. Over 100 `formatCurrency` implementations exist across the codebase, mostly hardcoded to USD. Four conflicting `SUPPORTED_CURRENCIES` definitions range from 3 to 35 currencies. All 19 financial statement builders convert Prisma.Decimal to `Number()` for arithmetic, introducing silent precision loss on large values.

**Key risk:** Two services can return different rates for the same currency pair because they check fallback vs. inverse-DB in different order. This is not theoretical — it is a live code path difference.

---

## 1. Money Representation

### Current State

There is no Money value object anywhere in the platform. Money flows through three representations simultaneously:

| Layer | Type | Precision | Risk |
|-------|------|-----------|------|
| Prisma ORM | `Prisma.Decimal(38, 12)` | Exact — arbitrary-precision decimal | Safe |
| TypeScript runtime | `number` (IEEE 754 double) | ~15 significant digits | Unsafe above 9,007,199,254,740,991 (2^53) |
| API boundary | `string` (JSON) | Exact | Safe |

### Boundary Utilities

`src/server/http/money.ts` provides the two authoritative functions for API-boundary conversion:

- **`parsePositiveDecimalString(value, fieldName)`** — Validates, trims, and parses a string into `Prisma.Decimal`. Rejects empty, non-numeric, and non-positive values. This is the only safe ingress point.
- **`decimalToString(d)`** — Serializes any object with `.toString()` (including `Prisma.Decimal`) to string. This is the only safe egress point.

### Number() Conversion Risk

`Number()` conversion from Prisma.Decimal is pervasive in the codebase. While safe for amounts under ~10^15, it becomes a silent precision risk for:
- Consolidation of 10+ entities with amounts in the millions
- Cumulative depreciation schedules (loop arithmetic)
- FX conversions at extreme rate differentials (e.g., NGN 1,540/USD)
- Forecast aggregation across thousands of line items

**Estimated exposure:** Every service that calls `Number(row.amount)` or `Number(r.rate)` introduces this risk. Count is 50+ across the codebase.

---

## 2. Currency Services

### CurrencyService (`src/modules/currency/currency.service.ts`)

| Attribute | Value |
|-----------|-------|
| Class | `CurrencyService` (static) |
| Methods | `getRate`, `convert`, `setRate`, `listRates`, `listAvailableCurrencies` |
| Takes | `TenantContext` (full context object) |
| Queries | `prisma.exchangeRate` |
| Caching | Yes — `getCached()` with `CacheTier.LONG` via tenant-scoped cache key |
| Fallback rates | 6 base currencies, 12 pairs total |
| Consumers | 3 call sites |

### FxService (`src/modules/fx/fx.service.ts`)

| Attribute | Value |
|-----------|-------|
| Class | `FxService` (static) |
| Methods | `getRate`, `convert`, `syncRates`, `getLatestRates`, `getSyncStatus`, `checkHealth`, `listAvailableCurrencies` |
| Takes | `companyId: string` (no TenantContext) |
| Queries | `prisma.exchangeRate` |
| Caching | Yes — `getCached()` with `CacheTier.LONG` via tenant-scoped cache key |
| Fallback rates | Identical to CurrencyService (6 base currencies, 12 pairs) |
| Consumers | 4 call sites |
| Extra | `syncRates` (batch fetch from provider), `checkHealth`, `getSyncStatus` |

### CRITICAL: Different Fallback Ordering

The two services resolve the same currency pair in different order, meaning **the same pair can return different rates depending on which service is called**:

| Step | CurrencyService `getRate` | FxService `getRate` |
|------|---------------------------|---------------------|
| 1 | Identity check (same currency) | Identity check (same currency) |
| 2 | **Direct DB lookup** | **Direct DB lookup** |
| 3 | **Fallback rate** | **Inverse DB lookup** |
| 4 | **Inverse DB lookup** | **Fallback rate** |
| 5 | Inverse fallback | Inverse fallback |

**Example impact:** For currency pair (NGN, ZAR) with no direct DB row:
- FxService finds inverse DB row `(ZAR → NGN = 83.24)` → returns `rate = 1/83.24 = 0.01201`
- CurrencyService finds fallback `NGN → ZAR = 0.01201` (same value by coincidence here, but the lookup path differs and caching behavior may diverge)

For pairs where fallback and DB rates diverge (e.g., stale DB + current fallback), the results will differ.

### Two Prisma Models

Two separate models store exchange rates with no synchronization:

- **`ExchangeRate`** — Primary model, used by both CurrencyService and FxService. Fields: `baseCurrency`, `quoteCurrency`, `rate` (Decimal(38,12)), `source`, `validFrom`, `validTo`, `fetchedAt`. Unique constraint on `[companyId, baseCurrency, quoteCurrency]`.
- **`GLExchangeRate`** — GL-specific model, separate table (`gl_exchange_rates`). Fields: `fromCurrency`, `toCurrency`, `rate` (Decimal(38,12)), `rateType` ("historical"|"spot"|"average"|"closing"), `date`. No unique constraint. No `validFrom`/`validTo` concept. No `source` tracking.

These two models can (and will) contain different rates for the same pair on the same date, because GL rates support historical/average types while exchange rates represent spot/current.

---

## 3. FALLBACK_RATES (3 Copies)

### Copy 1: CurrencyService

**Location:** `src/modules/currency/currency.service.ts:9-16`

```
USD → EUR 0.92, GBP 0.79, JPY 149.5, CAD 1.36, CHF 0.88, AUD 1.53, MXN 17.2, BRL 4.98, NGN 1540, AED 3.67, ZAR 18.5
EUR → USD 1.09, GBP 0.86, JPY 162.5, CAD 1.48, CHF 0.96, AUD 1.66, NGN 1674, AED 4.0, ZAR 20.1
GBP → USD 1.27, EUR 1.16, JPY 189.2, NGN 1956, AED 4.67, ZAR 23.5
NGN → USD, EUR, GBP, AED, ZAR (computed inverses)
AED → USD, EUR, GBP, NGN, ZAR (computed inverses)
ZAR → USD, EUR, GBP, NGN, AED (computed inverses)
```

6 base currencies, 12 quote currencies per base where applicable.

### Copy 2: FxService

**Location:** `src/modules/fx/fx.service.ts:15-22`

Identical to CurrencyService. Byte-for-byte same structure, same values.

### Copy 3: MockFxProvider

**Location:** `src/modules/fx/fx.provider.ts:58-72`

Subset: USD (12 quotes), EUR (9 quotes), GBP (6 quotes) only. No NGN/AED/ZAR bases. Used only when `FX_API_KEY` is not set.

### Risk

Three identical (or near-identical) hardcoded rate tables will drift over time. There is no single source of truth. Updating rates in one location does not update the others.

---

## 4. SUPPORTED_CURRENCIES (4 Conflicting Definitions)

| Location | Count | Currencies | Used By |
|----------|-------|------------|---------|
| `src/domain/constants/currencies.ts` | 3 | USD, EUR, GBP | Wallet creation, `isSupportedCurrency()` |
| `src/modules/fx/fx.service.ts` | 12 | USD, EUR, GBP, JPY, CAD, CHF, AUD, MXN, BRL, NGN, AED, ZAR | FX sync loop, `listAvailableCurrencies()` |
| `src/modules/fx/fx.provider.ts` | 12 | Same 12 as fx.service | Provider rate filtering |
| `src/server/banking/accounts/currencies/engine.ts` | 35 | USD, EUR, GBP, AED, SAR, JPY, CNY, HKD, SGD, AUD, CAD, CHF, INR, KRW, SEK, NDK, DKK, PLN, ZAR, NGN, KES, EGP, BHD, QAR, KWD, OMR, MXN, BRL, TRY, MYR, THB, VND, PHP, TWD, NZD | Banking currency engine |

**Impact:** A user can create a wallet in USD/EUR/GBP only (domain constants). But banking accounts support 35 currencies. And FX rates are only maintained for 12. A user creating a SGD-denominated banking account will have no FX rates available from FxService.

---

## 5. Financial Formatting (100+ Implementations)

### Primary Formatters

| Function | File | Input | Currency Handling | Notes |
|----------|------|-------|-------------------|-------|
| `formatMoney(amountStr, currencyCode)` | `src/lib/format.ts` | `string` | Multi-currency via Intl | PRIMARY for string amounts |
| `formatMoney(amount, currencyCode)` | `src/components/enterprise/table/cell-formatters.tsx` | `string \| number` | Multi-currency via Intl | PRIMARY for tables |
| `formatCurrency(amount)` | `src/lib/format.ts` | `number` | **USD-only**, manual abbreviation | PRIMARY compact ($1.23B) |

### Component-Level Duplications

| Cluster | File Count | Pattern | Currency | Decimals | Notes |
|---------|------------|---------|----------|----------|-------|
| Investment components | 14 | `Intl.NumberFormat` | USD-only | 1 | Each defines own `formatCurrency` |
| FPA components | 15 | `Intl.NumberFormat` | USD-only | 0 | Each defines own `formatCurrency` |
| Consolidation components | 13 | `Intl.NumberFormat` | USD-only | 0 | Each defines own `formatCurrency` |
| Treasury components | 35+ | Mixed | 2 with multi-currency symbol maps, rest USD-only | 2 | Mostly inline formatting |
| Cash-forecast components | 10 | Identical `formatCash` function | USD-only | 0 | Exact duplicate across all 10 |
| Fixed-asset components | 5 | `Intl.NumberFormat` | USD-only | 0 | Same as FPA/consolidation |
| Enterprise analytics | 3 | `Intl.NumberFormat` | USD-only | 0 | In analytics directory |
| Design system | 2 | `Intl.NumberFormat` | Multi-currency, compact param | Variable | `src/components/design-system/` |
| Localization | 1 | `CurrencyLocalizationService` | i18n-aware | Variable | Only locale-aware implementation |

### Total

- **84** `function formatCurrency` definitions across the codebase
- **134** files reference `formatCurrency` (many are consumer/import sites)
- **17** files reference `formatMoney`
- **10** identical `formatCash` functions in cash-forecast components

---

## 6. Precision

### Prisma.Decimal(38, 12) — The Standard

Approximately 190 fields across the schema use `Decimal(38, 12)`. This is the correct representation for monetary values — arbitrary precision, no floating-point rounding.

### Float Fields That Are Monetary — CRITICAL

| Model | Field | Type | Risk |
|-------|-------|------|------|
| `MorningBriefing` | `pendingApprovalAmount` | `Float?` | **CRITICAL** — monetary amount displayed to executives |
| `MorningBriefing` | `cashPosition` | `Float?` | **CRITICAL** — daily cash balance |
| `MorningBriefing` | `cashChange` | `Float?` | **CRITICAL** — daily cash delta |
| `ApprovalMatrixRule` | `thresholdValue` | `Float?` | **CRITICAL** — monetary threshold for approval routing |

### Float Fields That May Be Monetary — MEDIUM

| Model | Field | Type | Risk |
|-------|-------|------|------|
| `TreasuryCashPool` | `interestRate` | `Float?` | MEDIUM — rate, not amount, but inconsistent with DebtInstrument |
| `KPIValue` | `currentValue` | `Float` | MEDIUM — could be monetary (category "financial", unit "USD") |
| `KPIValue` | `previousValue` | `Float?` | MEDIUM — same as above |
| `KPIValue` | `targetValue` | `Float?` | MEDIUM — same as above |
| `KPIValue` | `variance` | `Float?` | MEDIUM — same as above |
| `KPIValue` | `variancePercent` | `Float?` | LOW — percentage, not amount |

### No Banker's Rounding

No banker's rounding (round-half-to-even) implementation exists anywhere in the codebase. All rounding uses JavaScript's default `Math.round` (round-half-away-from-zero) or `.toFixed()` (round-half-up).

### Two Conflicting Round Implementations

Report builders use two different rounding patterns:

- **Pattern A (decimal-shift):** Multiply by 10^N, Math.round, divide by 10^N. Used in some statement builders.
- **Pattern B (nearest-unit):** Math.round directly. Used in others.

Neither implements banker's rounding. The inconsistency means different reports may round the same value differently.

### `.toDecimalPlaces()` Is Truncation

Prisma.Decimal's `.toDecimalPlaces()` is **truncation** (floor), not rounding. This means amounts like `1234.56789` truncated to 2 places become `1234.56` not `1234.57`. This is correct behavior for some financial contexts (e.g., flooring a discount) but incorrect for display rounding.

### Reconciliation Uses Decimal(19, 4)

The `ReconException` model uses `Decimal(19, 4)` for `amount` and `varianceAmount`, while the rest of the financial system uses `Decimal(38, 12)`. This means:
- Maximum value: 999,999,999,999,999.9999 (19 digits total, 4 decimal)
- Compared to: 999,999,999,999,999.999999999999 (38 digits total, 12 decimal)
- Risk: A variance amount with more than 4 decimal places will be silently truncated.

---

## 7. Arithmetic on Monetary Values

### GL Allocation Engine — HIGH Risk

**Location:** GL allocation module

Uses native `number` arithmetic with no residual handling. When allocating a $1,000,000.00 amount across 7 departments, floating-point drift can leave residual amounts unallocated or over-allocated. No explicit rounding-to-zero or largest-remainder method.

### Cash Application — MODERATE Risk

**Location:** Cash application module

Uses native `number`. Phantom unallocated amounts can appear when matching payments to invoices due to floating-point addition drift. A $0.0000000001 phantom residual can prevent auto-reconciliation.

### Tax Integration — MODERATE Risk

**Location:** Tax calculation modules

Uses native `number` with a `0.01` tolerance workaround. The tolerance masks floating-point drift rather than eliminating it. For high-volume taxpayers, accumulated error across thousands of transactions can exceed the 0.01 threshold.

### All 19 Statement Builders — SYSTEMIC Risk

Every financial statement builder (income statement, balance sheet, cash flow, etc.) follows the same pattern:

```
Number(row.amount) // Prisma.Decimal → native number
// ... then native +, -, * arithmetic
```

This is systemic — every builder has this pattern. For small companies, the risk is negligible. For enterprise customers with consolidated statements across 10+ subsidiaries, precision loss accumulates.

### Cash Position Builder — MODERATE-HIGH Risk

Uses native `+=` on converted values across multiple account aggregations. Each addition introduces drift. Over 50+ account lines, drift can reach cents.

### Fixed Asset Depreciation — MODERATE Risk

Cumulative rounding in the schedule loop. Each period's depreciation is rounded, and the rounded value feeds into the next period's base. Over 120 months (10-year asset), cumulative rounding error can reach $0.01-$1.00 depending on asset value.

### CFO Advisor Scenario Modeling — MODERATE Risk

Native number arithmetic for what-if scenarios. Inputs are already approximate (assumptions), so precision loss from floating-point is lower priority than input accuracy. However, scenario comparison charts will show phantom differences if base calculations drift differently.

---

## 8. Validation

### Amount Validators (4)

| Validator | Path | Notes |
|-----------|------|-------|
| `parsePositiveDecimalString` | `src/server/http/money.ts` | Authoritative. Validates string → Decimal, rejects ≤0. |
| Zod `z.string().refine()` | Various API routes | Ad-hoc string-to-number validation. Some use `z.number()`, some `z.string()`. |
| `amount > 0` checks | Inline in service methods | Basic positivity checks, no type safety. |
| `parseFloat` / `Number` | Inline in API handlers | Unvalidated conversion, no bounds checking. |

### Currency Validators (7)

| Validator | Path | Notes |
|-----------|------|-------|
| `isSupportedCurrency` | `src/domain/constants/currencies.ts` | Only 3 currencies (USD/EUR/GBP). |
| `CurrencyEngine.isSupportedCurrency` | `src/server/banking/accounts/currencies/engine.ts` | 35 currencies. |
| `CurrencyService.listAvailableCurrencies` | Derived from FALLBACK_RATES | 12 currencies. |
| `FxService.listAvailableCurrencies` | From SUPPORTED_CURRENCIES constant | 12 currencies. |
| Zod `z.enum()` | Various API routes | Hardcoded currency lists. |
| `Intl.supportedValuesOf('currency')` | Some formatting code | All ISO 4217. |
| Inline `=== 'USD'` checks | 50+ locations | Hardcoded single-currency assumptions. |

### Idempotency Systems (3)

| System | Location | Scope |
|--------|----------|-------|
| Transaction idempotency | Transfer/credit endpoints | Replays detection via `idempotencyKey` |
| FX rate sync idempotency | FxService (upsert) | Natural idempotency via unique constraint |
| Approval idempotency | Approval workflow | Re-approval detection via status check |

### Core Path Validation Quality

The credit/transfer path has 4+ validation gates (API schema, business rule, balance check, idempotency) — well-layered.

### 10 Secondary-Path Gaps

| Gap | Location | Risk |
|-----|----------|------|
| Treasury deposit no amount validation | Treasury API routes | Unbounded deposits |
| Reconciliation exception amounts | Recon exception API | No Decimal parsing |
| Controller journal amounts | Journal API routes | `parseFloat` without validation |
| Batch payment totals | Bulk payment endpoint | Sum validation missing |
| Forecast line item amounts | Forecast API | No bounds checking |
| Budget line item amounts | Budget API | No bounds checking |
| Tax payment amounts | Tax API routes | Tolerance masking |
| Fixed asset cost basis | Asset API routes | Positive check only |
| Investment holding notional | Investment API routes | No validation |
| Intercompany elimination amounts | Consolidation API | Cross-entity sum not verified |

---

## 9. Prisma Schema Anomalies

### ReconException.expectedAmount: Decimal? (No @db Directive)

```
expectedAmount     Decimal?
```

All other Decimal fields in the model have explicit `@db.Decimal(N, M)` directives. This field defaults to Prisma's `Decimal` type without precision specification, which maps to PostgreSQL's `decimal` without explicit precision (effectively unlimited but with driver-level defaults).

### Forecast.totalAmount: Decimal(38, 11)

```
totalAmount     Decimal  @db.Decimal(38, 11)
```

Should be `Decimal(38, 12)` to match the platform standard. The 11th decimal place difference means values are rounded one digit sooner than all other monetary fields.

### ForecastVersion.totalAmount: Decimal(38, 11)

```
totalAmount       Decimal  @db.Decimal(38, 11)
```

Same issue as Forecast. Both forecast-related models are off by one decimal place from the standard.

### TreasuryCashPool.interestRate: Float? vs DebtInstrument.interestRate: Decimal(10, 6)

```
// TreasuryCashPool
interestRate       Float?

// DebtInstrument
interestRate       Decimal  @db.Decimal(10, 6)
```

Two models representing the same concept (interest rate on a financial instrument) use different types. `Float` loses precision for rates like `4.123456%` while `Decimal(10,6)` preserves them exactly.

### Unnormalized Float Fields in Financial Models

The following Float fields in financial models are not strictly monetary but affect financial calculations:

| Model | Fields | Risk |
|-------|--------|------|
| `MorningBriefing` | 3 monetary Float fields | Executive-visible numbers with IEEE 754 drift |
| `ApprovalMatrixRule` | 1 monetary Float field | Threshold comparison with drift risk |
| `TreasuryCashPool` | `targetUtilization`, `currentUtilization`, `interestRate` | Utilization ratios, interest rate |
| `KPIValue` | `currentValue`, `previousValue`, `targetValue`, `variance`, `variancePercent` | Conditionally monetary based on `unit` field |

---

## Appendix: Source Files Referenced

| File | Lines | Key Contents |
|------|-------|-------------|
| `src/modules/currency/currency.service.ts` | 173 | CurrencyService, FALLBACK_RATES (copy 1) |
| `src/modules/fx/fx.service.ts` | 273 | FxService, FALLBACK_RATES (copy 2), SUPPORTED_CURRENCIES (copy 2) |
| `src/modules/fx/fx.provider.ts` | 82 | MockFxProvider, ExchangeRateHostProvider, SUPPORTED_CURRENCIES (copy 3) |
| `src/modules/fx/fx.types.ts` | 26 | FxRate, FxProvider, FxSyncResult, FxSyncStatus |
| `src/server/http/money.ts` | 23 | parsePositiveDecimalString, decimalToString |
| `src/domain/constants/currencies.ts` | 10 | SUPPORTED_CURRENCIES (copy 1, 3 currencies) |
| `src/lib/format.ts` | 36 | formatMoney, formatCurrency |
| `src/server/banking/accounts/currencies/engine.ts` | 97 | CurrencyEngine, SUPPORTED_CURRENCIES (copy 4, 35 currencies) |
| `prisma/schema.prisma` | — | ExchangeRate, GLExchangeRate, Forecast, ForecastVersion, ReconException, MorningBriefing, ApprovalMatrixRule, TreasuryCashPool, DebtInstrument, KPIValue |
