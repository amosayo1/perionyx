# Financial Precision Policy

**Phase**: 19.0 — Financial Core Consolidation (Updated 19.1)
**Status**: Implementation Partial — See §Financial Precision Library
**Date**: July 2026

---

## Overview

Every monetary value in the platform passes through four stages: storage, calculation, serialization, and display. Each stage has a defined precision policy. This document establishes the canonical rules.

---

## Storage Precision

### Database Columns

All monetary amounts use `Decimal(38, 12)` in Prisma schema:

```prisma
balance     Decimal @default(0) @db.Decimal(38, 12)
primaryAmount Decimal @db.Decimal(38, 12)
rate        Decimal @db.Decimal(38, 12)
amount      Decimal @db.Decimal(38, 12)
```

**326 Decimal fields** exist across the schema. All use `Decimal(38, 12)` except:
- `estimatedCost` in AgentDefinition: `Decimal(18, 10)` — not monetary, represents AI token cost estimates

### Why 38,12

| Parameter | Value | Rationale |
|---|---|---|
| Precision | 38 digits | Supports values up to ~10^26 (far exceeds any real-world monetary amount) |
| Scale | 12 decimal places | Supports subdivision to 10^-12 (sufficient for crypto, high-precision rates) |
| Total storage | 16 bytes | PostgreSQL Decimal(38,12) uses 16 bytes — same as `double` but exact |

### Rate Precision

Exchange rates use `Decimal(38, 12)` — same as monetary amounts. This provides:
- 12 decimal places for rates (e.g., 1 USD = 0.921234567890 EUR)
- Sufficient for high-frequency FX and crypto rate precision
- No loss when computing inverse rates (1/0.92 = 1.086956521739...)

### Score/Ratio Precision

Non-monetary decimal values (compliance scores, attendance rates, confidence scores) use `Prisma.Decimal` without column-level constraint. These are:
- Scores: 0-100 range, typically 2-4 decimal places
- Ratios: 0-1 range, typically 4 decimal places
- Percentages: 0-100 range, typically 1-2 decimal places

---

## Calculation Precision

### Rule: Prisma.Decimal for All Monetary Calculations

**Native `number` (IEEE 754 double) is PROHIBITED for monetary calculations.**

Every monetary calculation must use `Prisma.Decimal` arithmetic:

```typescript
// CORRECT
const total = amount1.add(amount2);
const product = amount.mul(new Prisma.Decimal(quantity));
const quotient = total.div(new Prisma.Decimal(count));

// PROHIBITED
const total = Number(amount1) + Number(amount2);  // ❌ Precision loss
const product = Number(amount) * quantity;          // ❌ IEEE 754 rounding
const result = (a * rate).toFixed(2);               // ❌ Implicit rounding
```

### Prisma.Decimal Operations

| Operation | Method | Precision |
|---|---|---|
| Addition | `a.add(b)` | Exact (up to 38 digits) |
| Subtraction | `a.sub(b)` | Exact (up to 38 digits) |
| Multiplication | `a.mul(b)` | Exact (up to 38 digits) |
| Division | `a.div(b)` | Exact (up to 38 digits, repeating decimals truncated) |
| Negation | `a.neg()` | Exact |
| Absolute | `a.abs()` | Exact |
| Comparison | `a.gt(b)`, `a.lt(b)`, `a.equals(b)` | Exact |
| Rounding | `a.toDecimalPlaces(n)` | Configurable |
| Conversion | `a.toNumber()` | **Lossy** — only for display |

### When `toNumber()` Is Allowed

`Prisma.Decimal.toNumber()` is **only** allowed at the display boundary — the point where a value transitions from business logic to UI rendering. It is never allowed in:
- Business logic calculations
- Comparisons that affect financial decisions
- Aggregation (sum, average, min, max)
- Conditional checks that gate financial operations

```typescript
// ALLOWED — display boundary
function formatForDisplay(money: Money): string {
  const value = money.amount.toNumber();  // Display only
  return new Intl.NumberFormat(...).format(value);
}

// PROHIBITED — business logic
function shouldAlert(balance: Prisma.Decimal, threshold: number): boolean {
  return balance.toNumber() > threshold;  // ❌ Use balance.gt(new Prisma.Decimal(threshold))
}
```

---

## Display Precision

### Per-Currency Decimal Places

Display precision is determined by the currency metadata registry:

