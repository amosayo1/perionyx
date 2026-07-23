# CFO Advisor — Extension Guide

## Overview

This guide explains how to extend the CFO Advisor with new briefing sections, scenario types, recommendation categories, and data source integrations.

## Adding New Briefing Sections

### 1. Define the Data Source

Add a new method to `CFOAdvisorService` that queries the relevant service:

```typescript
static async getNewSectionData(ctx: TenantContext): Promise<NewSectionData> {
  const data = await prisma.someModel.findMany({
    where: { companyId: ctx.companyId, ...filters },
  });
  return { /* structured data */ };
}
```

### 2. Add to Briefing Generation

In `generateMorningBriefing()`, add the new section to the briefing data:

```typescript
const newSection = await this.getNewSectionData(ctx);
briefingData.newSection = newSection;
```

### 3. Add to Executive Summary

Update the executive summary generation to include insights from the new section.

### 4. Add UI Component

Create a new `BriefingCard` variant in `src/components/cfo-advisor/` and add it to the briefing page.

## Adding New Scenario Types

### 1. Add Scenario Type

Add to the `ScenarioType` union in `types.ts`:

```typescript
export type ScenarioType = "existing_type" | "new_type";
```

### 2. Add to Prisma Enum

If needed, add the new type to the scenario parameters schema.

### 3. Implement Scenario Logic

Add a new method to `CFOAdvisorService`:

```typescript
static async runNewScenario(ctx: TenantContext, params: NewScenarioParams) {
  // 1. Gather current state from data sources
  // 2. Apply scenario parameters deterministically
  // 3. Calculate impact using existing reporting/intelligence
  // 4. Generate recommendations
  // 5. Return structured results
}
```

### 4. Add to Scenario Router

Update `runScenario()` to handle the new type.

## Adding New Recommendation Categories

### 1. Add Category

Add to the `RecommendationCategory` union in `types.ts`:

```typescript
export type RecommendationCategory = "existing" | "new_category";
```

### 2. Add Category Logic

In the recommendation generation logic, add rules for when to generate recommendations in this category.

### 3. Add UI Badge

Update the `RecommendationCard` component to handle the new category color/icon.

## Adding New Data Sources

### 1. Create Integration Method

```typescript
static async getNewDataSourceContext(ctx: TenantContext): Promise<NewDataSourceContext> {
  // Query the relevant service/module
  return { /* context data */ };
}
```

### 2. Add to Context Aggregation

In `getDashboardData()` and `generateMorningBriefing()`, add the new data source.

### 3. Add to Chat Context

In the executive chat response generation, include relevant data from the new source.

## Customizing the Dashboard

### Widget Configuration

The dashboard uses a widget-based layout. Each widget:
- Has a unique ID
- Can be pinned/hidden via workspace preferences
- Fetches its own data
- Renders via a client component

### Adding a New Widget

1. Create a client component in `src/components/cfo-advisor/`
2. Register it in the dashboard layout
3. Add it to the widget registry
4. Configure default visibility

## Testing

All CFO Advisor code should be tested with:
- Unit tests for service methods
- Integration tests for API endpoints
- E2E tests for critical workflows (briefing generation, scenario execution)

Run tests with:
```bash
pnpm test
```
