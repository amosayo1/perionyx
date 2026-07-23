# Money Architecture — Financial Primitives Design

> **Status:** Planned  
> **Date:** 2026-07-21  
> **Phase:** 19.1 (Implementation)  
> **Scope:** Design specification for Money value object, currency resolution, rounding, and allocation

---

## 1. Design Principles

1. **No native `number` for monetary arithmetic.** Every addition, subtraction, multiplication, and division on money goes through `Money` or `Prisma.Decimal`.
2. **One currency per Money instance.** Cross-currency operations require explicit conversion with a rate. No implicit conversion.
3. **Immutable.** `Money` instances never change. Operations return new instances.
4. **Boundary-safe.** `Money` serializes to/from `string` at API boundaries. `Prisma.Decimal` is the database representation.
5. **Display-only escape.** `toNumber()` exists solely for rendering. A lint rule forbids its use in arithmetic.

---

## 2. Money Value Object

### 2.1 — Internal Representation

```typescript
class Money {
  // Private — no external access to raw Decimal
  private readonly _amount: Prisma.Decimal;
  private readonly _currency: string;

  private constructor(amount: Prisma.Decimal, currency: string) {
    this._amount = amount;
    this._currency = currency;
  }
}
```

**Why Prisma.Decimal internally?**
- Arbitrary precision — no IEEE 754 drift
- Matches Prisma schema representation — zero conversion cost at DB boundary
- Available in both Node.js and edge runtime (no native module dependency)

**Why not BigInt?**
- BigInt has no decimal point — would require manual scaling
- Prisma.Decimal already solves this problem

### 2.2 — Arithmetic Operations

All operations return new `Money` instances. All binary operations validate currency match.

| Operation | Signature | Behavior |
|-----------|-----------|----------|
| `add` | `(other: Money) → Money` | Same currency required. Returns `this.amount + other.amount`. |
| `subtract` | `(other: Money) → Money` | Same currency required. Returns `this.amount - other.amount`. |
| `multiply` | `(factor: number) → Money` | Scalar multiplication. Returns `this.amount * factor`. |
| `divide` | `(divisor: number) → Money` | Scalar division. Throws on zero. Returns `this.amount / divisor`. |
| `mod` | `(other: Money) → Money` | Modulo. Same currency required. |
| `negate` | `() → Money` | Returns `-this.amount`. |
| `abs` | `() → Money` | Returns `|this.amount|`. |
| `round` | `(places: number, mode?: RoundingMode) → Money` | Banker's rounding by default. |

### 2.3 — Comparison Operations

| Operation | Signature | Returns |
|-----------|-----------|---------|
| `equals` | `(other: Money) → boolean` | Amount + currency match |
| `lessThan` | `(other: Money) → boolean` | Same currency required |
| `greaterThan` | `(other: Money) → boolean` | Same currency required |
| `compare` | `(other: Money) → -1 \| 0 \| 1` | Same currency required |
| `isZero` | `() → boolean` | `amount === 0` |
| `isPositive` | `() → boolean` | `amount > 0` |
| `isNegative` | `() → boolean` | `amount < 0` |

### 2.4 — Conversion

```typescript
convert(rate: number, targetCurrency: string): Money;
```

- Takes an explicit rate (obtained from CurrencyResolver)
- Returns new Money in target currency
- Does NOT look up rates — caller is responsible for providing the rate
- This design prevents hidden network calls inside value object operations

### 2.5 — Factory Methods

| Method | Input | Precision | Notes |
|--------|-------|-----------|-------|
| `Money.fromDecimal(d, c)` | `Prisma.Decimal` | Exact | Preferred — no conversion |
| `Money.fromString(s, c)` | `string` | Exact | For API boundaries |
| `Money.fromNumber(n, c)` | `number` | ~15 digits | Warns via logger — avoid in new code |
| `Money.fromCents(cents, c)` | `number` | Exact (integer) | For payment processor responses |
| `Money.zero(c)` | — | Zero | Creates zero-amount Money |

### 2.6 — Serialization

```typescript
// To API (JSON)
toJSON(): { amount: string; currency: string }

// To Prisma
toDecimal(): Prisma.Decimal;

// To display string (ONLY for UI rendering)
toString(): string;  // "1,234.56"

// To localized display
format(locale?: string, options?: Intl.NumberFormatOptions): string;
```

---

## 3. Currency Resolution

### 3.1 — Resolution Order (Single Source of Truth)

```
1. Identity:        baseCurrency === quoteCurrency → rate = 1
2. Direct DB:       ExchangeRate(base, quote) where validTo is null or > now
3. Inverse DB:      ExchangeRate(quote, base) where validTo is null or > now → rate = 1 / dbRate
4. Fallback:        FALLBACK_RATES[base][quote]
5. Inverse Fallback: FALLBACK_RATES[quote][base] → rate = 1 / fallbackRate
6. Return null      (caller throws ValidationError)
```

This order is the SAME for all consumers. No service has a different ordering.

### 3.2 — Fallback Rates Location

**Single file:** `src/lib/money/fallback-rates.ts`