| Currency | Code | Decimal Places | Example |
|---|---|---|---|
| US Dollar | USD | 2 | $1,234.56 |
| Euro | EUR | 2 | €1,234.56 |
| British Pound | GBP | 2 | £1,234.56 |
| Japanese Yen | JPY | 0 | ¥1,235 |
| Kuwaiti Dinar | KWD | 3 | د.ك1,234.567 |
| Bahraini Dinar | BHD | 3 | ب.د1,234.567 |
| Nigerian Naira | NGN | 2 | ₦1,234.56 |
| UAE Dirham | AED | 2 | د.إ1,234.56 |
| South African Rand | ZAR | 2 | R1,234.56 |

### Display Modes

| Mode | Use Case | Rounding | Example |
|---|---|---|---|
| **Full** | Forms, tables, detail views | Per-currency decimal places | $1,234.56 |
| **Compact** | Dashboards, KPIs, charts | Per-currency, then abbreviated | $1.23K, $1.23M, $1.23B |
| **Precise** | Audit logs, reconciliation | Maximum decimal places | $1,234.567890 |
| **Statement** | Financial statements | Per-currency, right-aligned | $1,234.56 |

---

## Rounding Policy

### Banker's Rounding (Round-Half-to-Even)

For display formatting, the canonical rounding method is **banker's rounding** via `Intl.NumberFormat`:

```typescript
const formatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: currencyCode,
  minimumFractionDigits: metadata.decimalPlaces,
  maximumFractionDigits: metadata.decimalPlaces,
  roundingMode: "half-even",  // Banker's rounding
});
```

Banker's rounding minimizes cumulative bias:
- 0.5 rounds to 0 (even)
- 1.5 rounds to 2 (even)
- 2.5 rounds to 2 (even)
- 3.5 rounds to 4 (even)

### Truncation for Scores

Non-monetary scores (compliance, health, confidence) are truncated, not rounded:
- Score of 87.67% displays as 87.7% (1 decimal)
- Score of 99.99% displays as 100.0%
- Confidence of 0.8765 displays as 87.7%

### No Rounding in Calculations

Intermediate calculations never round. Rounding is applied only at the final display step:

```typescript
// CORRECT — no intermediate rounding
const allocation = totalAmount.mul(percentage).div(new Prisma.Decimal(100));
const display = formatMoney(Money.fromDecimal(allocation, currency));

// PROHIBITED — premature rounding
const allocation = Number((totalAmount * percentage / 100).toFixed(2));  // ❌
```

---

## The round() Function

### Canonical Implementation

Single implementation using `Intl.NumberFormat` with `roundingMode`:

```typescript
function round(
  value: Prisma.Decimal | number,
  options: {
    decimalPlaces: number;
    mode?: "half-even" | "half-up" | "half-down" | "ceiling" | "floor" | "up" | "down" | "trunc";
  }
): string {
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: options.decimalPlaces,
    maximumFractionDigits: options.decimalPlaces,
    roundingMode: options.mode ?? "half-even",
  });
  
  const num = value instanceof Prisma.Decimal ? value.toNumber() : value;
  return formatter.format(num);
}
```

### Usage

```typescript
// Display $1,234.5678 as $1,234.57 (banker's rounding)
round(new Prisma.Decimal("1234.5678"), { decimalPlaces: 2 });
// → "1,234.57"

// Display score 87.654 as 87.7 (truncate for scores)
round(87.654, { decimalPlaces: 1, mode: "trunc" });
// → "87.7"

// Display rate 1.23456789 as 1.2346 (4 decimal places)
round(new Prisma.Decimal("1.23456789"), { decimalPlaces: 4 });
// → "1.2346"
```

---

## Number() Conversion Rules

### PROHIBITED for Monetary Calculations

```typescript
// ❌ PROHIBITED — never convert Money/Decimal to number for arithmetic
const total = Number(wallet.balance) + Number(treasury.balance);
const result = Number(amount) * Number(rate);
const adjusted = Number(balance) - Number(reserve);
```

### ALLOWED for Display Formatting Only

```typescript
// ✅ ALLOWED — at display boundary only
function formatCurrency(money: Money): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: money.currency,
  }).format(money.amount.toNumber());  // Display boundary
}

// ✅ ALLOWED — non-monetary numeric values
const percentage = (completed / total) * 100;
const daysSince = Math.floor((Date.now() - created.getTime()) / 86400000);
```

### ESLint Rule (Recommended)

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='toNumber']",
        "message": "Decimal.toNumber() is only allowed at display boundaries. Use Decimal arithmetic instead."
      }
    ]
  }
}
```

---

## Residual Handling

### GL Allocations

When allocating a total amount across multiple target accounts using percentage-based rules, rounding can produce a residual (the difference between the source amount and the sum of allocated amounts).

**Policy**: The residual is allocated to the **first target account**.

```typescript
// Example: Allocate $100.00 across 3 accounts at 33.33% each
// Naive: 33.33 + 33.33 + 33.33 = 99.99 (residual: $0.01)
// Policy: 33.34 + 33.33 + 33.33 = 100.00 (residual added to first)

