# Rendering Optimization

**Applies to**: Perionyx Enterprise Finance Platform v1.0  
**Category**: Server components, streaming, hydration, code splitting

---

## 1. Server Components (Default)

All pages and layouts default to Server Components. Data fetching happens on the server, sending only the rendered HTML to the client.

```tsx
// Server Component — no client JS cost
async function TreasuryPage() {
  const positions = await getTreasuryPositions();
  return (
    <TreasuryList>
      {positions.map(p => (
        <TreasuryRow key={p.id} position={p} />
      ))}
    </TreasuryList>
  );
}

// Client boundary — only at interactive leaves
'use client';
function TreasuryRow({ position }: { position: TreasuryPosition }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div onClick={() => setExpanded(v => !v)}>
      {position.name}
      {expanded && <Details position={position} />}
    </div>
  );
}
```

**Server rendering rule:** Every component is a server component unless it needs:
- State (`useState`, `useReducer`)
- Effects (`useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser-only APIs
- Custom hooks that use the above

---

## 2. Client Component Boundaries

Minimize client boundary surface area:

```tsx
// Too large — entire page is client-rendered (worse)
'use client';
function Page() {
  // ... everything runs on client
}

// Optimal — server shell, client island (better)
async function Page() {
  const staticData = await getStaticData();
  return (
    <div>
      <StaticHeader data={staticData} />    // Server component
      <InteractiveSection />                // Client boundary below
    </div>
  );
}
```

**Current boundary count:** ~180 client components across 306 pages

---

## 3. Streaming SSR

Next.js streams server-rendered content progressively:

```
Time → ──────────────────────────────────────────────────
HTTP Response:
├── <html><body><nav>...  (immediate — no data waiting)
├── <div id="metrics">
│   ├── <Suspense>        (waits for metrics query)
│   │   └── Metric cards stream in after ~200ms
├── <div id="charts">
│   ├── <Suspense>        (waits for aggregation query)
│   │   └── Charts stream in after ~800ms
└── </body></html>
```

**Suspense boundary loading order:**
1. Layout shell (immediate)
2. Navigation + sidebar (immediate)
3. Header KPIs (150-300ms)
4. Dashboard metrics (200-500ms)
5. Charts + analytics (500-1200ms)
6. Deep data tables (800-2000ms)

---

## 4. Progressive Hydration

Hydration is sequential per Suspense boundary:

```tsx
// Chunk 1: Shell + navigation — hydrates first
// Chunk 2: Metrics section — hydrates second
// Chunk 3: Charts section — hydrates third
```

Each chunk is independently loadable, parsed, and hydrated. Page stays interactive between chunks.

---

## 5. Skeleton Loading

Every Suspense boundary has a matching skeleton:

| Component | Skeleton | Lines |
|---|---|---|
| `MetricCard` | `MetricSkeleton` | 4 lines, CSS shimmer |
| `DataTable` | `TableSkeleton` | 6 rows × 5 columns |
| `ChartCard` | `ChartSkeleton` | Rect + shimmer |
| `EnterpriseForm` | `FormSkeleton` | 8 field skeletons |
| `Page` | `PageSkeleton` | Layout-aware shimmer |
| `DrillDownPanel` | `SkeletonCard` | Stacked card shapes |

Skeletons use `framer-motion` shimmer animation with reduced-motion fallback:

```tsx
function MetricSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-charcoal-800 p-4">
      <div className="h-3 w-24 bg-charcoal-700 rounded" />
      <div className="mt-2 h-6 w-32 bg-charcoal-700 rounded" />
      <div className="mt-1 h-3 w-16 bg-charcoal-700 rounded" />
    </div>
  );
}
```

---

## 6. Code Splitting Boundaries

Split points are chosen based on:
1. **Component weight** — >5 KB gzip → dynamic import candidate
2. **Visibility frequency** — conditional UI (dialogs, panels)
3. **Interaction latency** — user-initiated reveals

```tsx
// Dialog — only loaded when triggered
const ApprovalDialog = dynamic(() => import('./ApprovalDialog'));

// Panel — only loaded when user expands section
const AuditTrail = dynamic(() => import('./AuditTrail'));

// Heavy analytics — only loaded on /analytics route
const ApprovalAnalytics = dynamic(() => import('./ApprovalAnalytics'));
```

---

## 7. RSC Payload Optimization

Server Component payloads are minimized by:
- No client JS for static content
- Streaming instead of blocking on all data
- Co-located data fetching in the component that needs it
- No passing large datasets across the server/client boundary unnecessarily
