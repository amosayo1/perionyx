# Multi-Tier Caching Strategy

**Applies to**: Perionyx Enterprise Finance Platform v1.0  
**Category**: Cache architecture, TTL tiers, invalidation

---

## 1. Cache Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
│  SWR Cache / HTTP Cache (Cache-Control headers)      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Next.js Server (Node.js)                │
│                                                      │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐   │
│  │ LRU       │  │ Redis       │  │ Postgres       │   │
│  │ (In-mem)  │  │ (Dist.)     │  │ (Source of     │   │
│  │ TTL: 5-60s│  │ TTL: 30-   │  │  Truth)        │   │
│  └──────────┘  │  600s       │  └────────────────┘   │
│                └────────────┘                        │
└─────────────────────────────────────────────────────┘
```

---

## 2. In-Memory LRU Cache

Used for hot, frequently-accessed data with short TTL:

```tsx
import { CacheManager } from '@/server/cache';

const metricsCache = new CacheManager({
  maxSize: 1000,       // Max entries
  ttl: 5_000,          // 5 seconds
  tier: 'memory',
});

// Usage
const getMetrics = async (): Promise<DashboardMetrics> => {
  const cached = metricsCache.get<DashboardMetrics>('metrics');
  if (cached) return cached;

  const metrics = await computeDashboardMetrics();
  metricsCache.set('metrics', metrics);
  return metrics;
};
```

**TTL tiers (in-memory):**

| Data | TTL | Max Entries |
|---|---|---|
| Dashboard metrics | 5s | 50 |
| Approval queue count | 5s | 50 |
| Treasury snapshot | 10s | 100 |
| Alert summaries | 10s | 100 |
| User preferences | 60s | 200 |
| Recent searches | 120s | 500 |

---

## 3. Redis Cache Tier

Used for shared, cross-instance, and long-lived cache entries:

```tsx
const redisCache = new CacheManager({
  tier: 'redis',
  ttl: 60_000,          // 60 seconds default
  gracefulDegradation: true, // Falls back to in-memory on Redis failure
});
```

**TTL tiers (Redis):**

| Data | TTL | Purpose |
|---|---|---|
| Entity data (tenants, orgs) | 300s | Rarely changes |
| User sessions | 600s | Cross-instance |
| Rate limit counters | 60s | Distributed rate limiting |
| Dashboard metrics | 30s | Cross-instance consistency |
| Configuration | 300s | Tenant configs |

---

## 4. Query Result Caching

API route handlers apply `cacheHeaders()` for GET endpoints:

```tsx
// 15-second cache for dashboard data
export async function GET(request: Request) {
  const data = await getDashboardMetrics(request);
  return Response.json(data, {
    headers: cacheHeaders(15),
  });
}
```

**Cache-Control header strategy:**

| Endpoint Type | `max-age` | `stale-while-revalidate` | Example |
|---|---|---|---|
| Static dashboard | 60s | 300s | Executive KPIs |
| Treasury metrics | 15s | 60s | Cash position |
| Approval queue | 5s | 30s | Pending approvals |
| Analytics | 120s | 600s | Historical charts |
| Entity metadata | 300s | 3600s | Account names |

---

## 5. Dashboard Caching

```tsx
// Component-level caching with stale-while-revalidate
const [metrics, setMetrics] = useState(cachedMetrics);
const [isStale, setIsStale] = useState(false);

useEffect(() => {
  // Immediate revalidation
  refreshMetrics().then(fresh => {
    setMetrics(fresh);
    setIsStale(false);
  });

  // Background refresh every 30s
  const interval = setInterval(refreshMetrics, 30_000);
  return () => clearInterval(interval);
}, []);
```

**Dashboard data freshness labels:**
- "Updated 3s ago" — fresh data
- "Updated 45s ago" — stale-while-revalidate
- "Cached 2m ago" — stale data, show with warning indicator

---

## 6. Cache Invalidation

**Strategies:**
1. **Time-based (TTL):** Default invalidation for all entries
2. **Tag-based:** `cache.invalidateByTag('treasury:positions')`
3. **Pattern-based:** `cache.invalidateByPattern('dashboard:*')`
4. **Manual:** `cache.delete('key')` on mutation endpoints

```tsx
// On mutation — invalidate related caches
async function POST(request: Request) {
  const result = await createApprovalRule(request);
  await invalidateCaches(['approval:rules', 'governance:metrics']);
  return Response.json(result);
}
```

---

## 7. Stale-While-Revalidate (SWR)

```tsx
// HTTP-level SWR
cacheHeaders(15, {
  staleWhileRevalidate: 60, // Serve stale for 60s while revalidating
});

// Client-level SWR (useSWR from swr library)
const { data, isValidating } = useSWR('/api/treasury/snapshot', fetcher, {
  refreshInterval: 30_000,
  dedupingInterval: 5_000,
});
```

**Benefit:** Users see instant data (even if stale) while background revalidation fetches fresh data. No loading spinners for cache-hit requests.