function allocateWithResidual(total: Money, percentages: Prisma.Decimal[]): AllocationEntry[] {
  const entries: AllocationEntry[] = [];
  let remaining = total;
  
  for (let i = 0; i < percentages.length; i++) {
    const isLast = i === percentages.length - 1;
    const amount = isLast 
      ? remaining  // Last entry gets the residual
      : total.mul(percentages[i]).div(new Prisma.Decimal(100));
    
    entries.push({ index: i, amount });
    remaining = remaining.sub(amount);
  }
  
  return entries;
}
```

### Cash Application

When applying cash to multiple invoices, the same residual policy applies:
- Allocate full amounts to invoices in order
- Any remaining cents are applied to the last invoice

### Tax Calculations

Tax amounts use the same residual policy:
- Calculate tax per line item
- Sum of line item taxes may differ from total tax by a fraction of a cent
- Residual is added to the first line item

---

## Tolerance Thresholds

### Cross-Currency Validation

When validating that a converted amount matches an expected amount:

| Comparison | Tolerance | Rationale |
|---|---|---|
| Same currency amount comparison | 0.00 (exact) | No conversion involved |
| Cross-currency conversion check | 0.01 | Rounding at display boundary |
| Rate comparison (same source) | 0.0001 | Rate precision to 4 decimals |
| Rate comparison (different sources) | 0.01 | External rates may differ |
| Balance reconciliation | 0.00 | Must balance exactly |
| GL trial balance | 0.00 | Debits must equal credits |

### Implementation

```typescript
function amountsMatch(a: Money, b: Money, tolerance?: Prisma.Decimal): boolean {
  if (a.currency !== b.currency) {
    throw new CurrencyMismatchError("amountsMatch", a.currency, b.currency);
  }
  const tol = tolerance ?? new Prisma.Decimal(0);
  return a.amount.sub(b.amount).abs().lte(tol);
}

