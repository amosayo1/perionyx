# Currency Architecture

**Phase**: 19.0 — Financial Core Consolidation
**Status**: Documentation Only — No Code Changes
**Date**: July 2026

---

## Current State

The currency system has two near-duplicate services, four conflicting currency registries, and three copies of fallback rates. The result is inconsistency, maintenance burden, and subtle behavioral differences between code paths.

---

## CurrencyService vs FxService

### Method Comparison

| Method | CurrencyService | FxService | Identical? |
|---|---|---|---|
| **Constructor context** | `ctx: TenantContext` | `companyId: string` | Different API surface |
| **`getRate()`** | DB → fallback → inverse DB → inverse fallback | DB → inverse DB → fallback → inverse fallback | **Different ordering** |
| **`convert()`** | Calls `getRate()`, then `toFixed(2)` → `Number()` | Calls `getRate()`, then `toFixed(2)` → `Number()` | Same precision bug |
| **`setRate()`** | Yes (upsert + audit) | No | Different feature set |
| **`listRates()`** | Yes (cached) | No (uses `getLatestRates()` instead) | Different method names |
| **`syncRates()`** | No | Yes (from external providers) | Different feature set |
| **`getLatestRates()`** | No | Yes (cached) | Different method names |
| **`getSyncStatus()`** | No | Yes | Different feature set |
| **`checkHealth()`** | No | Yes | Different feature set |
| **`listAvailableCurrencies()`** | Derived from FALLBACK_RATES keys | From SUPPORTED_CURRENCIES constant | **Different sources** |

### Rate Lookup Order Difference

This is the most critical inconsistency. The two services resolve rates in different orders:

**CurrencyService.getRate()** (`src/modules/currency/currency.service.ts:19-68`):
1. Identity check (same currency → rate 1)
2. Direct DB lookup (`exchangeRate.findUnique`)
3. **Fallback constant** (`FALLBACK_RATES[base][quote]`)
4. Inverse DB lookup (`exchangeRate.findUnique` with swapped currencies)
5. Inverse fallback constant
6. Return null

**FxService.getRate()** (`src/modules/fx/fx.service.ts:149-198`):
1. Identity check (same currency → rate 1)
2. Direct DB lookup (`exchangeRate.findUnique`)
3. Inverse DB lookup (`exchangeRate.findUnique` with swapped currencies)
4. **Fallback constant** (`FALLBACK_RATES[base][quote]`)
5. Inverse fallback constant
6. Return null

The difference: CurrencyService tries fallback before inverse DB. FxService tries inverse DB before fallback. This means the same currency pair can return different rates depending on which service is called, because a fallback rate might differ from an inverse DB rate.

### Source Parameter Difference

CurrencyService accepts `ctx: TenantContext` (which contains `companyId` and `userId`). FxService accepts `companyId: string` directly. This means:
- CurrencyService requires a full tenant context for every call
- FxService can be called from background jobs that only have a company ID
- Audit logging differs: CurrencyService uses `ctx.userId`, FxService uses a passed `actorUserId`

---

## Exchange Rate Storage

### Prisma Model

```prisma
model ExchangeRate {
  id            String    @id @default(cuid())
  companyId     String
  baseCurrency  String    // ISO 4217 — the currency being converted FROM
  quoteCurrency String    // ISO 4217 — the currency being converted TO
  rate          Decimal   @db.Decimal(38, 12) // 1 baseCurrency = this many quoteCurrency
  source        String    @default("manual") // "manual", "exchange-rate-host", "mock"
  validFrom     DateTime  @default(now())
  validTo       DateTime? // null = currently valid
  fetchedAt     DateTime? // When rate was last fetched from provider
  
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([companyId, baseCurrency, quoteCurrency])
  @@index([companyId, baseCurrency])
  @@index([baseCurrency])
  @@index([quoteCurrency])
  @@index([fetchedAt])
  @@map("exchange_rates")
}
```

### Single Model, Two Access Patterns

Both services use the same `ExchangeRate` Prisma model but access it differently:

| Aspect | CurrencyService | FxService |
|---|---|---|
| Read | `findUnique` (single pair) | `findUnique` (single pair) + `findMany` (all rates) |
| Write | `upsert` (single pair) | `upsert` (batch loop) |
| Validity check | `validTo > new Date()` | `validTo > new Date()` (same) |
| Cache key | `tenantKey(companyId, "METADATA", "currency", "rates")` | `tenantKey(companyId, "METADATA", "fx", "rates")` |

