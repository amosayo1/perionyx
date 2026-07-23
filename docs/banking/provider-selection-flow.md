# Provider Selection Flow

## Overview

The `ProviderSelector` class (`src/server/banking/providers/selection/engine.ts`) orchestrates the end-to-end process of selecting the best bank provider for a given financial operation. It combines routing, ranking, and enterprise configuration into a single decision pipeline that produces an ordered failover chain.

## End-to-End Selection Flow

```
                    ┌─────────────────────┐
                    │ ProviderSelection   │
                    │ Criteria            │
                    │ ─ region            │
                    │ ─ countryCode       │
                    │ ─ requiredCaps      │
                    │ ─ preferredProtocol │
                    │ ─ currency          │
                    │ ─ tenantId          │
                    │ ─ requireHealthy    │
                    │ ─ maxFallbacks      │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
         ┌─────────►│ 1. Force Check     │
         │         │ (tenant override)    │
         │         └─────────┬───────────┘
         │                   │ no force
         │         ┌─────────▼───────────┐
         │         │ 2. Route            │
         │         │ BankingRoutingEngine│
         │         │ (region + country   │
         │         │  + capabilities)    │
         │         └─────────┬───────────┘
         │                   │
         │         ┌─────────▼───────────┐
         │         │ 3. Enterprise Filter│
         │         │ ─ disable providers │
         │         │ ─ blacklist         │
         │         │ ─ preferred order   │
         │         │ ─ regional override │
         │         └─────────┬───────────┘
         │                   │
         │         ┌─────────▼───────────┐
         │         │ 4. Rank             │
         │         │ ProviderRanking     │
         │         │ Engine              │
         │         │ (capabilities +     │
         │         │  protocol +         │
         │         │  currency)          │
         │         └─────────┬───────────┘
         │                   │
         │         ┌─────────▼───────────┐
         │         │ 5. Select           │
         │         │ primary = best      │
         │         │ fallbacks = ranked  │
         │         │ [1..n] truncated    │
         │         └─────────┬───────────┘
         │                   │
         │         ┌─────────▼───────────┐
         │         │ ProviderSelection   │
         └─────────┤ Result              │
                   │ ─ primary           │
                   │ ─ fallbacks[]       │
                   │ ─ score             │
                   │ ─ reason            │
                   │ ─ allConsidered[]   │
                   └─────────────────────┘
```

## ProviderSelector Class

```typescript
// selection/engine.ts:7-103
class ProviderSelector {
  select(criteria: ProviderSelectionCriteria): ProviderSelectionResult;
}
```

The `select()` method executes steps 1-5 in sequence. It is stateless — all state lives in the routing engine, ranking engine, and enterprise config manager.

## Enterprise Configuration Overrides

The `EnterpriseProviderConfigManager` (`config/enterprise-config.ts:21-84`) allows per-tenant overrides that take precedence at specific pipeline stages.

### `EnterpriseProviderConfig`

```typescript
interface EnterpriseProviderConfig {
  tenantId: string;
  forceProvider?: BankProviderKind;           // Bypass all routing/ranking
  disabledProviders?: BankProviderKind[];     // Remove from consideration
  blacklistedProviders?: BankProviderKind[];  // Remove (security-focused)
  preferredOrder?: BankProviderKind[];        // Promote to top of list
  regionalOverrides?: RegionalOverride[];     // Per-region overrides
  defaultProtocol?: ConnectionProtocol;       // Protocol preference
}

interface RegionalOverride {
  region: BankingRegion;
  countryCode?: string;                        // Optional country specificity
  forceProvider?: BankProviderKind;
  disabledProviders?: BankProviderKind[];
  preferredOrder?: BankProviderKind[];
}
```

### Override Application Order

In the `ProviderSelector.select()` method (`engine.ts:13-71`):

1. **Global forceProvider** — If `tenantConfig.forceProvider` is set, it returns immediately with score 100 and no fallbacks. Bypasses all routing, ranking, and filtering.

2. **Disabled providers** — Removed from the candidate list after routing.

3. **Blacklisted providers** — Removed after disabled filter (same effect, separate concern for audit clarity).

4. **Preferred order** — Candidates matching `preferredOrder` are moved to the front of the list (preserving their order), followed by remaining candidates.

