# Ownership Management

## Direct vs Indirect Ownership

### Direct Ownership
A parent entity holds ownership directly in a subsidiary. Tracked via `OwnershipRecord` with `isDirect: true`.

```
Holding owns 80% of Subsidiary US directly
→ OwnershipRecord: parentEntityId=HOLDING, subsidiaryEntityId=SUB-US, ownershipPercentage=80, isDirect=true
```

### Indirect Ownership
Ownership held through intermediate entities. Calculated recursively by multiplying ownership percentages along the chain.

```
Holding owns 60% of Parent EU
Parent EU owns 70% of Subsidiary DE
→ Effective ownership of Holding in Subsidiary DE: 60% × 70% = 42%
```

## Ownership Percentage and Effective Ownership

### Direct Ownership
```typescript
consService.ownership.getDirect()
// Returns all records where isDirect === true
```

### Effective Ownership Calculation
The `getEffectiveOwnership(parentId, subsidiaryId)` method recursively calculates:
- If direct ownership exists, return the direct percentage
- Otherwise, multiply indirect chain percentages:
  - `parentOwnership × subsidiaryOwnership / 100`
  - Recursively resolves through intermediate entities

### Consolidation Method Determination
| Effective Ownership | Method | Scope |
|---|---|---|
| > 50% | Full consolidation | full |
| Joint control | Proportional consolidation | proportional |
| 20-50% | Equity method | equity |
| < 20% | No consolidation | none |

## Goodwill and Fair Value Adjustments
Each `OwnershipRecord` tracks acquisition accounting details:
- `goodwillAmount` — Excess of consideration over fair value of net identifiable assets
- `fairValueAdjustments` — Fair value adjustments to assets and liabilities at acquisition
- `considerationTransferred` — Total consideration paid
- `contingentConsideration` — Future earn-out payments

## Acquisition Accounting
| Field | Description |
|---|---|
| acquisitionDate | Date control was obtained |
| considerationTransferred | Total consideration paid |
| contingentConsideration | Future earn-out payments |
| goodwillAmount | Goodwill recognized |
| fairValueAdjustments | Fair value adjustments to net assets |