The cache keys differ (`"currency"` vs `"fx"`), meaning the same rates are cached under two different keys. This doubles cache memory and can serve stale data if one cache is refreshed but not the other.

---

## FxProvider Infrastructure

### Provider Interface

```typescript
interface FxProvider {
  getRates(baseCurrency: string): Promise<FxRate[]>;
}

interface FxRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;  // Note: number, not Decimal
}
```

### Implementations

**ExchangeRateHostProvider** (`src/modules/fx/fx.provider.ts:8-54`):
- Calls `https://api.exchangerate.host/latest?base={currency}&access_key={key}`
- Filters results to SUPPORTED_CURRENCIES (12 currencies)
- Returns rates as `number` (not Decimal)
- Used when `FX_API_KEY` env var is set

**MockFxProvider** (`src/modules/fx/fx.provider.ts:56-73`):
- Returns hardcoded rates for 3 base currencies (USD, EUR, GBP)
- Same values as FALLBACK_RATES subset
- Used when `FX_API_KEY` is not set

**Factory** (`src/modules/fx/fx.provider.ts:75-82`):
- `createFxProvider()` returns ExchangeRateHostProvider if API key exists, MockFxProvider otherwise

### Provider Issue

The FxProvider returns rates as `number`, but `FxService.syncRates()` immediately wraps them in `new Prisma.Decimal(r.rate)`. The `number` → `Decimal` conversion at the provider boundary introduces potential precision loss if the API returns a very precise rate.

---

## SUPPORTED_CURRENCIES: Four Conflicting Definitions

### Definition 1: Domain Constants
**File**: `src/domain/constants/currencies.ts`
```typescript
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP"] as const;
```
**Size**: 3 currencies
**Purpose**: Domain validation for wallet/ledger currency fields
**Consumers**: `isSupportedCurrency()` type guard

### Definition 2: FX Service
**File**: `src/modules/fx/fx.service.ts`
```typescript
const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR",
];
```
**Size**: 12 currencies
**Purpose**: Controls which currencies are synced from external providers
**Consumers**: `syncRates()` loop, `listAvailableCurrencies()`

### Definition 3: FX Provider
**File**: `src/modules/fx/fx.provider.ts`
```typescript
const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR",
];
```
**Size**: 12 currencies (identical to FxService)
**Purpose**: Filters API response to known currencies
**Consumers**: `ExchangeRateHostProvider.getRates()`

### Definition 4: Banking Currency Engine
**File**: `src/server/banking/accounts/currencies/engine.ts`
```typescript
export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "AED", "SAR", "JPY", "CNY", "HKD", "SGD",
  "AUD", "CAD", "CHF", "INR", "KRW", "SEK", "NDK", "DKK", "PLN",
  "ZAR", "NGN", "KES", "EGP", "BHD", "QAR", "KWD", "OMR", "MXN",
  "BRL", "TRY", "MYR", "THB", "VND", "PHP", "TWD", "NZD",
];
```
**Size**: 35 currencies
**Purpose**: Banking account currency validation and configuration
**Consumers**: `CurrencyEngine.isSupportedCurrency()`

### Conflict Impact

- A user can create a banking account in SAR (Saudi Riyal) — supported by banking engine
- But SAR is not in FX sync list — no exchange rates will be synced for SAR
- Domain validation rejects SAR — `isSupportedCurrency("SAR")` returns false
- The same currency is "supported" in one context and "unsupported" in another

---

## FALLBACK_RATES: Three Identical Copies

### Copy 1: CurrencyService
**File**: `src/modules/currency/currency.service.ts:9-16`
```typescript
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, CHF: 0.88, AUD: 1.53, MXN: 17.2, BRL: 4.98, NGN: 1540, AED: 3.67, ZAR: 18.5 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, CAD: 1.48, CHF: 0.96, AUD: 1.66, NGN: 1674, AED: 4.0, ZAR: 20.1 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2, NGN: 1956, AED: 4.67, ZAR: 23.5 },
  NGN: { USD: 1/1540, EUR: 1/1674, GBP: 1/1956, AED: 1/(1540/3.67), ZAR: 18.5/1540 },
  AED: { USD: 1/3.67, EUR: 1/4.0, GBP: 1/4.67, NGN: 1540/3.67, ZAR: 18.5/3.67 },
  ZAR: { USD: 1/18.5, EUR: 1/20.1, GBP: 1/23.5, NGN: 1540/18.5, AED: 3.67/18.5 },
};
```

