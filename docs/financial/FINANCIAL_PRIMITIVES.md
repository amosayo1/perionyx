# Financial Primitives

> Phase 19.0 — Financial Core Consolidation
> Status: **Documentation Only** — no code changes

---

## 1. Overview

Every financial operation in the platform must be built on well-defined **primitives** — atomic building blocks for money, currency, formatting, validation, and arithmetic. This document inventories every existing primitive, identifies which are authoritative, which are duplicated, and which do not yet exist.

---

## 2. Primitive Inventory

### 2.1 Money Value Object

**Status**: NOT YET CREATED

**Current state**: No `Money` type exists. Financial amounts are represented as raw `number`, `Prisma.Decimal`, or `string` depending on the layer. This creates ambiguity — a `number` could be dollars, cents, or a percentage.

**Recommended design**:

```typescript
interface Money {
  amount: Prisma.Decimal;  // The numeric value, stored with full precision
  currency: string;         // ISO 4217 currency code (e.g., "USD", "EUR")
}
```

**Rules**:
- `amount` is always `Prisma.Decimal` — never `number` for financial storage
- `currency` is always validated against `SUPPORTED_CURRENCIES`
- Two `Money` values can only be added/compared if they share the same `currency`
- Cross-currency operations require an explicit exchange rate

**Prisma storage**: `Decimal(38,12)` with a companion `String` currency field.

---

### 2.2 Currency Service

**Status**: DUPLICATE — merge required

| Implementation | Location | Type |
|---|---|---|
| `CurrencyService` | `src/modules/currency/currency.service.ts` | Prisma-backed, supports 3 currencies (USD, EUR, GBP) |
| `FxService` | `src/modules/finance/fx.service.ts` | Prisma-backed, supports 12 currencies, includes `FALLBACK_RATES` |

**Authority**: Neither is authoritative. They have different:
- Currency sets (3 vs 12)
- Fallback rate ordering (EUR-first vs USD-first)
- API surfaces (`getRate` vs `convert`)
- Prisma models (`CurrencyRate` vs `ExchangeRate`)

**Recommendation**: Merge both into `CurrencyPlatformService` with:
- Single `SUPPORTED_CURRENCIES` constant (35 currencies from banking engine)
- Single `FALLBACK_RATES` constant (canonical ordering)
- Unified `convert(amount, from, to, date?)` API
- Prisma model: `ExchangeRate` (single table)

**Consumers to update**: 4 files reference `FxService`, 2 files reference `CurrencyService`.

---

### 2.3 Exchange Rate Service

**Status**: Same as Currency Service (post-merge)

**Current state**: Exchange rates are stored in two Prisma models with different schemas:
- `CurrencyRate` — used by `CurrencyService`, stores `rate` as `Float`
- `ExchangeRate` — used by `FxService`, stores `rate` as `Decimal(38,12)`

**Authority**: `ExchangeRate` schema is better (Decimal precision). `CurrencyRate` schema is simpler.

**Recommendation**: Single `ExchangeRate` model with `Decimal(38,12)` precision.

---

### 2.4 Financial Formatter

**Status**: EXISTS — needs extension

| Implementation | Location | Description |
|---|---|---|
| `formatMoney` | `src/lib/format.ts` | Basic currency formatting |
| `formatCurrency` | `src/lib/format.ts` | Alias / legacy name |

**Current API**:
- `formatMoney(amount: number, currency?: string): string`
- Uses `Intl.NumberFormat` internally

**Needs extension**:
- `formatCompact(amount, currency?)` — abbreviated notation
- `formatPercent(value, decimals?)` — percentage formatting
- `formatNumber(value, decimals?)` — plain number formatting
- `formatAccounting(amount, currency?)` — accounting parentheses for negatives
- Accept `number | string` input (handles Prisma.Decimal serialized strings)

See `FINANCIAL_FORMATTING_STANDARD.md` for complete specification.

---

### 2.5 Precision Policy

**Status**: INCONSISTENT across the codebase

**Storage precision** (Prisma schema):

| Location | Precision | Correct? |
|---|---|---|
| Most ledger models | `Decimal(38,12)` | ✅ Yes |
| `MorningBriefing` fields (3x) | `Float` | ❌ Must be `Decimal(38,12)` |
| `ApprovalMatrixRule.threshold` | `Float` | ❌ Must be `Decimal(38,12)` |
| `ReconException.expectedAmount` | No `@db` directive | ❌ Missing precision |
| `Forecast.totalAmount` | `Decimal(38,11)` | ⚠️ Should be `Decimal(38,12)` |

