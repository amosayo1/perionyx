# Performance Baseline — Perionyx v1.0

| Metric | Value |
|---|---|
| Total Pages | 306 |
| Route Groups | 46 |
| Components | 930 |
| Server Modules | 36 |
| TypeScript Files | 2,686 |
| Total Source Lines | 260,674 |
| Source Size | 16 MB |
| Dependencies | 36 |
| Dev Dependencies | 22 |
| Typecheck Errors | 158 (all pre-existing, mostly old-type imports in fpa domain) |
| Largest Component | `data-table.tsx` (753 lines) |
| Largest Server File | `cons-seed.ts` (1,725 lines) |
| Node Modules | 2.0 GB |

## Largest Pages by Lines of Code

| Page | Lines |
|---|---|
| admin/rules/page.tsx | 604 |
| transactions/page.tsx | 531 |
| admin/identity/page.tsx | 397 |
| transactions/[id]/approval-details/page.tsx | 386 |

## Largest Components by Lines of Code

| Component | Lines |
|---|---|
| data-table.tsx | 753 |
| toolbar.tsx | 542 |
| workflow-designer.tsx | 597 |
| approval-matrix-form.tsx | 462 |
| forecast-variance-center.tsx | 448 |
| modern-dashboard-client.tsx | 447 |
| enterprise-sidebar-new.tsx | 442 |

## Optimization Opportunities

1. **Large client components** — 10 components > 400 lines, all client-rendered
2. **No route-level code splitting** — all 306 pages eagerly imported
3. **No table virtualization** — DataTable renders all rows in DOM
4. **No lazy loading** — components are eagerly imported
5. **No prefetch** — no route prefetch strategy beyond Next.js defaults
6. **Duplicate table implementations** — DataTable (441 lines) + EnterpriseTable with separate codebase
7. **Large seed files** — 7 seed files > 600 lines loaded at build time
8. **No React.memo** on large table/list components
9. **No useMemo on expensive calculations** in data-table filtering/sorting
10. **In-memory stores initialized eagerly** — all 36 server modules allocate Maps at startup

## Module Page Distribution

| Module | Pages | Notes |
|---|---|---|
| risk | 22 | Largest route group |
| consolidation | 17 | Heavy data |
| fixed-assets | 16 | Separate domain |
| planning | 17 | New FP&A module |
| accounts-receivable | 15 | Full O2C sub-module |
| financial-close | 15 | Close management |
| treasury | 7 | Core treasury |
| accounting | 14 | GL core |
| tax | 14 | Tax management |
| general-ledger | 12 | Ledger core |
| compliance | 11 | Compliance framework |
| procurement | 11 | P2P |
| investments | 15 | Investment portfolio |
| automation-studio | 13 | Workflow engine |