function ratesMatch(a: Prisma.Decimal, b: Prisma.Decimal, tolerance?: Prisma.Decimal): boolean {
  const tol = tolerance ?? new Prisma.Decimal("0.0001");
  return a.sub(b).abs().lte(tol);
}
```

---

## Per-Currency Precision Rules

### Core Currencies (Tier 1)

| Currency | Code | Decimal Places | Subunit | Notes |
|---|---|---|---|---|
| US Dollar | USD | 2 | Cent | Primary reporting currency |
| Euro | EUR | 2 | Cent | |
| British Pound | GBP | 2 | Penny | |
| Canadian Dollar | CAD | 2 | Cent | |
| Swiss Franc | CHF | 2 | Rappen | |
| Australian Dollar | AUD | 2 | Cent | |
| Mexican Peso | MXN | 2 | Centavo | |
| Brazilian Real | BRL | 2 | Centavo | |
| Nigerian Naira | NGN | 2 | Kobo | Large values (1540 NGN/USD) |
| UAE Dirham | AED | 2 | Fils | Pegged to USD |
| South African Rand | ZAR | 2 | Cent | |
| Japanese Yen | JPY | 0 | Sen | No subunit in practice |

### Extended Currencies (Tier 2)

| Currency | Code | Decimal Places | Subunit | Notes |
|---|---|---|---|---|
| Kuwaiti Dinar | KWD | 3 | Fils | Highest value currency |
| Bahraini Dinar | BHD | 3 | Fils | |
| Omani Rial | OMR | 3 | Baisa | |
| Qatari Riyal | QAR | 2 | Dirham | |
| Saudi Riyal | SAR | 2 | Halala | |
| Chinese Yuan | CNY | 2 | Fen | |
| Hong Kong Dollar | HKD | 2 | Cent | |
| Singapore Dollar | SGD | 2 | Cent | |
| Indian Rupee | INR | 2 | Paisa | |
| South Korean Won | KRW | 0 | Jeon | No subunit in practice |
| Swedish Krona | SEK | 2 | Öre | |
| Norwegian Krone | NOK | 2 | Øre | |
| Danish Krone | DKK | 2 | Øre | |
| Polish Zloty | PLN | 2 | Grosz | |
| Kenyan Shilling | KES | 2 | Cent | |
| Egyptian Pound | EGP | 2 | Piastre | |
| Turkish Lira | TRY | 2 | Kuruş | |
| Malaysian Ringgit | MYR | 2 | Sen | |
| Thai Baht | THB | 2 | Satang | |
| Vietnamese Dong | VND | 0 | Hào | No subunit in practice |
| Philippine Peso | PHP | 2 | Sentimo | |
| New Taiwan Dollar | TWD | 2 | Fen | |
| New Zealand Dollar | NZD | 2 | Cent | |

---

## Score/Ratio Precision

Non-monetary decimal values have their own precision rules:

| Type | Storage | Display | Rounding |
|---|---|---|---|
| Compliance score | Prisma.Decimal | 1 decimal place (e.g., 87.5%) | Truncation |
| Attendance rate | Prisma.Decimal | 1 decimal place (e.g., 95.2%) | Truncation |
| Confidence score | Prisma.Decimal | 1 decimal place (e.g., 87.7%) | Truncation |
| Health score | Prisma.Decimal | 1 decimal place (e.g., 92.3%) | Truncation |
| Match rate | Prisma.Decimal | 1 decimal place (e.g., 98.9%) | Truncation |
| Risk score | Prisma.Decimal | 0 decimal places (e.g., 45) | Banker's rounding |
| Working capital ratio | Prisma.Decimal | 2 decimal places (e.g., 1.45x) | Banker's rounding |

---

## Financial Precision Library (`src/lib/financial-precision.ts`)

Phase 19.1 created a canonical library of 13 financial precision helper functions. All functions accept `number | string | Prisma.Decimal` inputs and use `Prisma.Decimal` internally for safe arithmetic.

### Exported Functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `financialRound` | `(value: number \| string \| Decimal, decimals?: number) => number` | Banker's rounding via `Intl.NumberFormat` with `roundingMode: "half-even"` |
| `toDecimal` | `(value: number \| string \| Decimal) => Decimal` | Safe conversion — handles `NaN`, `Infinity`, empty strings |
| `sumDecimals` | `(...values: (number \| string \| Decimal)[]) => Decimal` | Variadic aggregation — returns `Decimal(0)` for empty input |
| `multiplyDecimals` | `(a: number \| string \| Decimal, b: number \| string \| Decimal) => Decimal` | Safe Decimal multiplication |
| `divideDecimals` | `(a: ..., b: ..., precision?: number) => Decimal` | Safe Decimal division with configurable precision |
| `allocateAmount` | `(total: ..., allocations: Array<{percentage: number}>) => number[]` | Percentage-based allocation with residual handling — last target gets remainder |
| `calculateTax` | `(amount: ..., rate: ..., rounding?: "half-even" \| "half-up") => number` | Decimal-safe tax calculation |
| `calculateWithholding` | `(amount: ..., rate: ..., rounding?: ...) => number` | Decimal-safe withholding calculation |
| `toDisplayNumber` | `(value: ..., decimals?: number) => number` | Safe conversion for display formatting |
| `formatDecimalCurrency` | `(value: ..., currency: string, options?: {...}) => string` | Currency formatting via `Intl.NumberFormat` |
| `formatDecimalCompact` | `(value: ..., currency?: string) => string` | Abbreviated currency formatting (K/M/B) |
| `decimalEquals` | `(a: ..., b: ..., tolerance?: number) => boolean` | Comparison with configurable tolerance |
| `isValidMonetaryAmount` | `(value: unknown) => boolean` | Validation — rejects `NaN`, `Infinity`, non-numeric |

### Usage Rules

1. **Use `financialRound`** instead of `Math.round()` for all monetary rounding
2. **Use `sumDecimals`** instead of `Array.reduce()` for monetary aggregation
3. **Use `allocateAmount`** instead of manual percentage calculation for GL allocations
4. **Use `decimalEquals`** instead of `===` for monetary comparison (tolerance-aware)
5. **Use `toDecimal`** at service boundaries when entering Decimal arithmetic

---

## Summary of Rules

| Rule | Policy |
|---|---|
| **Storage** | `Decimal(38, 12)` for all monetary amounts |
| **Calculation** | `Prisma.Decimal` arithmetic, never `number` |
| **Rounding** | Banker's rounding (`half-even`) for display |
| **Residual** | First target account absorbs rounding residual |
| **Tolerance** | 0.00 for balances, 0.01 for cross-currency, 0.0001 for rates |
| **`Number()` conversion** | Display boundary only, never in business logic |
| **`toFixed()`** | Prohibited in financial code paths — use `Intl.NumberFormat` |
| **Per-currency** | USD/EUR/GBP = 2, JPY = 0, KWD/BHD = 3 |
| **Score display** | Truncation, not rounding |
