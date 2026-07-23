# Financial Core Consolidation Plan

> Phase 19.0 — Financial Core Consolidation
> Status: **Documentation Only** — no code changes
> Timeline: 12 weeks across 4 phases

---

## 1. Objectives

1. **Single source of truth** for every financial primitive (currency, formatting, rounding, arithmetic)
2. **Eliminate all duplicates** — CurrencyService/FxService merge, 100+ formatCurrency → 5 canonical functions, 4 SUPPORTED_CURRENCIES → 1
3. **Full Decimal precision** — no `number` arithmetic for monetary values, no `Float` fields in Prisma for money
4. **Consistent display** — every financial amount formatted through the same canonical functions

---

## 2. Phase 19.1 — Foundation (Weeks 1–2)

> Create the primitives that all subsequent phases depend on.

### 2.1 Money Value Object

**File**: `src/lib/money.ts` (new)

```typescript
interface Money {
  amount: Prisma.Decimal;
  currency: string;
}
```

- Wrapper around `Prisma.Decimal` + ISO 4217 currency code
- Factory functions: `Money.fromDecimal(decimal, currency)`, `Money.fromNumber(number, currency)`, `Money.fromString(string, currency)`
- Comparison: `Money.equals(a, b)`, `Money.gt(a, b)`, `Money.lt(a, b)`
- Arithmetic: `Money.add(a, b)` — **same currency only**, throws on mismatch
- Serialization: `Money.toJSON()` returns `{ amount: string, currency: string }`

### 2.2 Financial Rounding

**File**: `src/lib/format.ts` (extend existing)

```typescript
function financialRound(value: Prisma.Decimal, decimals: number = 2): Prisma.Decimal
```

- Banker's rounding (round half to even) via `Intl.NumberFormat`
- Used by all financial calculations at the final step
- Never used for storage (store full precision)

### 2.3 Unified SUPPORTED_CURRENCIES

**File**: `src/lib/currencies.ts` (new)

Single constant with **35 currencies** — the superset from the banking engine:

```
USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD, CNY, HKD, SGD, SEK, NOK, DKK,
PLN, CZK, HUF, RON, BRL, MXN, ZAR, INR, KRW, THB, MYR, PHP, IDR, TWD,
SAR, AED, QAR, KWD, BHD, OMR, EGP
```

Each entry includes: `code`, `name`, `symbol`, `decimalPlaces`, `subunit`, `subunitValue`.

This constant replaces:
- `CurrencyService.SUPPORTED_CURRENCIES` (3 currencies)
- `FxService.SUPPORTED_CURRENCIES` (12 currencies)
- Banking engine's local array (35 currencies)
- Treasury component `SYMBOL_MAP` objects (4 currencies)

### 2.4 Unified FALLBACK_RATES

**File**: `src/lib/currencies.ts` (extend)

Single fallback rate table with **canonical ordering** (USD as base):

```
USD → 1.0
EUR → 0.92
GBP → 0.79
JPY → 149.50
... (all 35 currencies)
```

This replaces:
- `CurrencyService` fallback rates (3 entries, EUR-first)
- `FxService.FALLBACK_RATES` (12 entries, USD-first)

### 2.5 Prisma Float → Decimal Migration

**4 fields** storing monetary values as `Float` must be migrated to `Decimal(38,12)`:

| Model | Field | Current | Target | Risk |
|---|---|---|---|---|
| `MorningBriefing` | `cashPosition` | `Float` | `Decimal(38,12)` | Low — display only |
| `MorningBriefing` | `variance` | `Float` | `Decimal(38,12)` | Low — display only |
| `MorningBriefing` | `riskScore` | `Float` | `Decimal(38,12)` | Low — display only |
| `ApprovalMatrixRule` | `threshold` | `Float` | `Decimal(38,12)` | Medium — approval logic |

**Migration approach**: Create a new Prisma migration with `ALTER COLUMN` + `USING CAST`. Existing data is safe — Float → Decimal is lossless for typical monetary values.

### 2.6 Missing @db Directive Fix

**Model**: `ReconException`
**Field**: `expectedAmount` — currently `Decimal` without `@db` directive (defaults to unspecified precision).

**Fix**: Add `@db.Decimal(38,12)` to match the rest of the ledger domain.

### 2.7 Precision Inconsistency Fix

**Model**: `Forecast`
**Field**: `totalAmount` — currently `Decimal(38,11)` (11 decimal places).

**Fix**: Change to `Decimal(38,12)` to match the standard precision used across all other financial models.

### Phase 19.1 Deliverables

- [ ] `src/lib/money.ts` — Money value object
- [ ] `src/lib/currencies.ts` — SUPPORTED_CURRENCIES, FALLBACK_RATES, CurrencyMetadata
- [ ] `financialRound()` in `src/lib/format.ts`
- [ ] Prisma migration for Float → Decimal (4 fields)
- [ ] Prisma migration for ReconException @db directive
- [ ] Prisma migration for Forecast precision consistency
- [ ] Unit tests for Money value object
- [ ] Unit tests for financialRound()

---

