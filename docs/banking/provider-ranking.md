# Provider Ranking Engine

## Overview

The `ProviderRankingEngine` (`src/server/banking/providers/ranking/engine.ts`) scores and orders bank provider candidates to determine the optimal provider for a given request. It is called by the `ProviderSelector` after routing narrows candidates by region/country but before final selection.

The engine assigns each provider a **total score** (0-100) based on six weighted dimensions, then returns a sorted ranking with the best provider and rationale for every score.

## Architecture

```
┌──────────────────┐
│  RankingRequest  │
│  ─ providerKinds │
│  ─ requiredCaps  │
│  ─ preferredProt │
│  ─ currency      │
│  ─ preferHealthy │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  For each kind:  │
│  ┌────────────┐  │
│  │ baseRank   │──┤── 30% ── (100 - globalPriority)
│  │ capability │──┤── 30% ── matched / required × 100
│  │ protocol   │──┤── 10% ── 100 if matched, 0 if not
│  │ currency   │──┤── 10% ── 100 if supported, 0 if not
│  │ failover   │──┤── 10% ── 20 if ≤10, 10 if ≤20, else 0
│  │ sandbox    │──┤── 10% ── 10 if sandboxAvailable, else 0
│  └────────────┘  │
│  totalScore =     │
│   Σ(weight × val) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  RankingResult   │
│  ─ scores[]      │
│  ─ ranked[]      │
│  ─ best          │
└──────────────────┘
```

## Scoring Formula

Defined in `engine.ts:45-51`:

```
totalScore =
  (100 - baseRank)       × 0.30  +
  capabilityMatchScore   × 0.30  +
  protocolMatchScore     × 0.10  +
  currencyMatchScore     × 0.10  +
  failoverPriorityScore  × 0.10  +
  sandboxBonus           × 0.10
```

### Dimension Breakdown

| Dimension | Weight | Calculation | Source |
|-----------|--------|-------------|--------|
| **Base Rank** | 30% | `(100 - globalPriority)` — lower `globalPriority` = higher score | `ProviderDefinition.globalPriority` |
| **Capability Match** | 30% | `(matchedCapabilities / requiredCapabilities) × 100` | `RankingRequest.requiredCapabilities` vs `ProviderDefinition.capabilities` |
| **Protocol Match** | 10% | `100` if `preferredProtocol` is in `def.protocols`, else `0` | `RankingRequest.preferredProtocol` vs `ProviderDefinition.protocols` |
| **Currency Match** | 10% | `100` if `currency` is in `def.currencies` or `def.currencies` is empty, else `0` | `RankingRequest.currency` vs `ProviderDefinition.currencies` |
| **Failover Priority** | 10% | `20` if `failoverPriority ≤ 10`, `10` if `≤ 20`, else `0` | `ProviderDefinition.failoverPriority` |
| **Sandbox Bonus** | 10% | `10` if `sandboxAvailable` is true, else `0` | `ProviderDefinition.sandboxAvailable` |

### Example Scoring

For a ranking request with capabilities `[BALANCES, TRANSACTIONS, PAYMENTS]` and currency `USD` against Plaid:

```
baseRank = 100 - 1 = 99
  × 0.30 = 29.70

capabilities: requests [BALANCES,TRANSACTIONS,PAYMENTS]
              Plaid has all 3 → match = 3/3
capabilityMatchScore = 100
  × 0.30 = 30.00

protocolMatchScore = 0 (no preferred protocol)
  × 0.10 = 0.00

currency: USD is in Plaid currencies → currencyMatchScore = 100
  × 0.10 = 10.00

failoverPriority = 2 → ≤10 → failoverPriorityScore = 20
  × 0.10 = 2.00

sandboxAvailable = true → 10
  × 0.10 = 1.00

totalScore = 29.70 + 30.00 + 0.00 + 10.00 + 2.00 + 1.00 = 72.70
```

## Types

### `RankingRequest` (ranking/types.ts:15-22)

```typescript
interface RankingRequest {
  providerKinds: BankProviderKind[];        // candidates to rank
  requiredCapabilities?: string[];          // capability filter
  preferredProtocol?: string;               // protocol preference
  currency?: string;                        // currency requirement
  preferHealthy?: boolean;                  // future: health weighting
  tenantId?: string;                        // future: tenant-specific config
}
```

### `RankingScore` (ranking/types.ts:3-13)

