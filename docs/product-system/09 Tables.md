# 09 — Tables

**Product System · Document 09 of 20**
**Authority: Tables is the data-grid and tabular-surface specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Tables & Data domain), and Finance Principles (04), and is binding on all table, grid, list, and work-queue surfaces.**
**Sources: The four-product research program — Stripe S5 (tables as the crown jewel), Linear S6 (lists) and S5.5 (selection model), Ramp S10.2 (density and bulk operations), Coupa S10.2 (enterprise tables); the EnterpriseTable implementation (Phase 8B.4); the EDL.**

---

## 1. The Table Doctrine

**A Perionyx table is a reconciliation instrument, not a list** (PP-061). Finance users scan, compare, and export. The table is the audit instrument — designed for comparison first, engineered for trust, and exportable with parity (PP-056).

The research synthesis:
- **Stripe** calls tables "the hidden crown jewel" (Stripe S5): the discipline is in the columns, spacing, sorting, bulk actions, sticky headers, and search.
- **Linear** proves the list is the primary surface for operators: density modes, state persistence, empty states, selection model (Linear S6, S5.5).
- **Ramp** proves density is a mode, not a compromise, and bulk operations appear on selection (PP-096, PP-071).
- **Coupa** proves enterprise tables handle analyst workflows: filters, saved views, exports (PP-065, PP-073).

## 2. The Row and the Cell

**The row is a door** (PP-070): every row opens its detail; every detail returns via breadcrumb (PP-028). Row hover reveals row actions and drill links (PP-078).

**The cell follows the formatter contract** (PP-077), driven by `CellConfig`, never ad hoc:

- **Money cells** — right-aligned, tabular figures, negative-parentheses convention (PP-062, PP-063, PP-129), currency/basis labeled where mixed (PP-128).
- **Date cells** — relative-with-absolute ("3m ago · 2026-08-02 09:41 UTC"), user timezone (PP-155).
- **Status cells** — icon + label + color; color never the sole carrier (PP-072, PP-125); explanation on hover/expand (PP-141).
- **Number cells** — formatted with unit and basis (PP-134).
- **Trend cells** — up/down arrows + percentage, labeled with basis (PP-135).
- **Tag cells** — truncated badge list with expansion.
- **ID cells** — mono, copyable (PP-133).

**Identity and value never mix types** (PP-064): IDs in mono, sums in Inter, tabular.

## 3. Columns and Pinning

**Column order encodes the read** (Stripe S5.2): identity → status → the deciding values → actions. Wide tables freeze identity and money columns (PP-067): scanning never loses context.

**Sticky headers** are default (PP-067). **Column pinning** is a user preference, persisted (PP-059).

## 4. Sorting and Filtering

**Single-column sort by default; multi-sort as power** (PP-068) — multi-sort behind a power toggle with priority labels (primary/secondary/tertiary), persisted in saved views.

**Filters map to real questions, with presets** (PP-065): "This month", "Needs my approval", "Exceptions", "Requires me". Presets are one click.

**Filters execute against the server at scale** (PP-066): server-side filtering and pagination on large datasets; client filtering only for bounded reference data. Client slicing lies at scale (PP-249).

**Filter and search share a grammar** (PP-262); saved views persist the whole projection (PP-030).

## 5. Density

**Density is a preference, never a guess** (PP-069). Three designed modes:
- **Comfortable** — deliberative surfaces, review.
- **Compact** — the default operational mode.
- **Ultra-compact** — auditors and power analysts (PP-235).

Density persists per user across tables (PP-069); density is a projection, never a data change (PP-030). Dense is a mode, not a compromise (PP-235).

## 6. Selection and Bulk Actions

**Bulk power appears on selection** (PP-071): the action bar (batch approve/export/flag) appears only when rows are selected (Stripe S5.5, Linear S5.5). On-demand action bars reduce clutter and teach actionability.

Selection is keyboard-accessible (shift/arrow selection); bulk actions are always confirmable where money is involved (PP-162).

## 7. Search and Pagination

**Table search highlights and remembers** (PP-076): `<mark>` result highlighting, recent-searches dropdown (localStorage), and keyboard-first operation.

**Pagination is honest about scale** (PP-075): ellipsis paging, page-size selector (25/50/100/200), accurate totals. Large results virtualize (PP-248): only visible rows render.

## 8. Totals and Footers

**Tables never lie about totals** (PP-080): grand totals, subtotals, and filtered totals are labeled with their basis — "Filtered 23 of 340" (PP-128). The footer states the currency and computation basis. An unlabeled total misleads reconciliation.

## 9. Empty and Edge States

**Empty tables teach** (PP-078): the empty state explains what the table is, why it is empty, and the next action — "Import your first vendor file" (PP-040). Sparse and error states are designed, not afterthoughts (PP-239). Loading uses skeletons, never spinners-first (PP-242).

## 10. Export

**Export is a first-class feature with scheduling** (PP-073): CSV (UTF-8 BOM for Excel) and XLS (XML Spreadsheet 2003), respecting visibility, filters, and sorting (PP-056). Exports carry metadata — generation timestamp, basis, filters, mode (PP-277). Export parity: anything shown exports with equal provenance (PP-056, PP-276).

## 11. Table Rules (Condensed)

1. Tables are reconciliation instruments, not lists (PP-061).
2. The row is a door; every row opens its detail (PP-070).
3. Cell formatting is config-driven, never ad hoc (PP-077).
4. Money is right-aligned and tabular; IDs are mono (PP-062, PP-064).
5. Sticky headers and frozen identity/money columns (PP-067).
6. Single-column sort by default; multi-sort as power (PP-068).
7. Filters map to questions with presets; server-side at scale (PP-065, PP-066).
8. Density is a persisted preference; dense is a mode (PP-069, PP-235).
9. Bulk power appears on selection (PP-071).
10. Search highlights and remembers (PP-076).
11. Pagination and virtualization are honest about scale (PP-075, PP-248).
12. Totals state their basis; tables never lie (PP-080).
13. Empty tables teach (PP-078).
14. Export is first-class with parity and metadata (PP-073, PP-056, PP-277).

## 12. Table Anti-Patterns

- **The unwalkable table** — rows that don't open details (rejected: PP-070).
- **The client-slice** — loading 400K rows to the client and filtering there (rejected: PP-066).
- **The color-only status** — status rendered as a colored dot with no label (rejected: PP-072).
- **The silent total** — a grand total without its basis (rejected: PP-080).
- **The density guessing game** — a per-page density control that forgets the user (rejected: PP-069).
- **The export of shame** — export that loses filters, sorting, or metadata (rejected: PP-056, PP-277).
- **The dead-end table** — a table whose rows lead nowhere (rejected: PP-028, WF-012).

---

*Next: `10 Forms.md` — the form and data-entry specification.*