**Calculation precision**: `Prisma.Decimal` for arithmetic (never JavaScript `number`).

**Display precision**: Configurable per currency — see Currency Metadata (§2.8).

**Recommendation**: All monetary fields must be `Decimal(38,12)` in Prisma. All arithmetic must use `Prisma.Decimal`. Display precision is a formatting concern, not a storage concern.

---

### 2.6 Rounding Policy

**Status**: NOT YET CREATED

**Current state**: No standardized rounding. Components use:
- `Math.round()` — standard rounding (bias toward higher values)
- `toFixed(n)` — truncation-based rounding
- `Number(value.toFixed(2))` — inconsistent

**Recommended implementation**:

```typescript
function financialRound(value: Prisma.Decimal, decimals: number = 2): Prisma.Decimal
```

**Rules**:
- Use **banker's rounding** (round half to even) — the IEEE 754 default and the standard for financial calculations
- Implementation via `Intl.NumberFormat` with `minimumFractionDigits: decimals, maximumFractionDigits: decimals`
- Never use `Math.round()` for monetary amounts — it has asymmetric bias

**When to round**:
- **Display**: Always round for presentation (via `formatMoney`)
- **Storage**: Never round before storage — store full precision
- **Calculation**: Round only at the final step of multi-step calculations (e.g., tax = round(rate × amount), not round(rate) × amount)

---

### 2.7 Financial Calculator

**Status**: NOT YET CREATED

**Current state**: Financial calculations are scattered:
- GL allocation: inline arithmetic in `allocations-service.ts`
- Tax calculation: inline arithmetic in `tax-integration-service.ts`
- Interest calculation: inline arithmetic in `interest-calculation.service.ts`
- Statement building: 19 statement builders with `Number()` conversion

**Recommended design**: A centralized `FinancialCalculator` service that:
- All financial arithmetic goes through this service
- Uses `Prisma.Decimal` internally for all calculations
- Provides: `add`, `subtract`, `multiply`, `divide`, `allocate`, `applyTax`, `calculateInterest`
- Returns `Money` objects (not raw numbers)
- Handles rounding at the appropriate step

---

### 2.8 Currency Metadata

**Status**: NOT YET CREATED

**Current state**: Currency metadata (name, symbol, decimal places) is not centralized:
- `SUPPORTED_CURRENCIES` in `currency.service.ts` — 3 currencies
- `SUPPORTED_CURRENCIES` in `fx.service.ts` — 12 currencies
- `SUPPORTED_CURRENCIES` in `banking-engine` — 35 currencies
- Various `SYMBOL_MAP` objects in treasury components — 4 currencies

**Recommended design**:

```typescript
interface CurrencyMetadata {
  code: string;           // ISO 4217 (e.g., "USD")
  name: string;           // Display name (e.g., "US Dollar")
  symbol: string;         // Symbol (e.g., "$")
  decimalPlaces: number;  // Display decimals (e.g., 2 for USD, 0 for JPY, 3 for BHD)
  subunit: string;        // Subunit name (e.g., "cent")
  subunitValue: number;   // Subunit ratio (e.g., 100)
}
```

**Single source of truth**: `SUPPORTED_CURRENCIES` constant with 35 entries from the banking engine — the most comprehensive existing set.

---

### 2.9 Allocation Engine

**Status**: EXISTS — needs improvement

| Implementation | Location |
|---|---|
| `allocations-service.ts` | `src/modules/gl/domain/allocations/` |

**Current behavior**: Allocates amounts across GL accounts using percentage-based or fixed-amount rules.

**Issues**:
- Uses native `number` arithmetic — susceptible to floating-point drift
- No **residual handling** — when percentages don't sum to 100%, the remainder is silently dropped
- No validation that allocations sum to the original amount

**Required fixes**:
1. Migrate all arithmetic to `Prisma.Decimal`
2. Add residual handling: compute remainder after allocation, assign remainder to the first allocation
3. Add validation: `sum(allocations) === originalAmount`

---

### 2.10 Tax Calculation

**Status**: EXISTS — needs Decimal migration

| Implementation | Location |
|---|---|
| `tax-integration-service.ts` | `src/modules/ar/domain/tax-integration/` |

**Current behavior**: Calculates tax amounts based on tax rules and jurisdiction.