### Copy 2: FxService
**File**: `src/modules/fx/fx.service.ts:15-22`
Identical values, identical structure.

### Copy 3: MockFxProvider
**File**: `src/modules/fx/fx.provider.ts:58-62`
Subset (USD, EUR, GBP only), same values.

### Maintenance Risk

If rates need updating, all three copies must be changed. Missing one creates inconsistency where CurrencyService and FxService serve different fallback rates for the same pair.

---

## Recommended Architecture: CurrencyPlatformService

### Single Service

Merge CurrencyService and FxService into one `CurrencyPlatformService`:

```typescript
class CurrencyPlatformService {
  // Rate Lookup (from CurrencyService, enhanced)
  static async getRate(ctx: TenantContext, base: string, quote: string): Promise<RateResult | null>;
  static async listRates(ctx: TenantContext): Promise<RateInfo[]>;
  
  // Rate Sync (from FxService)
  static async syncRates(companyId: string, actorUserId: string): Promise<FxSyncResult>;
  static async getLatestRates(companyId: string): Promise<RateInfo[]>;
  
  // Conversion (new, returns Money)
  static async convert(ctx: TenantContext, amount: Money, toCurrency: string): Promise<ConversionResult>;
  
  // Health & Status (from FxService)
  static async getSyncStatus(companyId: string): Promise<FxSyncStatus>;
  static async checkHealth(companyId: string): Promise<HealthResult>;
  
  // Currency Metadata (new)
  static getMetadata(currency: string): CurrencyMetadata;
  static listSupported(): string[];
  static isSupported(code: string): boolean;
}
```

### Rate Lookup Unified Order

Single, documented resolution order (no more two services with different orders):

1. Identity check (same currency → rate 1, source "identity")
2. Direct DB lookup (`exchangeRate` where `validTo IS NULL OR validTo > now()`)
3. Inverse DB lookup (swap currencies, compute `1/rate`)
4. Fallback constant (`FALLBACK_RATES[base][quote]`)
5. Inverse fallback constant (`1 / FALLBACK_RATES[quote][base]`)
6. Return null (no rate available)

### Conversion with Audit Trail

```typescript
interface ConversionResult {
  original: Money;
  converted: Money;
  rate: Prisma.Decimal;
  rateSource: string;    // "db" | "inverse:db" | "fallback" | "inverse:fallback"
  timestamp: Date;
}

// Every conversion that feeds into a financial statement or GL entry
// is logged to ConversionAuditLog (new Prisma model)
```

### SUPPORTED_CURRENCIES Consolidated

Single source of truth with tiers:

```typescript
const CURRENCY_TIERS = {
  /** Core currencies — always synced, always available */
  core: ["USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR"],
  
  /** Extended currencies — available for banking, not auto-synced */
  extended: ["SAR", "CNY", "HKD", "SGD", "INR", "KRW", "SEK", "NOK", "DKK", "PLN", "KES", "EGP", "BHD", "QAR", "KWD", "OMR", "TRY", "MYR", "THB", "VND", "PHP", "TWD", "NZD"],
} as const;

/** All supported currencies (core + extended) */
const SUPPORTED_CURRENCIES: readonly string[] = [...CURRENCY_TIERS.core, ...CURRENCY_TIERS.extended];

/** Core currencies that get fallback rates */
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  // Single copy, imported by all consumers
};
```

### FALLBACK_RATES: Single Constant

One definition, one file, imported everywhere:

```typescript
// src/modules/currency/fallback-rates.ts
export const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, ... },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, ... },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2, ... },
  // ... all other base currencies
};
```

### Currency Metadata Registry

