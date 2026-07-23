# Filtering

## Overview

The filtering system supports composable, type-safe filters that can represent any query condition.

## Operators

| Operator | Description | Usage |
|---|---|---|
| `eq` | Equals | `eq("status", "active")` |
| `neq` | Not equals | `neq("status", "deleted")` |
| `gt` | Greater than | `gt("balance", 1000)` |
| `gte` | Greater or equal | `gte("age", 18)` |
| `lt` | Less than | `lt("balance", 0)` |
| `lte` | Less or equal | `lte("amount", 50000)` |
| `between` | Between range | `between("date", start, end)` |
| `contains` | String contains | `contains("name", "John")` |
| `startsWith` | String starts with | `startsWith("code", "US")` |
| `endsWith` | String ends with | `endsWith("email", ".com")` |
| `in` | In list | `inList("status", ["a", "b"])` |
| `notIn` | Not in list | `notIn("role", ["admin"])` |
| `isNull` | Is null | `isNull("deletedAt")` |
| `isNotNull` | Is not null | `isNotNull("email")` |


## Logical Operators

```typescript
// AND — all conditions must match
and(eq("status", "active"), gt("balance", 1000))

// OR — any condition must match
or(eq("role", "admin"), eq("role", "manager"))

// Nested combinations
and(
  eq("tenant", "acme"),
  or(
    eq("status", "pending"),
    eq("priority", "high")
  )
)
```

## Field Filter

```typescript
interface FieldFilter {
  field: string;
  operator: FilterOperator;
  value?: unknown;
  values?: unknown[];
}
```

## Logical Filter

```typescript
interface LogicalFilter {
  type: "and" | "or";
  filters: Filter[];
}
```

## Filter is composable

```typescript
type Filter = FieldFilter | LogicalFilter;
```

## Usage

```typescript
const filter = and(
  eq("tenantId", tenantId),
  or(
    eq("status", "active"),
    eq("status", "pending"),
  ),
  between("createdAt", startDate, endDate),
);

const results = await repo.findMany(filter);
```