## 3. Phase 19.2 — Service Consolidation (Weeks 3–4)

> Merge duplicate currency services and unify exchange rate handling.

### 3.1 CurrencyService + FxService → CurrencyPlatformService

**Current state**:
- `CurrencyService` (`src/modules/currency/currency.service.ts`) — 3 currencies, `getRate(from, to)`
- `FxService` (`src/modules/finance/fx.service.ts`) — 12 currencies, `convert(amount, from, to)`

**Target state**:
- `CurrencyPlatformService` (`src/modules/currency/currency-platform.service.ts`)
  - `convert(amount: Money, to: string, date?: Date): Promise<Money>`
  - `getRate(from: string, to: string, date?: Date): Promise<Prisma.Decimal>`
  - `supportedCurrencies(): CurrencyMetadata[]`
  - `isSupported(code: string): boolean`
  - Uses single `ExchangeRate` Prisma model (Decimal precision)

**Consumers to update**:
1. `src/modules/currency/currency.service.ts` consumers → migrate to CurrencyPlatformService
2. `src/modules/finance/fx.service.ts` consumers → migrate to CurrencyPlatformService
3. `src/modules/gl/domain/revaluation/` — uses FxService for GL revaluation
4. `src/modules/treasury/` — uses CurrencyService for cash position FX

### 3.2 Exchange Rate Model Consolidation

**Current state**: Two Prisma models:
- `CurrencyRate` — used by CurrencyService, `rate Float`
- `ExchangeRate` — used by FxService, `rate Decimal(38,12)`

**Target state**: Single `ExchangeRate` model with `Decimal(38,12)` precision.

**Migration**: Create new `ExchangeRate` records from `CurrencyRate` data, then drop `CurrencyRate`.

### 3.3 FxProvider Consolidation

**Current state**: `FxProvider` in `src/modules/finance/fx-provider.ts` references `FxService`.

**Target state**: `FxProvider` references `CurrencyPlatformService`. No API changes to FxProvider consumers.

### 3.4 GL RevaluationService Integration

**Current state**: `RevaluationService` uses `FxService.convert()`.

**Target state**: `RevaluationService` uses `CurrencyPlatformService.convert()`. The API is compatible — same `convert(amount, from, to)` signature.

### Phase 19.2 Deliverables

- [ ] `src/modules/currency/currency-platform.service.ts` — merged service
- [ ] Delete `src/modules/finance/fx.service.ts`
- [ ] Delete `CurrencyRate` Prisma model
- [ ] Update 4 consumers to use CurrencyPlatformService
- [ ] Update FxProvider to reference CurrencyPlatformService
- [ ] Integration tests for currency conversion
- [ ] Integration tests for GL revaluation

---

## 4. Phase 19.3 — Formatting Migration (Weeks 5–8)

> Replace 100+ local formatCurrency implementations with 5 canonical functions.

### 4.1 Canonical Functions

**File**: `src/lib/format.ts` (extend existing)

| Function | Signature | Use Case |
|---|---|---|
| `formatMoney` | `(amount: number \| string, currency?: string): string` | Full precision currency display |
| `formatCompact` | `(amount: number \| string, currency?: string): string` | Abbreviated `$1.2M`, `$3.4K` |
| `formatPercent` | `(value: number, decimals?: number): string` | Percentage with sign |
| `formatNumber` | `(value: number, decimals?: number): string` | Plain number with separators |
| `formatAccounting` | `(amount: number \| string, currency?: string): string` | Accounting parentheses for negatives |

All functions use `Intl.NumberFormat` internally and respect currency metadata for decimal places.

### 4.2 Cluster Migration Order

| Phase | Cluster | Files | Strategy |
|---|---|---|---|
| 1 | H (Server Services) | 3 | Remove private formatCurrency methods; return raw numbers from services |
| 2 | E (Cash Forecast) | 10 | Replace local `formatCash` with `formatCompact` from `@/lib/format` |
| 3 | G (Treasury Command) | 6 | Replace local `formatCompact` with canonical version |
| 4 | I (Enterprise Analytics) | 3 | Direct replacement — same API surface |
| 5 | F (Fixed Assets) | 5 | Replace local `formatCurrency` with `formatMoney`; add currency prop to components |
| 6 | A (Investment) | 14 | Replace local `formatCurrency` with `formatMoney`; add currency prop |
| 7 | B (FPA) | 15 | Replace local `formatCurrency` with `formatMoney`; add currency prop |
| 8 | C (Consolidation) | 13 | Replace local `formatCurrency` with `formatMoney`; add currency prop |
| 9 | D (Treasury) | 35+ | Replace local `formatCurrency` with `formatMoney`; remove SYMBOL_MAP; add currency prop |

### 4.3 Migration Pattern

For each file:

1. **Identify**: `grep` for local `formatCurrency` / `formatCash` / `formatCompact` definitions
2. **Check call sites**: Ensure call sites pass (or can pass) a currency parameter
3. **Replace**: Import `formatMoney` from `@/lib/format` and replace the local call
4. **Add currency prop** (if component doesn't already accept one): Add `currency?: string` prop with default `'USD'`
5. **Delete**: Remove the local formatting function
6. **Verify**: Run `pnpm typecheck` and `pnpm build`

### 4.4 Post-Migration Cleanup

- Grep codebase for any remaining local `formatCurrency` / `formatCash` / `formatCompact` definitions
- Add ESLint rule: "Financial formatting must use `@/lib/format` functions"
- Update component storybooks / documentation to reference canonical functions

### Phase 19.3 Deliverables

- [ ] `formatMoney`, `formatCompact`, `formatPercent`, `formatNumber`, `formatAccounting` in `src/lib/format.ts`
- [ ] 100 files migrated (approximate)
- [ ] 100+ local formatting functions deleted
- [ ] ESLint rule or convention added
- [ ] All clusters verified with `pnpm typecheck` + `pnpm build`

---

## 5. Phase 19.4 — Arithmetic Migration (Weeks 9–12)

> Eliminate native `number` arithmetic from all financial calculations.

### 5.1 GL Allocation Engine

**File**: `src/modules/gl/domain/allocations/allocations-service.ts`

**Current**: Uses `number` arithmetic for allocation calculations.

**Target**: Uses `Prisma.Decimal` for all calculations. Adds residual handling:
- Compute remainder: `originalAmount - sum(allocations)`
- Assign remainder to the first allocation entry
- Validate: `sum(allocations) === originalAmount` after residual assignment

### 5.2 Cash Application

**File**: `src/modules/ar/domain/cash-application/` (estimated)

**Current**: Uses `number` arithmetic for matching invoices to payments.

**Target**: Uses `Prisma.Decimal` for all amount comparisons and arithmetic.

### 5.3 Tax Integration

**File**: `src/modules/ar/domain/tax-integration/tax-integration-service.ts`

**Current**: Uses `number` arithmetic for tax calculations.

**Target**: Uses `Prisma.Decimal` for all tax computations. Jurisdiction-aware rounding via `financialRound()`.

### 5.4 Statement Builders (19 files)

**Current state**: 19 statement builder files convert `Prisma.Decimal` to `number` via `Number(value)` before performing arithmetic, then convert back for output.

**Target state**: All 19 builders operate directly on `Prisma.Decimal` — no `Number()` conversions.

**Files** (estimated):
- Income statement builders (4)
- Balance sheet builders (3)
- Cash flow statement builders (3)
- Trial balance builders (2)
- GL journal builders (3)
- Consolidation statement builders (2)
- Management report builders (2)

### 5.5 CFO Advisor Scenarios

**Current**: CFO advisor scenario calculations use `number` arithmetic.

**Target**: Migrate to `Prisma.Decimal` for consistency with all other financial calculations.

### Phase 19.4 Deliverables

- [ ] GL allocation engine: Prisma.Decimal + residual handling
- [ ] Cash application: Prisma.Decimal migration
- [ ] Tax integration: Prisma.Decimal + jurisdiction-aware rounding
- [ ] 19 statement builders: eliminate Number() conversions
- [ ] CFO advisor scenarios: Prisma.Decimal migration
- [ ] All financial arithmetic uses Prisma.Decimal (zero `number` arithmetic for money)
- [ ] All tests pass, all builds pass

---

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Prisma migration breaks existing data | High | Test migration on staging with production snapshot before applying |
| Decimal overflow (38 digits) | Low | 38 digits is sufficient for any realistic financial amount |
| CurrencyService merge breaks consumers | Medium | Run full test suite after merge; update consumers incrementally |
| Formatting migration introduces display bugs | Medium | Visual regression testing for each cluster; staged rollout |
| Arithmetic migration changes calculation results | High | Decimal arithmetic should produce identical results to well-implemented number arithmetic; validate with test vectors |

---

## 7. Success Criteria

After all 4 phases are complete:

1. **Zero** local `formatCurrency` / `formatCash` / `formatCompact` functions outside `src/lib/format.ts`
2. **Zero** `Float` fields in Prisma models that store monetary values
3. **Zero** `Number()` conversions in financial calculation code
4. **One** `CurrencyPlatformService` (not two currency services)
5. **One** `SUPPORTED_CURRENCIES` constant (not four)
6. **One** `FALLBACK_RATES` constant (not two)
7. **One** `ExchangeRate` Prisma model (not two)
8. All financial arithmetic uses `Prisma.Decimal`
9. All financial formatting uses canonical `@/lib/format` functions
10. `pnpm typecheck` passes, `pnpm build` passes, `pnpm test` passes

---

## 8. Related Documents

- `FINANCIAL_INTEGRITY_INVENTORY.md` — Full inventory of every financial implementation
- `FINANCIAL_PLATFORM_REPORT.md` — Platform-wide financial analysis
- `MONEY_ARCHITECTURE.md` — Money value object architecture
- `CURRENCY_ARCHITECTURE.md` — Currency service architecture
- `FINANCIAL_PRECISION_POLICY.md` — Precision and rounding policy
- `FINANCIAL_FORMATTING_STANDARD.md` — Formatting API specification
- `FINANCIAL_PRIMITIVES.md` — Financial primitive definitions
