# Treasury Policies

## Overview

The policy engine enforces treasury rules at multiple levels: company, entity, region, currency, and account. Violations generate alerts with configurable severity.

## Policy Types

| Policy Type | Scope | Example |
|---|---|---|
| **MINIMUM_CASH** | Per-account/currency | "Never drop below $1M in USD operating" |
| **TARGET_CASH** | Per-account/currency | "Maintain $5M target in GBP treasury" |
| **LIQUIDITY_BUFFER** | Entity/region | "Keep 20% of total cash in immediate liquidity" |
| **CONCENTRATION** | Counterparty/currency | "No more than 30% of cash at a single bank" |
| **COUNTERPARTY** | Per-institution | "Max $50M exposure to any single bank" |
| **INVESTMENT** | Per-bucket/strategy | "Max 40% of portfolio in long-term instruments" |
| **REGIONAL** | Per-region | "EMEA must hold minimum 25% of total cash" |
| **FUNDING** | Entity pair | "Max $10M intercompany loan without board approval" |

## Rule Operators

| Operator | Meaning |
|---|---|
| `EQ` | Equals value |
| `GT` | Greater than value |
| `GTE` | Greater than or equal |
| `LT` | Less than value |
| `LTE` | Less than or equal |
| `BETWEEN` | Within range [lo, hi] |

## Policy Evaluation

```
PolicyEvaluationResult {
  passed: boolean
  violations: PolicyViolation[]
  score: 0-100          // weighted score
}
```

Severity weights:
- CRITICAL: -30 points
- WARNING: -15 points
- INFO: -5 points

## Approval Matrix

```
TreasuryApprovalMatrix {
  fundingBelow1M: "Treasury Manager"
  fundingBelow10M: "VP Treasury"
  fundingAbove10M: "CFO"
  intercompanyBelow1M: "Treasury Manager"
  intercompanyAbove1M: "VP Treasury"
  investmentBelow5M: "Treasury Manager"
  investmentAbove5M: "CIO / CFO"
}
```

## Alert Generation

Policy violations automatically generate `TreasuryAlert` entries:

```
TreasuryAlert {
  severity: INFO | WARNING | CRITICAL | EMERGENCY
  category: TreasuryAlertCategory  (12 categories)
  title, message, metadata
  acknowledged, resolved flags
}
```

Alert categories include minimum cash breach, liquidity buffer breach, funding required, FX exposure limit, counterparty limit, investment maturity, restricted cash violation, pool imbalance, and forecast deviation.

## Compliance Flow

```
Account Balance Change
        │
        ▼
Policy Engine evaluates all applicable policies
        │
        ├── All passed? ──► No action
        │
        └── Violations? ──► Generate TreasuryAlert
                │
                ├── CRITICAL ──► Immediate notification
                ├── WARNING  ──► Daily digest
                └── INFO     ──► Dashboard badge
```