```typescript
interface RankingScore {
  providerKind: BankProviderKind;
  baseRank: number;
  healthAdjustment: number;        // reserved for future health weighting
  capabilityMatchScore: number;    // 0-100
  protocolMatchScore: number;      // 0 or 100
  currencyMatchScore: number;      // 0 or 100
  failoverPriorityScore: number;   // 0, 10, or 20
  totalScore: number;              // 0-100 (rounded to 2 decimals)
  reason: string;                  // human-readable explanation
}
```

### `RankingResult` (ranking/types.ts:24-28)

```typescript
interface RankingResult {
  scores: RankingScore[];             // all scores, sorted descending
  ranked: BankProviderKind[];         // kinds in rank order
  best: BankProviderKind | null;      // top-ranked kind, or null if empty
}
```

## How Ranking Integrates with Failover

The `ProviderSelector` (selection/engine.ts) calls the ranking engine after routing and enterprise config filtering:

1. **Route** → `BankingRoutingEngine.route()` returns providers for the region/country
2. **Filter** → Apply tenant overrides (disable, blacklist, preferred order, regional overrides)
3. **Rank** → `ProviderRankingEngine.rank()` scores remaining candidates
4. **Select** → `rankingResult.best` becomes primary, `rankingResult.ranked[1..n]` become fallbacks
5. **Truncate** → `maxFallbacks` limits how many fallbacks are returned

Failover chain is simply the ranked list minus the primary. When the primary provider fails at runtime, the consumer iterates through fallbacks in score order.

```typescript
// Consumer failover pattern
async function withFailover<T>(
  criteria: ProviderSelectionCriteria,
  operation: (provider: IBankProvider) => Promise<T>,
): Promise<T> {
  const result = providerSelector.select(criteria);
  const fallbackChain = [result.primary, ...result.fallbacks];

  for (const kind of fallbackChain) {
    const provider = bankProviderRegistry.get(kind);
    if (!provider) continue;
    try {
      return await operation(provider);
    } catch (err) {
      continue; // try next fallback
    }
  }
  throw new Error(`All ${fallbackChain.length} providers failed`);
}
```

## Usage Examples

### Basic Ranking

```typescript
import { providerRankingEngine } from "src/server/banking/providers";

const result = providerRankingEngine.rank({
  providerKinds: ["plaid", "mx", "finicity", "akoya"],
  requiredCapabilities: ["BALANCES", "TRANSACTIONS", "PAYMENTS"],
  currency: "USD",
});

console.log(result.best);       // "plaid"
console.log(result.ranked);     // ["plaid", "mx", "finicity", "akoya"]
console.log(result.scores[0].reason);
// "capability match 66%, supports USD, priority rank 1"
```

### Top-N Selection

```typescript
const top2 = providerRankingEngine.getTopN({
  providerKinds: ["plaid", "lean", "truelayer", "tarabut"],
  requiredCapabilities: ["BALANCES", "IDENTITY"],
  preferredProtocol: "OAUTH2",
}, 2);
// Returns ["plaid", "truelayer"] — top 2 scorers
```

### Protocol Preference

```typescript
const result = providerRankingEngine.rank({
  providerKinds: ["truelayer", "tink", "salted"],
  preferredProtocol: "OPEN_BANKING",
});
// TrueLayer and Tink get +10% for OPEN_BANKING support
// Salt Edge gets 0 (no OPEN_BANKING in protocols)
```

### Currency-Only Request

```typescript
const result = providerRankingEngine.rank({
  providerKinds: ["swift", "iso20022", "plaid"],
  currency: "JPY",
});
// SWIFT supports JPY → +10%
// ISO 20022 supports JPY → +10%
// Plaid does not support JPY → 0 for currency match
```

## Key Design Decisions

1. **No health weighting (yet)**: `healthAdjustment` is reserved but always 0. The `preferHealthy` flag is accepted but unused. Future versions will query `ProviderDiagnosticsService` and adjust scores by ±15%.

2. **Definitions are the single source of truth**: Ranking never instantiates providers. It reads from `PROVIDER_DEFINITION_MAP` only.

3. **Sandbox bonus is additive**: The sandbox bonus rewards providers that offer testing environments, making them rank higher during development/debugging.

4. **Failover priority is inverted**: Lower `failoverPriority` values score higher (20 points for ≤10, 10 points for ≤20). This means `direct-api` (failoverPriority: 1) scores well in failover scenarios despite its low `globalPriority`.

5. **Tied scores are stable**: When two providers score identically, their relative order depends on `Array.sort()` stability (ES2019+ guarantees stable sort), preserving insertion order from `PROVIDER_DEFINITIONS`.

