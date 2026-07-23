# Enterprise Reconciliation Platform — Extension Guide

## Overview

This guide explains how to extend the reconciliation platform with new reconciliation types, matching rules, exception classifications, and data source integrations.

## Adding New Reconciliation Types

### 1. Add Type to Enum

Add to `ReconciliationType` in `types.ts`:

```typescript
export type ReconciliationType = "existing" | "new_type";
```

### 2. Add to Prisma Schema

If the new type requires special fields, add them to `ReconciliationCase` or create a related model.

### 3. Implement Data Source Integration

Add a method to fetch data for the new type:

```typescript
static async getNewTypeData(ctx: TenantContext, period: string) {
  // Query the relevant service
  return { sourceTransactions, targetTransactions };
}
```

### 4. Configure Matching Rules

Create appropriate matching rules for the new type with suitable criteria and weights.

## Adding New Matching Rule Types

### 1. Add Rule Type

Add to `MatchingRuleType` in `types.ts`:

```typescript
export type MatchingRuleType = "existing" | "new_rule_type";
```

### 2. Implement Matching Logic

Add a new method to `MatchingEngine`:

```typescript
static calculateNewRuleMatch(
  source: TransactionRecord,
  target: TransactionRecord,
  criteria: MatchingCriteria
): number {
  // Return confidence score (0-1)
}
```

### 3. Add to Rule Engine

Update `calculateMatch` to use the new rule type.

## Adding New Exception Types

### 1. Add Exception Type

Add to `ExceptionType` in `types.ts`:

```typescript
export type ExceptionType = "existing" | "new_exception_type";
```

### 2. Add Classification Rule

Add a new rule to `CLASSIFICATION_RULES` in `exception-engine.ts`:

```typescript
{
  type: "new_exception_type",
  evaluate: (ctx) => {
    // Return confidence (0-1)
    // Return 0 if this rule doesn't apply
  },
}
```

### 3. Add Reasoning

Update `generateReasoning` to handle the new type.

## Adding New Data Sources

### 1. Create Integration

```typescript
static async getNewSourceTransactions(
  ctx: TenantContext,
  caseId: string
): Promise<TransactionRecord[]> {
  // Query the source system
  return transactions.map(normalizeTransaction);
}
```

### 2. Add to Case Workflow

Update the case creation flow to support importing from the new source.

## Customizing Exception Investigation

### 1. Add Investigation Step

```typescript
static async investigateNewType(
  ctx: TenantContext,
  exceptionId: string
): Promise<InvestigationContext> {
  // Gather context specific to this exception type
  return { /* context */ };
}
```

### 2. Add to Investigation Engine

Update `buildContext` to handle the new type.

## Testing

All reconciliation code should be tested with:
- Unit tests for matching algorithms
- Unit tests for exception classification
- Integration tests for API endpoints
- E2E tests for complete reconciliation workflows

Run tests with:
```bash
pnpm test
```
