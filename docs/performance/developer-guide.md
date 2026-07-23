# Developer Performance Guide

**Applies to**: Perionyx Enterprise Finance Platform v1.0  
**Audience**: All engineers working on the platform

---

## 1. Import Conventions

```tsx
// ✅ GOOD — tree-shakeable named imports
import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { useMultiSort } from '@/hooks/use-multi-sort';

// ❌ BAD — imports entire barrel
import * as React from 'react';
import * as Framermotion from 'framer-motion';
import { formatCurrency, formatDate, formatPercent } from '@/lib/format';
// (only import what you use)
```

### Barrel file rule:
Barrel files (`index.ts`) are for public API surfaces only. Inner modules import directly:

```tsx
// Public API — use barrel
import { DataTable, EnterpriseTable } from '@/components/enterprise/table';

// Internal modules — direct import
import { useMultiSort } from '@/components/enterprise/table/hooks/use-multi-sort';
```

---

## 2. Component Classification

| Type | Default | When to use |
|---|---|---|
| **Server Component** | ✅ Always | Static data, layout, SEO content |
| **Client Component** | Only when needed | Interactivity, state, effects, hooks |
| **Dynamic Import** | For heavy/rare components | >5 KB, conditional UI |
| **React.memo** | For pure presentational | Same props → same output |

Decision flow:
```
Need interactivity?
  ├── No  → Server Component ✓
  └── Yes → Client Component
              ├── Heavy (>5KB) → dynamic(() => import(...))
              ├── Pure props   → React.memo()
              └── Child list   → React.memo() + useCallback()
```

---

## 3. When to Use `'use client'`

Add `'use client'` **only** when the component uses:
- `useState`, `useReducer`
- `useEffect`, `useLayoutEffect`
- `useContext` (consumer)
- `useRef` (DOM or mutable)
- `useCallback`, `useMemo` (triggers client)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `document`, `IntersectionObserver`)
- Third-party hooks that use the above

**Important:** `'use client'` applies to the entire file. If a file exports multiple components, only the interactive ones need it. Extract server-renderable components into separate files.

---

## 4. Memo Pattern Reference

```tsx
// ✅ useMemo — expensive computations
const totals = useMemo(
  () => computeAggregateTotals(transactions),
  [transactions]
);

// ✅ useCallback — stable function refs
const handleRowClick = useCallback(
  (id: string) => router.push(`/treasury/${id}`),
  [router]
);

// ✅ React.memo — pure component
export const Row = React.memo(function Row({ data }: { data: RowData }) {
  return <div>{data.name}</div>;
});

// ❌ Do NOT memoize:
// - Event handlers on intrinsic HTML elements (<button onClick>)
// - Server components (they're functions, not re-rendered)
// - Components rendering children passed from parent
```

---

## 5. Bundle Size Budgets

| Category | Budget | Measurement |
|---|---|---|
| **First Load JS** | <120 KB gzip | `next build` output |
| **Total JS** | <400 KB gzip | `next bundle-analyzer` |
| **CSS** | <30 KB | Tailwind + CSS modules |
| **Single component** | <10 KB gzip | For dynamically imported |
| **Page payload** | <200 KB total | JS + CSS + HTML |

**Enforcement:** CI pipeline runs `pnpm build` and fails if:
- Bundle analyzer shows any chunk >80 KB
- First Load JS exceeds 120 KB
- Duplicate modules detected

---

## 6. Performance Checklist

Before submitting any PR, verify:

- [ ] No unnecessary `'use client'` directives
- [ ] `dynamic()` imports for components >5 KB that are not immediately visible
- [ ] `React.memo` on table rows, list items, metric cards
- [ ] `useMemo` for filtered/sorted data arrays
- [ ] `useCallback` for callbacks passed to memoized children
- [ ] No inline object/array literals in component props (causes re-renders)
- [ ] Import only the functions you use (tree-shaking)
- [ ] No unused dependencies in `package.json`
- [ ] Images use `next/image` with explicit `width`/`height`
- [ ] Fetched data has `cacheHeaders()` for GET endpoints
- [ ] No `window.confirm()` — use `<ConfirmDialog>`
- [ ] Keyboard shortcuts use `useKeyboardShortcuts()` hook
- [ ] Suspense boundary wrapping any async data fetch in client components
- [ ] Error boundary wrapping each section or widget
- [ ] `<Link>` prefetch enabled for critical navigations
- [ ] No `*` wildcard re-exports from barrel files

---

## 7. Profiling Tools

### Local profiling

```bash
# Bundle analysis
pnpm analyze

# React DevTools profiler
# Open DevTools → Components → Profiler → Record

# Lighthouse CI
pnpm dlx @lhci/cli collect --url http://localhost:3000

# Next.js build output
pnpm build  # Shows per-route sizes
```

### Performance monitoring in production

```tsx
// Custom metrics reporting
import { reportWebVitals } from 'next/web-vitals';

export function reportWebVitalsHandler(metric: NextWebVitalsMetric) {
  console.log(metric); // Or send to analytics
  recordMetric(metric.name, metric.value);
}
```

### Chrome DevTools

| Tool | What to check |
|---|---|
| **Performance tab** | Main thread work, long tasks (>50ms), layout thrash |
| **Layers tab** | Layer count, composited layers, paint counts |
| **Memory tab** | Heap snapshots, detached DOM nodes, leak detection |
| **Network tab** | Waterfall, preload/prefetch status, cache hits |
| **Coverage tab** | Unused JS/CSS per page load |

---

## 8. Common Anti-Patterns

```tsx
// ❌ AVOID — inline object prop creates new reference every render
<DataTable columns={[{ key: 'name', label: 'Name' }]} />

// ✅ PREFER — stable reference outside component
const COLUMNS = [{ key: 'name', label: 'Name' }];
<DataTable columns={COLUMNS} />

// ❌ AVOID — arrow function in render breaks memo
<MemoizedRow onClick={(id) => handleClick(id)} />

// ✅ PREFER — useCallback handler
const handleClick = useCallback((id: string) => handleClick(id), []);
<MemoizedRow onClick={handleClick} />

// ❌ AVOID — large client component without memo
function ExpenseTable({ data }: { data: Expense[] }) {
  return data.map(item => <Row key={item.id} item={item} />);
}

// ✅ PREFER — memoized row component + useMemo for mapping
const Row = React.memo(({ item }: { item: Expense }) => <div>{item.name}</div>);

function ExpenseTable({ data }: { data: Expense[] }) {
  const rows = useMemo(() => data.map(item => <Row key={item.id} item={item} />), [data]);
  return <div>{rows}</div>;
}
```

---

## 9. Production Debugging

```bash
# Check current bundle sizes
pnpm build | grep -E 'Route|Size'

# Analyze production bundle
ANALYZE=true pnpm build

# Check for render issues
# Enable "Highlight updates" in React DevTools → Components → Settings
```
