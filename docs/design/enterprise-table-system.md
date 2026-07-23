# Enterprise Table System — Phase 8B.4

## Table Philosophy

Enterprise users spend more time inside tables than dashboards. Tables are productivity tools, not data displays. Every design decision optimizes for:

- **Speed** — Scan, find, act. No friction.
- **Readability** — Typography, spacing, alignment serve clarity.
- **Scanning** — Visual hierarchy guides the eye to anomalies.
- **Editing** — Inline edits remove context-switching overhead.
- **Filtering** — Narrow results without leaving the keyboard.
- **Investigation** — Row expansion reveals detail without navigation.
- **Bulk operations** — Select, act, move on.

### The 3-Second Test

A finance user should be able to:
1. Determine the total number of rows
2. Identify the highest/lowest value
3. Find a specific row by a known value

...within 3 seconds of page load.

## Architecture

### Component Tree

```
EnterpriseTable (data-table.tsx)
├── BulkActionBar
├── Toolbar
│   ├── Search input (or TableSearch component)
│   ├── Filters button → FilterPanel
│   │   └── RelativeDatePresets
│   ├── ColumnVisibilityMenu
│   ├── DensityMenu
│   ├── SavedViewsMenu
│   └── ExportMenu (CSV / Excel)
├── Table wrapper
│   └── Table (from @/components/ui/table)
│       ├── TableHeader (sticky)
│       │   └── Column headers with SortIcon + ColumnResizeHandle
│       └── TableBody
│           ├── GroupHeader (when grouping)
│           └── Rows with renderRow()
│               ├── Expand toggle (optional)
│               ├── Selection checkbox (optional)
│               ├── Cells (with cellConfig-based formatters)
│               │   ├── CurrencyCell
│               │   ├── NumberCell
│               │   ├── DateCell
│               │   ├── StatusCell
│               │   ├── TrendCell
│               │   └── InlineEdit
│               ├── Context menu (optional)
│               └── Expanded row (optional)
└── TablePagination
```

### Two-tier Architecture

| Tier | Path | Purpose |
|------|------|---------|
| Base DataTable | `@/components/data-table/` | Lightweight, no deps, backward compatible |
| EnterpriseTable | `@/components/enterprise/table/` | Full-featured, finance-optimized, extends base types |

The base `DataTable` is preserved for backward compatibility. All new development should use `EnterpriseTable`.

### Validated Pain Points Addressed

| Pain Point (UX-AUDIT.md) | Solution | Impact |
|---|---|---|
| Transactions table not sortable | Multi-column sort via `onMultiSort` | P1 |
| No pagination | Enhanced `TablePagination` with page size selector | Medium |
| No bulk selection | `onSelectedIdsChange` + `BulkActionBar` | P2 |
| No search | Client-side filtering + highlight matches | Medium |
| No running balance column | `CellConfig.type: "currency"` with running total pattern | Low |
| No export | CSV + Excel (XLS XML) export with column visibility respect | Low |
| Only 5 page buttons | `TablePagination` with ellipsis + page size selector | Low |

### Validated Persona Needs (from AGENTS.md)

| Persona | Table Feature |
|---------|---------------|
| CFO | Instant visibility via currency formatters, negative-red, trend indicators |
| Treasurer | Ultra-compact density, multi-sort, precision column alignment |
| Controller | Audit-ready inline editing with validation, undo, audit trail |
| Finance Manager | Bulk actions, saved views, filter presets, grouping |
| Auditor | Excel export, chronological column sorting, expanded detail panels |

## Density Guidelines

| Mode | Row Height | Text Size | Use Case |
|------|-----------|-----------|----------|
| Comfortable | `py-2.5` | `text-sm` | Review, investigation, approval workflows |
| Default | `py-2` | `text-sm` | General purpose (default) |
| Compact | `py-1.5` | `text-sm` | Daily operations, high data density |
| Ultra Compact | `py-1` | `text-[13px]` | CFO dashboard, export preview, mass review |

Density is persisted via `SavedView.state.density` in localStorage.

## Column Configuration

### Cell Formatters (cellConfig)

```typescript
interface CellConfig {
  type?: "text" | "number" | "currency" | "date" | "status" | "trend" | "tags";
  currency?: string;        // ISO 4217 currency code
  locale?: string;          // Intl locale (defaults to browser)
  fractionDigits?: number;  // Decimal places (default 2)
  align?: "left" | "right" | "center";
  negativeRed?: boolean;    // Show negative values in red (default true for currency/number)
  abbreviate?: boolean;     // Show 1.5M instead of 1,500,000
  relative?: boolean;       // Show "3m ago" for dates
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "short" | "long" | "full";
  truncate?: number;        // Max width in px
}
```