```typescript
interface CurrencyMetadata {
  code: string;           // "USD"
  name: string;           // "United States Dollar"
  symbol: string;         // "$"
  decimalPlaces: number;  // 2
  subunitName: string;    // "cent"
  tier: "core" | "extended";
}

const CURRENCY_METADATA: Map<string, CurrencyMetadata> = new Map([
  ["USD", { code: "USD", name: "United States Dollar", symbol: "$", decimalPlaces: 2, subunitName: "cent", tier: "core" }],
  ["EUR", { code: "EUR", name: "Euro", symbol: "€", decimalPlaces: 2, subunitName: "cent", tier: "core" }],
  ["GBP", { code: "GBP", name: "Pound Sterling", symbol: "£", decimalPlaces: 2, subunitName: "pence", tier: "core" }],
  ["JPY", { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalPlaces: 0, subunitName: "sen", tier: "core" }],
  ["KWD", { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", decimalPlaces: 3, subunitName: "fils", tier: "extended" }],
  ["BHD", { code: "BHD", name: "Bahraini Dinar", symbol: "ب.د", decimalPlaces: 3, subunitName: "fils", tier: "extended" }],
  ["NGN", { code: "NGN", name: "Nigerian Naira", symbol: "₦", decimalPlaces: 2, subunitName: "kobo", tier: "core" }],
  ["AED", { code: "AED", name: "UAE Dirham", symbol: "د.إ", decimalPlaces: 2, subunitName: "fils", tier: "core" }],
  ["ZAR", { code: "ZAR", name: "South African Rand", symbol: "R", decimalPlaces: 2, subunitName: "cent", tier: "core" }],
  // ... all 47 currencies
]);
```

---

## Exchange Rate Model Considerations

### Current: Single ExchangeRate Model

The current `ExchangeRate` model stores rates in one table. Both CurrencyService and FxService write to this table. This is correct.

### Potential Issue: GL Exchange Rates

The GL types file (`src/server/gl/types/index.ts:155-159`) defines an `ExchangeRateReference` interface:

```typescript
interface ExchangeRateReference {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateType: "historical" | "spot" | "average" | "closing";
  date: Date;
  companyId: string;
}
```

This is a different concept from the treasury `ExchangeRate` model — it supports rate types (historical, spot, average, closing) and is date-specific. If GL revaluation and consolidation need rate types, a separate model or an extension to the existing model may be needed.

### Recommendation

- **Do not** create a second exchange rate table
- **Extend** the existing `ExchangeRate` model with optional `rateType` field
- **OR** use the existing model as-is for spot rates and compute historical/average rates on-the-fly from snapshot data

---

## Migration Path

### Step 1: Create CurrencyMetadata registry
New file `src/modules/currency/currency-metadata.ts` with all 47 currencies.

### Step 2: Create single FALLBACK_RATES
New file `src/modules/currency/fallback-rates.ts` with the consolidated constant.

### Step 3: Create single SUPPORTED_CURRENCIES
New file `src/modules/currency/supported-currencies.ts` with tiered structure.

### Step 4: Create CurrencyPlatformService
New file `src/modules/currency/currency-platform.service.ts` combining both services.

### Step 5: Migrate consumers
- Replace `import { CurrencyService } from "@/modules/currency/currency.service"` with `import { CurrencyPlatformService } from "@/modules/currency/currency-platform.service"`
- Replace `import { FxService } from "@/modules/fx/fx.service"` with same
- Update method signatures where needed

### Step 6: Delete old services
- Delete `src/modules/currency/currency.service.ts`
- Delete `src/modules/fx/fx.service.ts`
- Keep `src/modules/fx/fx.provider.ts` (FxProvider infrastructure, used by new service)
- Keep `src/modules/fx/fx.types.ts` (FxRate, FxSyncResult, FxSyncStatus)

### Step 7: Update fx-sync job
- Update `src/modules/queue/jobs/fx-sync.job.ts` to use CurrencyPlatformService

---

## Success Criteria

1. Single `CurrencyPlatformService` handles all currency operations
2. Single `SUPPORTED_CURRENCIES` with tiers, imported by all consumers
3. Single `FALLBACK_RATES` constant, imported by all consumers
4. Single `CurrencyMetadata` registry with decimal places for all currencies
5. Rate lookup order is consistent everywhere
6. Cache keys are unified (`"currency"` or `"fx"`, not both)
7. All conversions return `Money` with audit trail
8. `pnpm typecheck` and `pnpm build` pass with zero errors
