# Pagination

## Overview

The pagination framework supports both offset-based and cursor-based pagination strategies.

## Types

### Offset Pagination

```typescript
interface OffsetPaginationRequest {
  type: "offset";
  page: number;    // 1-based
  limit: number;   // items per page
}

interface PageMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface OffsetPaginationResult<T> {
  items: T[];
  metadata: PageMetadata;
}
```

### Cursor Pagination

```typescript
interface CursorPaginationRequest {
  type: "cursor";
  cursor: string;          // opaque cursor value
  limit: number;
  direction?: "forward" | "backward";
}

interface CursorPageMetadata {
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

interface CursorPaginationResult<T> {
  items: T[];
  metadata: CursorPageMetadata;
}
```

## Usage

```typescript
import { offsetPagination, cursorPagination } from "@/server/persistence";

// Offset-based
const result = await repo.paginate(offsetPagination(1, 20));
console.log(result.metadata.totalPages);

// Cursor-based
const result = await repo.paginate(
  cursorPagination("cursor_abc", 20, "forward")
);
```

## When to Use

| Strategy | Use Case |
|---|---|
| Offset | UI with page numbers, "Jump to page X" |
| Cursor | Real-time feeds, infinite scroll, large datasets |