### Inline Editing (inlineEdit)

```typescript
interface InlineEditConfig<T> {
  type: "text" | "number" | "currency" | "date" | "select" | "tags";
  options?: { value: string; label: string }[];  // For "select" type
  validate?: (value: string, row: T) => string | undefined;  // Return error message
  onSave: (value: string, row: T) => Promise<void> | void;
  placeholder?: string;
}
```

### Column Pinning

Set `col.pin = "left"` or `col.pin = "right"` on the column definition. Pinned columns use `position: sticky` with appropriate z-index layering.

### Column Sizing

- `col.width` — fixed width in px
- `col.minWidth` — minimum width in px
- `col.resizable` — set to `false` to disable resize handle
- `useColumnResize` hook persists widths to `SavedView.columnWidths`

## Filtering Rules

### Filter Operators by Type

| Type | Operators |
|------|-----------|
| text | `eq`, `contains` |
| number | `eq`, `gt`, `gte`, `lt`, `lte` |
| select | `eq` |
| date/date-range | `eq`, `gte` (after), `lte` (before), `between` |

### Relative Date Presets

When the filter definitions include date fields, a "Quick Dates" button appears:

- Today
- This Week
- This Month
- Last 30 Days
- Last Quarter
- This Year

These auto-populate the date range filter values with computed ISO dates.

### Filter Logic

Currently all filters use AND logic (every condition must match). The `FilterValue` type includes `logic?: "AND" | "OR"` for future OR support.

## Grouping Rules

- Group by any column with `col.groupable = true`
- Groups render as `<GroupHeader>` rows with expand/collapse toggles
- Expanding collapses groups is local state
- Group headers show count: `Status: Pending (14)`

## Sorting

### Single Sort (default)
- Click a column header to sort desc → asc → none
- `onSort(key, direction)` for controlled mode

### Multi-Column Sort
- Enable by passing `onMultiSort` callback
- Click adds to sort stack, re-click cycles desc → none
- Each sort has a `priority` (0 = primary, 1 = secondary, etc.)
- Sorting renders in reverse priority order (primary applied last = stable)
- Multi-sort state can be persisted in `SavedView.multiSort`

## Selection & Bulk Actions

- `onSelectedIdsChange` enables row-level checkbox selection
- Header checkbox toggles all visible rows
- `BulkActionBar` appears when any row is selected
- Bulk actions receive the full selected row array
- Action variants: `default`, `destructive` (red), `outline`

## Search

- Client-side: filters all columns for matching text
- Server-side: pass `searchValue` to trigger API calls
- Highlight matches: when `searchValue` is set, matching text in cells is wrapped in `<mark>` with gold background
- Recent searches: stored in localStorage, shown as dropdown on focus

## Exports

| Format | Implementation | Notes |
|--------|----------------|-------|
| CSV | `exportToCsv()` | UTF-8 BOM prefix for Excel compatibility, respects column visibility |
| Excel (XLS) | `exportToXls()` | XML Spreadsheet 2003 format, no dependencies, opens natively in Excel |

Both exports:
- Respect current column visibility
- Respect current filters and sorting
- Strip HTML from cell values
- Use sanitized headers

## Pagination

- Page size: 25, 50, 100, 200 (configurable via `pageSizeOptions`)
- Ellipsis-style page buttons for large page counts
- Previous/Next chevron buttons
- "Rows: [select]" dropdown when `onPageSizeChange` is provided

## Empty States

| State | Rendering |
|-------|-----------|
| No data, not loading | `EmptyState` component with title + description + action |
| Loading | 8 skeleton rows with shimmer animation |
| Error | Red border card with error message |
| Filtered to 0 | `EmptyState` with filter-aware messaging |

## Performance Guidelines

### Memoization Strategy

- `renderCell` resolves `cellConfig` type at render time (no intermediate components)
- `renderRow` is a plain function (not a component), avoiding React reconciliation overhead
- `useFilteredData` memoizes the entire filter/sort pipeline
- `useGrouping` memoizes group computation
- `useColumnResize` avoids re-render on resize events via refs

### Avoid

