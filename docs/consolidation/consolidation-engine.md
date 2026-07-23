# Consolidation Engine

## Run Lifecycle
Each consolidation run progresses through a defined pipeline of statuses:

```
draft → dataCollection → translation → elimination → minorityInterest → adjustments → review → approved → locked
```

| Step | Description | Readiness Weight |
|---|---|---|
| draft | Run created, entities identified | 5% |
| dataCollection | Entity financial data being collected | 15% |
| translation | Currency translation in progress | 30% |
| elimination | Intercompany elimination processing | 45% |
| minorityInterest | Minority interest calculation | 55% |
| adjustments | Consolidation adjustments (FVA, goodwill, PPA) | 70% |
| review | Final review before approval | 85% |
| approved | Consolidation approved | 100% |
| locked | Finalized, no further changes | 100% |

## Run Types
| Type | Frequency | Max Expected Duration |
|---|---|---|
| monthly | Monthly close | 10 days |
| quarterly | Quarterly close | 20 days |
| yearly | Annual close | 30 days |
| adHoc | On-demand consolidation | Variable |

## Pipeline Steps
Each run tracks:
- `totalSteps` — Number of pipeline steps (7 active)
- `completedSteps` — Steps completed
- `entitiesIncluded` — Entities in scope
- `entitiesCompleted` — Entities that submitted data
- Boolean flags: `hasTranslationRun`, `hasEliminationsRun`, `hasMinorityInterest`, `hasAdjustments`, `hasFinancialStatements`

## Readiness Scoring
The `getReadinessScore(run)` method calculates a 0-100 score:

| Component | Weight |
|---|---|
| Base status weight | 5-100 (per step) |
| Translation completed | +5 |
| Eliminations completed | +5 |
| Financial statements generated | +5 |
| Entity submission rate | +0 to +10 |

Score = `min(100, baseWeight + bonusPoints)`