5. **Regional overrides** — If a matching `RegionalOverride` exists:
   - `forceProvider` returns immediately with score 100 and remaining candidates as fallbacks
   - `disabledProviders` filters further
   - `preferredOrder` reorders within the region

### Override Priority

```
Force > Regional Force > Preferred Order > Disable/Blacklist > Routing Default
```

## Selection Criteria and Result Types

### `ProviderSelectionCriteria` (selection/types.ts:3-12)

```typescript
interface ProviderSelectionCriteria {
  region: BankingRegion;                    // Required — target region
  countryCode?: string;                     // ISO alpha-2
  requiredCapabilities?: ProviderCapability[];  // Must-have capabilities
  preferredProtocol?: ConnectionProtocol;   // Protocol preference
  currency?: string;                        // ISO 4217
  tenantId?: string;                        // For enterprise config lookup
  requireHealthy?: boolean;                 // Future: filter unhealthy providers
  maxFallbacks?: number;                    // Limit fallback chain length
}
```

### `ProviderSelectionResult` (selection/types.ts:14-20)

```typescript
interface ProviderSelectionResult {
  primary: BankProviderKind;                // Selected best provider
  fallbacks: BankProviderKind[];            // Ordered fallback chain
  score: number;                            // Primary's total score (0-100)
  reason: string;                           // Human-readable justification
  allConsidered: Array<{
    kind: BankProviderKind;
    score: number;
    reason: string;
  }>;
}
```

## Prioritization Strategy

The selection prioritization stack, from highest to lowest priority:

| Priority | Factor | Applied By |
|----------|--------|------------|
| 1 | Tenant force provider | `EnterpriseProviderConfig.forceProvider` |
| 2 | Regional force override | `RegionalOverride.forceProvider` |
| 3 | Tenant preferred order | `EnterpriseProviderConfig.preferredOrder` |
| 4 | Regional preferred order | `RegionalOverride.preferredOrder` |
| 5 | Routing rank | `BankingRoutingEngine` — sorts by `regional rank` |
| 6 | Ranking score | `ProviderRankingEngine` — multi-dimensional scoring |
| 7 | Alphabetical (tiebreaker) | Stable sort preserves definition order |

## Full Walkthrough Example

### Request

```typescript
const criteria: ProviderSelectionCriteria = {
  region: BankingRegion.MIDDLE_EAST,
  countryCode: "AE",
  requiredCapabilities: ["BALANCES", "TRANSACTIONS", "PAYMENTS"],
  currency: "AED",
  tenantId: "tenant-42",
  maxFallbacks: 3,
};
```

### Step 1: Force Check

```
No forceProvider configured for tenant-42 → continue
```

### Step 2: Route

`BankingRoutingEngine.route()` resolves:

```
Region: MIDDLE_EAST
Country: AE → matches MIDDLE_EAST registry, country found in MIDDLE_EAST codes

Providers (before filter):
  lean(1, rec), tarabut(2), yap(3), salted(6), direct-api(10), csv(20), manual(21)

requiredCapabilities filter [BALANCES, TRANSACTIONS, PAYMENTS]:
  lean: has BALANCES, TRANSACTIONS → NO PAYMENTS → filtered out
  tarabut: has BALANCES, TRANSACTIONS, PAYMENTS → kept
  yap: has BALANCES, TRANSACTIONS, PAYMENTS → kept
  salted: has BALANCES, TRANSACTIONS → NO PAYMENTS → filtered out
  direct-api: has BALANCES, TRANSACTIONS → NO PAYMENTS → filtered out
  csv: has BALANCES, TRANSACTIONS → filtered out
  manual: has BALANCES, TRANSACTIONS → filtered out

After routing: [tarabut(2), yap(3)]
```

### Step 3: Enterprise Filter

```typescript
// Tenant config for tenant-42:
{
  tenantId: "tenant-42",
  preferredOrder: ["yap", "tarabut"],  // reversed from routing
  regionalOverrides: [{
    region: MIDDLE_EAST,
    countryCode: "AE",
    disabledProviders: ["salted"],       // not in list anyway
  }],
}
```

```
After preferredOrder reorder: [yap, tarabut]
```

### Step 4: Rank

`ProviderRankingEngine.rank()` on `[yap, tarabut]`:

**Yap:**
```
baseRank: 100 - 3 = 97 (yap globalPriority is estimated; not in definitions)
capabilities: 3/3 matched → 100
protocol: no preferred → 0
currency: AED → check definitions → 0 (unknown)
failoverPriority: assumed 10 → 20
sandbox: assumed false → 0

total: 97×0.30 + 100×0.30 + 0 + 0 + 20×0.10 + 0 = 29.1 + 30.0 + 0 + 0 + 2.0 + 0 = 61.1
```

*Note: In practice, yap currently lacks a `ProviderDefinition` entry, so `baseRank` defaults to 50 and many scores are 0. This example demonstrates the formula.*

**Tarabut:**
```
baseRank: 100 - 3 = 97
capabilities: 3/3 → 100
protocol: no preferred → 0
currency: AED is in tarabut.currencies → 100
failoverPriority: 4 (tarabut has failoverPriority: 4) → 20
sandbox: true → 10

total: 97×0.30 + 100×0.30 + 0 + 100×0.10 + 20×0.10 + 10×0.10
     = 29.1 + 30.0 + 0 + 10.0 + 2.0 + 1.0 = 72.1
```

### Step 5: Select

```typescript
primary = "tarabut"  // score 72.1
fallbacks = ["yap"]   // score 61.1
maxFallbacks = 3, but only 1 other candidate → truncated to ["yap"]
```

### Result

```typescript
const result: ProviderSelectionResult = {
  primary: "tarabut",
  fallbacks: ["yap"],
  score: 72.1,
  reason: "capability match 100%, supports AED, priority rank 3",
  allConsidered: [
    { kind: "tarabut", score: 72.1, reason: "capability match 100%, supports AED, priority rank 3" },
    { kind: "yap", score: 61.1, reason: "capability match 100%, priority rank 3" },
  ],
};
```

## Failover Chain Behavior

Once a `ProviderSelectionResult` is returned, the consumer uses the primary first and iterates through fallbacks on failure:

```
Operation Start
      │
      ▼
┌─────────────┐     success     ┌──────────────┐
│  primary    │ ──────────────► │  Return      │
│  "tarabut"  │                 │  Success     │
└──────┬──────┘                 └──────────────┘
       │ failure
       ▼
┌─────────────┐     success     ┌──────────────┐
│  fallback 1 │ ──────────────► │  Return      │
│  "yap"      │                 │  Success     │
└──────┬──────┘                 └──────────────┘
       │ failure
       ▼
┌─────────────┐     success     ┌──────────────┐
│  fallback 2 │ ──────────────► │  Return      │
│  (none)     │                 │  Success     │
└──────┬──────┘                 └──────────────┘
       │ no more fallbacks
       ▼
┌─────────────┐
│  Throw      │
│  "All N     │
│  providers  │
│  failed"    │
└─────────────┘
```

### Failover Considerations

- **Idempotency**: Failover assumes operations are safe to retry. Payment initiation providers must handle duplicate detection (e.g., via `externalIdempotencyKey`).
- **Timeout per attempt**: Each provider attempt should have its own timeout to prevent one slow provider from blocking the chain.
- **Circuit breaking**: In production, a circuit breaker per provider prevents repeatedly attempting a known-failed provider. This is orthogonal to the selection engine.
- **Stale fallback chains**: The selection result is valid at decision time. Long-lived operations should re-query if significant time has passed.

## Key Design Decisions

1. **Stateless selection**: `ProviderSelector` has no mutable state. Every call recomputes from definitions, registry, and config. This avoids staleness but means no caching — a LRU cache could be added for hot paths.

2. **Force overrides bypass entirely**: A forced provider skips routing, ranking, and all other logic. This is intentional for disaster scenarios where operators need absolute control.

3. **Preferred order ≠ ranking override**: Preferred order rearranges the *input* to the ranking engine, not the output. The ranking engine still scores all candidates; the sorted order is used only for tie-breaking after scoring.

4. **Max fallbacks prevents resource exhaustion**: Setting `maxFallbacks: 2` limits the failover chain regardless of how many providers exist. Default is unlimited (all candidates except primary).

5. **Tenant ID is optional**: Without `tenantId`, enterprise config is skipped. This allows unauthenticated or system-level operations to use default routing.

