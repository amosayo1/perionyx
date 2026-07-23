# React Performance Optimization

**Applies to**: Perionyx Enterprise Finance Platform v1.0  
**Category**: Component rendering, hydration, error handling

---

## 1. Component Architecture

Three-tier component hierarchy optimized for minimal re-render scope:

```
Page (Server Component, async)
  └── Layout Wrappers (Server Component)
       └── Section / Feature (Client boundary)
            ├── Container (state management)
            │    └── Presentational components (pure, memoized)
            └── Interactive children (useCallback callbacks)
```

### Rule of thumb:
- **Server components** as default for all pages and layouts
- **Client boundaries** at the lowest possible level — never wrap the page
- **Presentational components** are pure functions or `React.memo`

---

## 2. Component Splitting

Large components are split by responsibility:

```tsx
// Before — single monolithic AnalyticsDashboard
function AnalyticsDashboard() { /* 400 lines, 12 data dependencies */ }

// After — separated concerns
function AnalyticsDashboard() {
  return (
    <section>
      <KpiRow />           // Exec summary metrics
      <ChartsGrid />       // Chart orchestration
      <InsightPanel />     // AI-driven insights
      <DrillDownPanel />   // Interactive drill-down
    </section>
  );
}
```

Each sub-component has narrow data dependencies, reducing re-render scope.

---

## 3. Pure Components

Components that render the same output for the same props:

```tsx
export const MetricCard = React.memo(function MetricCard({
  label, value, trend, variant
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="label">{label}</span>
      <AnimatedMetric value={value} />
      <TrendArrow trend={trend} />
    </div>
  );
});
```

**Memoization decision table:**

| Component Type | Memoize? | Reason |
|---|---|---|
| Presentational with stable props | Always | Prevents unnecessary re-renders |
| Container with changing state | Seldom | Children are memoized |
| Page-level sections | Yes | Parent navigation re-renders |
| Form fields | Yes | 20+ fields, each independent |
| Table cells | Yes | 1000+ rows, 50+ columns |
| Chart elements | Yes | SVG paths, avoid recomputation |

---

## 4. Memoization Strategy

### useMemo — expensive computations

```tsx
// Filter pipeline — O(n*m) with 50k rows × 8 filters
const filteredRows = useMemo(
  () => rows.filter(r => matchesAll(r, activeFilters)),
  [rows, activeFilters]
);

// Aggregation — O(n) with 20k ledger entries
const { totalCredits, totalDebits } = useMemo(
  () => computeTotals(filteredRows),
  [filteredRows]
);
```

### useCallback — stable function references

```tsx
// Stable callback prevents child re-render
const handleSort = useCallback((col: string, dir: SortDir) => {
  dispatch({ type: 'SORT', column: col, direction: dir });
}, []); // dispatch is stable from useReducer

// Inline handlers — acceptable for event handlers on intrinsic elements
<button onClick={() => setOpen(true)} />
```

---

## 5. Re-Render Prevention

### Key patterns:

1. **State colocation** — state lives in the nearest common ancestor, not the root
2. **Component composition** — pass children, not render props
3. **Context splitting** — separate contexts for data vs. actions

```tsx
// Bad — whole tree re-renders on theme change
<ThemeContext.Provider value={{ theme, setTheme }}>
  <ExpensiveTable />   // Re-renders on every theme toggle
</ThemeContext.Provider>

// Good — split contexts
<ThemeContext.Provider value={theme}>
  <ThemeActionsContext.Provider value={setTheme}>
    <ExpensiveTable />  // Stable
  </ThemeActionsContext.Provider>
</ThemeContext.Provider>
```

---

## 6. Suspense Usage

Three levels of Suspense provide progressive loading:

```tsx
// Level 1 — Page shell (loading.tsx)
<Suspense fallback={<PageSkeleton />}>
  <PageContent />
</Suspense>

// Level 2 — Section wrappers
<Suspense fallback={<SectionSkeleton />}>
  <AnalyticsSection />
</Suspense>

// Level 3 — Individual data-dependent components
<Suspense fallback={<MetricSkeleton />}>
  <MetricCard metric={metric} />
</Suspense>
```

Streaming SSR sends the shell immediately, then streams each Suspense boundary as data resolves.

---

## 7. Error Boundary Patterns

```tsx
class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    recordClientError(error, errorInfo); // Audit log
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}
```

**Where error boundaries are placed:**
- Per-section: every top-level section (Analytics, Treasury, Approvals)
- Per-widget: `DataTable`, `ChartCard`, `MetricCard`
- Per-form: `EnterpriseForm` wrapper
- Per-page: global error boundary via `error.tsx`

---

## 8. Hydration Optimization

```tsx
// Server components render static HTML — no hydration cost
async function TreasuryOverview() {
  const data = await getTreasuryData();
  return <StaticTreasuryDisplay data={data} />;
}

// Client boundary at interactive leaf only
'use client';
function ApprovalButton({ id }: { id: string }) {
  return <button onClick={() => approve(id)}>Approve</button>;
}
```

**Hydration budget:** <50 KB of interactive JS per page

---

## 9. Progressive Enhancement

Forms and interactive elements work without full JS:

```tsx
// Server action — works without JS
<form action={handleApprove}>
  <input type="hidden" name="id" value={id} />
  <button type="submit">Approve</button>
</form>

// Client enhancement — progressive
'use client';
function EnhancedApprovalButton({ id }: { id: string }) {
  const [optimistic, addOptimistic] = useOptimistic(false);
  return (
    <button
      onClick={async () => {
        addOptimistic(true);
        await approve(id);
      }}
      className={optimistic ? 'processing' : ''}
    >
      Approve
    </button>
  );
}
```