- Creating new arrays/objects in render (use `useMemo`)
- Inline arrow functions in JSX props (use `useCallback`)
- N+1 rendering patterns (map inside map without memoization)
- Expensive computations in `accessor` functions

### Virtualization TODO

For datasets exceeding 10,000 rows, integrate `@tanstack/react-virtual`:

```typescript
// Future integration point
import { useVirtualizer } from "@tanstack/react-virtual";
```

The table structure supports virtualization: rows are rendered from a `displayData` slice, the scroll container is the overflow wrapper, and each row renders independently.

## Accessibility

- `role="grid"` when keyboard navigation is enabled
- `aria-selected` on selected rows
- `aria-label` on checkboxes and sort controls
- Keyboard navigation via `useKeyboardNav` hook:
  - Arrow Up/Down: navigate rows
  - Enter: activate row
  - Space: select row
  - Escape: clear focus
  - Home/End: first/last row
- Focus visible ring on focused rows
- `tabIndex` on sortable column headers
- Screen reader labels on all interactive elements

## Future Extension Points

| Feature | Files to Create | Priority |
|---------|----------------|----------|
| Virtualization for 10K+ rows | hooks/use-virtualization.ts + integration in data-table.tsx | High |
| Column reorder (drag & drop) | hooks/use-column-reorder.ts + DnD library | Medium |
| OR filter logic | Update FilterValue + applyFilters | Medium |
| Filter presets (quick filters) | Update FilterPanel with preset buttons | Medium |
| Aggregation footer row | Optional footer row in TableFooter | Low |
| Running balance column | built-in pattern via cellConfig | Low |
| Column pinning UI in toolbar | Update ColumnVisibilityMenu with Pin buttons | Low |
| Multi-row inline edit | Toggle edit mode on toolbar + batch save | Low |
| Export to PDF | export-utils.ts integration with print CSS | Low |
| Saved server-side views | API endpoint + hook integration | Phase 7E |

## Files Created

| File | Purpose |
|------|---------|
| `src/components/enterprise/table/types.ts` | Enhanced types: ultra-compact density, multi-sort, cellConfig, inlineEdit, relative dates |
| `src/components/enterprise/table/cell-formatters.tsx` | CurrencyCell, NumberCell, DateCell, StatusCell, TrendCell, TagsCell |
| `src/components/enterprise/table/inline-edit.tsx` | Inline editing for text, number, currency, date, select |
| `src/components/enterprise/table/export-utils.ts` | CSV + XLS export with visibility/filter respect |
| `src/components/enterprise/table/table-search.tsx` | Search with highlight matches + recent searches |
| `src/components/enterprise/table/table-pagination.tsx` | Enhanced pagination with page size selector |
| `src/components/enterprise/table/hooks/use-multi-sort.ts` | Multi-column sort state management |

## Files Modified

| File | Change |
|------|--------|
| `src/components/enterprise/table/data-table.tsx` | Integrated multi-sort, ultra-compact density, cell formatters, inline editing, enhanced pagination, Excel export |
| `src/components/enterprise/table/toolbar.tsx` | Added relative date presets, ExportMenu with CSV/Excel, ultra-compact density, enhanced filter panel |
| `src/components/enterprise/table/index.ts` | Added exports for all new components and hooks |
| `src/components/enterprise/table/hooks/use-table-views.ts` | Extended SavedView type with multiSort, columnOrder, pageSize |
| `src/app/(shell)/ledger/page.tsx` | Migrated to EnterpriseTable with cellConfig formatters, XLS export |
| `src/app/(shell)/transactions/page.tsx` | Migrated to EnterpriseTable with cellConfig formatters, XLS export |
| `src/app/(shell)/audit-logs/page.tsx` | Migrated to EnterpriseTable with cellConfig formatters, XLS export |
| `src/components/incidents/incident-table.tsx` | Migrated to EnterpriseTable |

## Security Review (from AGENTS.md · Section 4)

| # | Question | Answer |
|---|---|---|
| 1 | Expose sensitive financial data? | No — table renders data the page already has access to |
| 2 | New permission required? | No — no new API endpoints or mutations added |
| 3 | Cross-tenant access? | No — table is presentational only |
| 4 | Audit logging needed? | No — no new mutations |
| 5 | Encryption required? | No |
| 6 | Operation reversible? | N/A — no operations introduced |
| 7 | Privilege escalation risk? | No |
| 8 | New secrets? | No |
| 9 | Rate limiting required? | No — no new API endpoints |
| 10 | Complies with security architecture? | Yes — follows established patterns |