**Issues**:
- Uses `number` arithmetic
- Tax rounding rules differ by jurisdiction (some truncate, some round, some use banker's rounding)

**Required fix**: Migrate to `Prisma.Decimal` with jurisdiction-aware rounding.

---

### 2.11 Amount Validation

**Status**: EXISTS — AUTHORITATIVE

| Implementation | Location |
|---|---|
| `TransactionValidator` | `src/modules/ledger/transaction-validator.ts` |

**Current behavior**: Validates transaction amounts before posting. This is the single source of truth for:
- Amount format validation (numeric, positive/negative rules)
- Precision validation (max digits)
- Balance validation (debits = credits for double-entry)

**No changes required** — this is authoritative and well-implemented.

---

### 2.12 Currency Validation

**Status**: NOT YET CREATED

**Current state**: Currency validation is inconsistent:
- Some services check against their local `SUPPORTED_CURRENCIES` array
- Some services use `typeof currency === 'string'` (accepts any string)
- Some services don't validate currency at all

**Recommended implementation**:

```typescript
function isSupportedCurrency(code: string): boolean
// Checks against the single SUPPORTED_CURRENCIES constant
// Returns true for all 35 supported currencies
// Returns false for unknown codes
```

**Where to use**:
- API input validation (Zod schemas)
- Service method preconditions
- Prisma model save guards

---

### 2.13 Idempotency Service

**Status**: EXISTS — AUTHORITATIVE

| Implementation | Location |
|---|---|
| `IdempotencyService` | `src/modules/ledger/idempotency.service.ts` |

**Current behavior**: Prisma-backed idempotency for financial operations. Ensures that duplicate requests (e.g., double-click on "Submit") don't create duplicate transactions.

**No changes required** — this is authoritative and well-implemented.

---

### 2.14 Double-Entry Validation

**Status**: EXISTS — AUTHORITATIVE

| Implementation | Location |
|---|---|
| `PostingEngine` | `src/modules/ledger/posting-engine.ts` |

**Current behavior**: Enforces double-entry bookkeeping — every journal entry must have equal debits and credits. Validates before posting.

**No changes required** — this is authoritative and well-implemented.

---

## 3. Primitives Status Summary

| Primitive | Status | Action Required |
|---|---|---|
| Money Value Object | ❌ Not created | Create `Money` type wrapping Prisma.Decimal + currency |
| Currency Service | ⚠️ Duplicate | Merge CurrencyService + FxService → CurrencyPlatformService |
| Exchange Rate Service | ⚠️ Duplicate | Part of CurrencyService merge |
| Financial Formatter | ✅ Exists | Extend with formatCompact, formatPercent, formatNumber, formatAccounting |
| Precision Policy | ✅ IMPLEMENTED | 4 Float fields migrated to Decimal(20,4) via Phase 19.1 |
| Rounding Policy | ✅ IMPLEMENTED | `financialRound()` in `src/lib/financial-precision.ts` — banker's rounding via `Intl.NumberFormat` |
| Financial Calculator | ⚠️ Partially implemented | `multiplyDecimals`, `divideDecimals`, `allocateAmount`, `calculateTax`, `calculateWithholding` in `src/lib/financial-precision.ts` |
| Currency Metadata | ❌ Not created | Create single SUPPORTED_CURRENCIES with full metadata |
| Allocation Engine | ✅ IMPLEMENTED | `allocateAmount()` in `src/lib/financial-precision.ts` — residual handling via `financialRound(2)` |
| Tax Calculation | ✅ IMPLEMENTED | `calculateTax()` / `calculateWithholding()` in `src/lib/financial-precision.ts` — Decimal-safe with configurable rounding |
| Amount Validation | ✅ Authoritative | No changes |
| Currency Validation | ❌ Not created | Create isSupportedCurrency() |
| Idempotency Service | ✅ Authoritative | No changes |
| Double-Entry Validation | ✅ Authoritative | No changes |

---

## 4. Authoritative Implementations (Do Not Replace)

These three primitives are **authoritative** and must not be duplicated or replaced:

1. **`TransactionValidator`** (`ledger/transaction-validator.ts`) — All amount validation flows through this
2. **`IdempotencyService`** (`ledger/idempotency.service.ts`) — All idempotent operations use this
3. **`PostingEngine`** (`ledger/posting-engine.ts`) — All double-entry validation uses this

Any new financial feature must use these existing primitives rather than reimplementing similar logic.

---

## 5. Related Documents

- `FINANCIAL_FORMATTING_STANDARD.md` — Formatting API specification
- `FINANCIAL_CONSOLIDATION_PLAN.md` — Full consolidation roadmap
- `docs/persistence/` — Persistence architecture (Prisma.Decimal patterns)
