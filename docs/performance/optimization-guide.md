# Performance Optimization Guide

**Applies to**: Perionyx Enterprise Finance Platform v1.0  
**Category**: All optimization strategies

---

## 1. Route Splitting

Next.js App Router automatically code-splits per route group. The platform uses 46 route groups across 306 pages, ensuring each route loads only its required JavaScript.

```tsx
// (shell) group — authenticated shell with sidebar, topbar, mobile nav
src/app/(shell)/
  automation-studio/
    page.tsx              // Dashboard — eagerly loaded
    analytics/page.tsx    // Lazy analytics bundle
    designer/page.tsx     // Workflow designer — heavy, lazy
    monitoring/page.tsx   // Monitoring — heavy, lazy
  enterprise/
    reports/page.tsx      // Report viewer — lazy
```

Shared layout components in `(shell)/layout.tsx` are extracted into a single chunk loaded once per session. Nested layouts in `(shell)/automation-studio/layout.tsx` further scope shared dependencies.

---

## 2. Dynamic Imports

Heavy or conditionally-visible components use `next/dynamic` to defer loading:

```tsx
import dynamic from 'next/dynamic';

const WorkflowCanvas = dynamic(
  () => import('@/components/enterprise/workflow/WorkflowCanvas'),
  {
    ssr: false,
    loading: () => <CanvasSkeleton />,
  }
);

const ApprovalAnalytics = dynamic(
  () => import('@/components/enterprise/analytics/ApprovalAnalytics'),
  { loading: () => <ChartSkeleton /> }
);
```

**Components using dynamic import:**

| Component | Reason | Fallback |
|---|---|---|
| `WorkflowCanvas` | Large canvas dependency | `CanvasSkeleton` |
| `AnimatedDialog` | framer-motion AnimatePresence | null |
| `ApprovalAnalytics` | Heavy chart rendering | `ChartSkeleton` |
| `DrillDownPanel` | Only on user interaction | `SkeletonCard` |
| `OnboardingWizard` | Multi-step wizard, rare usage | `StepperSkeleton` |

---

## 3. React.memo

Expensive rendering components wrapped with `React.memo` with explicit comparison where needed:

```tsx
export const DataTable = React.memo(DataTableComponent);

export const MetricCard = React.memo(MetricCardComponent);
export const TreasurySnapshot = React.memo(TreasurySnapshotComponent);
export const AnimatedTableRow = React.memo(AnimatedTableRowComponent);
```

**Memoized components:**
- `DataTable` — prevents re-render when parent data updates without table data changing
- `MetricCard` — stable metric values use referential equality
- `TreasurySnapshot` — large data snapshot, only updates on new snapshot
- `AnimatedTableRow` — 1000+ rows, shallow compare on row data
- `ChartCard`, `VarianceCard`, `CashFlowTimeline`, `ForecastChart`

---

## 4. useMemo / useCallback

Expensive computations and stable callbacks:

```tsx
// Inside DataTable
const processedRows = useMemo(
  () => applyFiltersAndSort(rows, filters, sortState),
  [rows, filters, sortState]
);

const handleSort = useCallback(
  (column: string) => dispatch({ type: 'TOGGLE_SORT', column }),
  []
);
```

**Key memoized values:**
- Filtered/sorted row pipelines in `DataTable`
- Aggregated metrics in `AnalyticsDashboard`
- Chart data transformations in all chart components
- Form validation state computations

---

## 5. Virtualization

Large lists and tables use virtualized rendering:

```tsx
<VirtualizedTable
  rows={data}            // Supports 100k+ rows
  rowHeight={48}
  overscan={10}
  onEndReached={fetchNextPage}
/>
```

See [Virtualization docs](./virtualization.md) for detailed implementation.

---

## 6. Code Splitting

Beyond route splitting, feature-based code splitting isolates seldom-used modules:

```tsx
// Only loaded when user opens onboarding wizard
const OnboardingWizard = dynamic(() => import('./onboarding-wizard'));
// Only loaded when AI panel is toggled
const AiAssistant = dynamic(() => import('./ai-assistant'));
```

**Split points:**
- `ApprovalAnalytics` (donut charts + drill-down)
- `DrillDownPanel` (heavy detail view)
- `WorkflowCanvas` (canvas rendering engine)
- `NotificationCenter` (only after login)
- `KeyboardShortcutsDialog` (only on `?` key press)

---

## 7. Prefetch / Cache Warming

Critical data is prefetched at the layout level:

```tsx
// Layout prefetches dashboard data before navigation completes
export default function ShellLayout({ children }) {
  useEffect(() => {
    prefetchDashboardMetrics();
    prefetchTreasurySnapshot();
    prefetchApprovalQueue();
  }, []);
  return <>{children}</>;
}
```

Next.js `<Link>` component provides automatic prefetch for visible links:

```tsx
<Link href="/mobile-dashboard" prefetch={true}>
  Dashboard
</Link>
```

**Cache warming schedule:**
- Treasury snapshots: every 30s
- Approval queue: every 15s
- Alert counts: every 30s
- Executive metrics: every 60s

---

## 8. Suspense Boundaries

Streaming SSR with Suspense boundaries allows progressive rendering:

```tsx
<Suspense fallback={<MetricSkeleton />}>
  <ExecutiveKpiCard metric={metric} />
</Suspense>

<Suspense fallback={<ChartSkeleton />}>
  <CashFlowTimeline />
</Suspense>
```

**Suspense boundaries (top-down):**
1. Page-level: `loading.tsx` per route group
2. Section-level: `AnalyticsSection`, `ReportsSection`
3. Component-level: `MetricCard`, `ChartCard`, `DataTable`
4. Form-level: `EnterpriseForm` submits

---

## 9. Error Boundaries

Each major section has a dedicated error boundary:

```tsx
<ErrorBoundary fallback={<SectionError />}>
  <AnalyticsSection />
</ErrorBoundary>

<ErrorBoundary fallback={<TableError />}>
  <DataTable />
</ErrorBoundary>
```

See [React Performance](./react-performance.md) for error boundary patterns.

---

## 10. Streaming SSR

Next.js streaming enables sending HTML progressively:

- Layout shell renders immediately (sidebar, topbar)
- Skeleton placeholders render while data loads
- Metric values stream first, charts stream second
- Page metadata streams with the shell

```tsx
// Root layout has immediate shell
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Performance Budgets

| Asset | Budget | Enforcement |
|---|---|---|
| Initial JS (gzip) | <120KB | `next/bundle-analyzer` |
| Total JS (gzip) | <400KB | CI threshold |
| CSS (gzip) | <30KB | PurgeCSS + Tailwind |
| Fonts (self-hosted) | <50KB | Subset + woff2 |
| Images | <200KB per page | next/image optimization |
| API response (p95) | <200ms | CI latency check |
