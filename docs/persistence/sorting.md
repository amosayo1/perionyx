# Sorting

## Overview

The sorting system supports multi-field sorting with configurable direction per field.

## Types

```typescript
interface SortField {
  field: string;
  direction: SortDirection; // "asc" | "desc"
}

type SortCriteria = SortField[];
```

## Builder Functions

```typescript
import { asc, desc, by } from "@/server/persistence";

// Single field
const sort = by(asc("name"));

// Multiple fields
const sort = by(desc("createdAt"), asc("name"));

// Mixed directions
const sort = [
  desc("priority"),
  asc("dueDate"),
  asc("id"),
];
```

## Usage

```typescript
// Sort by creation date descending, then name ascending
const results = await repo.findMany(
  eq("status", "active"),
  by(desc("createdAt"), asc("name")),
);
```

## Direction Enum

| Direction | Value | Description |
|---|---|---|
| Ascending | `"asc"` | A → Z, 0 → 9 |
| Descending | `"desc"` | Z → A, 9 → 0 |

## Multi-Sort Priority

Sort fields are applied in array order. The first field has the highest priority. If values are equal on the first field, the second field is used as a tiebreaker, and so on.