```typescript
export const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, CHF: 0.88, AUD: 1.53, MXN: 17.2, BRL: 4.98, NGN: 1540, AED: 3.67, ZAR: 18.5 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, CAD: 1.48, CHF: 0.96, AUD: 1.66, NGN: 1674, AED: 4.0, ZAR: 20.1 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2, NGN: 1956, AED: 4.67, ZAR: 23.5 },
  NGN: { USD: 1/1540, EUR: 1/1674, GBP: 1/1956, AED: 3.67/1540, ZAR: 18.5/1540 },
  AED: { USD: 1/3.67, EUR: 1/4.0, GBP: 1/4.67, NGN: 1540/3.67, ZAR: 18.5/3.67 },
  ZAR: { USD: 1/18.5, EUR: 1/20.1, GBP: 1/23.5, NGN: 1540/18.5, AED: 3.67/18.5 },
};
```

Lint rule: No other file may define `FALLBACK_RATES`.

### 3.3 — Supported Currencies

**Single file:** `src/lib/money/currencies.ts`

```typescript
export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "AED", "SAR", "JPY", "CNY", "HKD", "SGD",
  "AUD", "CAD", "CHF", "INR", "KRW", "SEK", "NOK", "DKK", "PLN",
  "ZAR", "NGN", "KES", "EGP", "BHD", "QAR", "KWD", "OMR", "MXN",
  "BRL", "TRY", "MYR", "THB", "VND", "PHP", "TWD", "NZD",
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
```

Lint rule: No other file may define `SUPPORTED_CURRENCIES` as a standalone constant.

---

## 4. Rounding

### 4.1 — Banker's Rounding (Round-Half-to-Even)

Standard for financial calculations (ISO 4217, IEEE 754 default for `decimal` in many languages).

```typescript
function bankerRound(value: Prisma.Decimal, places: number): Prisma.Decimal {
  // Implementation: multiply by 10^places, check remainder
  // If remainder is exactly 0.5, round to even
  // Otherwise, standard round
}
```

**Used in:**
- All statement builder totals
- All display formatting
- Tax calculations
- Reconciliation variance calculations

### 4.2 — Largest-Remainder Allocation

For splitting a Money amount across N recipients (e.g., GL allocation, invoice splitting):

```typescript
function allocate(amount: Money, weights: number[], precision: number): Money[] {
  // 1. Calculate each share: amount * (weight / totalWeight)
  // 2. Floor each share to `precision` decimal places
  // 3. Calculate residual: amount - sum(floored shares)
  // 4. Distribute residual one unit at a time to shares with largest fractional parts
  // Result: sum(shares) === amount exactly
}
```

**Example:**
```typescript
const total = Money.fromString("100.00", "USD");
const shares = allocate(total, [1, 1, 1], 2);
// Result: [$33.34, $33.33, $33.33] — sum is exactly $100.00
```

---

## 5. Integration Points

### 5.1 — Prisma ↔ Money

```typescript
// Read from DB
const row = await prisma.invoiceLine.findUnique({ where: { id } });
const amount = Money.fromDecimal(row.amount, row.currency);

// Write to DB
await prisma.invoiceLine.update({
  where: { id },
  data: { amount: amount.toDecimal() },
});
```

### 5.2 — API Boundary ↔ Money

```typescript
// Inbound (API handler)
const { amount, currency } = req.body;
const moneyAmount = Money.fromString(amount, currency);

// Outbound (API response)
res.json({ amount: moneyAmount.toJSON() });
// → { amount: "1234.56", currency: "USD" }
```

### 5.3 — UI ↔ Money

```typescript
// In component
<span>{moneyAmount.format('en-US')}</span>
// → "$1,234.56"

// For SVG chart axes
const numericValue = moneyAmount.toNumber(); // display-only
```

---

## 6. Migration Path

### Phase 1 (Week 1-2): Foundation
- Create `src/lib/money/` directory
- Implement `Money` class with full test suite
- Create `CurrencyResolver`
- Create `fallback-rates.ts` and `currencies.ts`

### Phase 2 (Week 2-3): Precision
- Prisma schema migrations (Float → Decimal, Decimal(38,11) → (38,12))
- Create `rounding.ts` with banker's rounding and allocation
- Update statement builders to use Money

### Phase 3 (Week 3-4): Formatting
- Create `format.ts` with canonical formatters
- Migrate 84 local `formatCurrency` definitions
- Wire Localization service into canonical formatters

### Phase 4 (Week 4-6): Consumers
- Migrate CurrencyService consumers → CurrencyResolver
- Migrate FxService consumers → CurrencyResolver
- Migrate GL allocation engine → Money.allocate()
- Migrate cash application → Money operations

### Phase 5 (Week 6-7): Cleanup
- Delete CurrencyService and FxService
- Delete duplicate FALLBACK_RATES
- Delete duplicate SUPPORTED_CURRENCIES
- Remove `toNumber()` from non-UI code (lint rule)

---

## 7. Lint Rules

| Rule | Purpose |
|------|---------|
| `no-native-money-arithmetic` | Forbid `+`, `-`, `*`, `/` on Money-adjacent numbers |
| `no-toNumber-in-arithmetic` | Forbid `Money.toNumber()` in calculation paths |
| `no-duplicate-fallback-rates` | Forbid `FALLBACK_RATES` outside `src/lib/money/` |
| `no-duplicate-supported-currencies` | Forbid `SUPPORTED_CURRENCIES` outside `src/lib/money/` |
| `no-local-format-currency` | Forbid `function formatCurrency` outside `src/lib/money/` |
