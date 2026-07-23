# Tax Engine

## Overview

The tax engine is the core computation layer of the Tax Management module. It resolves applicable tax rates for any jurisdiction-tax-type-date combination, calculates tax amounts on transactions, handles exemptions and reverse charge mechanics, and supports cross-currency conversion.

## Rate Resolution

### Resolution Algorithm

The rate resolution process follows a strict precedence chain:

```
Transaction (jurisdiction, tax type, date, currency)
  │
  ▼
1. Find jurisdiction in hierarchy
  │
  ▼
2. Find applicable tax rules for jurisdiction + tax type
  │
  ▼
3. Filter rules by effective date range (effectiveFrom ≤ date ≤ effectiveTo)
  │
  ▼
4. Apply condition matching (transaction type, amount threshold, party type, etc.)
  │
  ▼
5. Return highest-precedence match with rate, exemption status, reverse charge flag
```

### Rate Types

| Rate Type | Description | Example |
|-----------|-------------|---------|
| Standard | Default rate for the jurisdiction | 20% VAT |
| Reduced | Lower rate for specific goods/services | 5% reduced VAT |
| Zero-rated | 0% rate with input tax recovery | 0% for exports |
| Exempt | No tax charged, no input recovery | Financial services |
| Reverse charge | Tax shifted from supplier to customer | Cross-border services |
| Withholding | Tax deducted at source | 10% WHT on royalties |

### Condition Matching

Each tax rule can have conditions that must be met for the rate to apply:

```typescript
interface TaxRuleCondition {
  field: "productCategory" | "transactionType" | "amountThreshold"
       | "partyType" | "customerVatStatus" | "importOrigin";
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "between";
  value: string | number | string[];
}
```

## Tax Calculation Pipeline

```
Transaction Input
  │
  ▼
1. Determine Tax Base
  ├── Net amount from transaction line
  ├── Adjust for discounts / surcharges
  └── Apply currency conversion if needed
  │
  ▼
2. Resolve Tax Rate
  ├── Jurisdiction resolution (country → state → region → city)
  ├── Find matching rule by tax type
  ├── Apply date-based effective dating
  ├── Evaluate conditions
  └── Return rate, exemption status, reverse charge flag
  │
  ▼
3. Calculate Tax Amount
  ├── Standard: TaxBase × Rate
  ├── Inclusive: TaxBase × (Rate / (1 + Rate))
  ├── Mixed supply: Apply per-line rates
  └── Reverse charge: Zero output tax, record input/output reversal
  │
  ▼
4. Apply Exemptions / Thresholds
  ├── Check exemption certificate validity
  ├── Apply annual threshold checks
  ├── Apply per-transaction thresholds
  └── Record exemption reference
  │
  ▼
5. Determine Reporting Classification
  ├── Tax code (standard, reduced, zero, exempt, reverse)
  ├── Box assignment for periodic return
  └── GL account mapping
  │
  ▼
Completed Tax Calculation
```

## Mixed Supply Handling

When a transaction contains items with different tax treatments:

1. **Line-level calculation**: Each line item is calculated independently with its own rate resolution
2. **Primary/secondary determination**: For bundled supplies, determine if the primary component dictates the rate
3. **Apportionment**: For mixed supplies that cannot be split, apportion the consideration based on fair value

```typescript
interface MixedSupplyResult {
  lines: CalculatedTaxLine[];
  totalTaxAmount: number;
  totalTaxBase: number;
  effectiveRate: number; // blended rate
  byRateType: Record<string, { base: number; tax: number }>;
}
```

## Exemption Handling

| Exemption Type | Input Tax Recovery | Output Tax Charged | Certificate Required |
|----------------|-------------------|-------------------|---------------------|
| Zero-rated | Yes | No (0%) | No |
| Exempt | No | No | Yes (entity-level) |
| Reduced rate | Partial | Partial | No |
| Export | Yes | No (0%) | Export evidence |
| Intra-community | Yes | No (0%) | Customer VAT number |

### Certificate Validation

Exemption certificates are validated against:
- Certificate validity dates
- Jurisdiction-specific exemption thresholds
- Product/service category restrictions
- Customer/vendor tax registration status

## Reverse Charge Mechanics

Reverse charge shifts the obligation to account for tax from the supplier to the customer:

```
Supplier: Issues invoice with "Reverse Charge" notation
  └── No output VAT charged
  └── Records: "Reverse Charge Supply"

Customer (in same jurisdiction or cross-border):
  └── Self-assesses output VAT (same rate)
  └── Simultaneously records input VAT (if eligible)
  └── Net impact: Zero if full input recovery allowed
```

### Reverse Charge Scenarios

| Scenario | Application |
|----------|-------------|
| Cross-border services (B2B) | Mandatory reverse charge in most jurisdictions |
| Domestic construction | Subcontractor services (UK, Ireland) |
| Electronic goods (intra-EU) | Cross-border B2B supplies of specified goods |
| Emissions allowances | B2B transfers within EU |
| Scrap metal | B2B supplies in certain jurisdictions |

## Cross-Currency Conversion

For transactions in foreign currencies:

```typescript
interface CurrencyConversion {
  sourceCurrency: string;      // e.g., "USD"
  targetCurrency: string;      // e.g., "EUR"
  sourceAmount: number;
  exchangeRate: number;        // Rate at transaction date
  convertedAmount: number;
  rateSource: string;          // "centralbank" | "market" | "internal"
  rateDate: string;            // Date of exchange rate
}
```

Conversion rules:
- Use the exchange rate valid on the transaction date (not payment date)
- For VAT, use the rate prescribed by the jurisdiction (often monthly or quarterly averages)
- Record exchange rate differences separately for reconciliation

## Rate Caching Strategy

```
Request: Rate(jurisdiction, taxType, date)
  │
  ├── Check cache (LRU, TTL: 300s)
  │   └── Hit → Return cached rate
  │
  └── Cache miss → Resolve from rules
      ├── Filter by jurisdiction (hierarchical)
      ├── Filter by tax type
      ├── Filter by effective date
      ├── Evaluate conditions
      ├── Cache result
      └── Return resolved rate
```

Rates are cached with LRU eviction (1000 entries) and 5-minute TTL. Rate changes invalidate affected cache entries by jurisdiction + tax type.

## Precision and Rounding

| Operation | Precision | Rounding Rule |
|-----------|-----------|---------------|
| Rate storage | 4 decimal places | Round half-up |
| Tax base | 6 decimal places | Truncate |
| Tax amount (per line) | 2 decimal places (currency precision) | Round half-up |
| Tax amount (total) | 2 decimal places | Round half-up |
| Exchange rate | 6 decimal places | Round half-up |
| Effective rate (blended) | 4 decimal places | Round half-up |

Rounding follows the platform's `CurrencyPrecision` utility from `src/server/currency/`, which implements half-up rounding per ISO 4217 currency digit standards.
