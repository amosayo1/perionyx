# Search Platform

**Platform**: SearchPlatform
**Contract**: `SearchContract`
**Mission**: Provide enterprise-wide search capabilities — keyword, semantic, entity-based, and relationship-based — across all platform data sources, with permission-aware filtering, relevance ranking, and full audit trail.
**Status**: Partially Built
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Enterprise Search** — Unified search across 22+ data source types (treasury, payments, invoices, vendors, customers, workflows, approvals, policies, rules, risk, compliance, reports, audit logs, notifications, automation, users, organization, knowledge base, documents).
2. **Semantic Query Parsing** — Parse natural language queries into structured filters, detect intent (LIST, FIND, COUNT, COMPARE), and identify target data sources.
3. **Relevance Ranking** — TF-IDF scoring with field weighting (title 3x, tags 2.5x, description 2x, content 1x), source-type weighting, recency boost, business importance multiplier, and pinned result promotion.
4. **Permission Filtering** — Filter search results based on user permissions using IAM `can()` function. Documents requiring unauthorized permissions are excluded.
5. **Knowledge Indexing** — Index all platform data into an in-memory search index with incremental updates and full reindex capability.
6. **Search Suggestions** — Provide typeahead suggestions based on prefix matching, recent searches, saved searches, and entity resolution.
7. **Recent Searches** — Track and surface recent search queries per user.
8. **Saved Searches** — Allow users to save, name, and manage frequently used search queries.
9. **Search Analytics** — Track query patterns, result counts, latency, click-through, and zero-result queries for UX improvement.
10. **Search Audit Trail** — Record every search action (search, suggest, view result, save, delete, reindex) for compliance.

---

## Public API (Capability Contract)

```typescript
interface SearchContract {
  // ── Core Search ─────────────────────────────────────────────
  search(query: SearchQuery, userPermissions: Set<string>): Promise<SearchResult[]>;
  suggest(prefix: string, companyId: string, userId: string): Promise<SearchSuggestion[]>;

  // ── Specialized Search ──────────────────────────────────────
  searchByEntity(entityType: string, entityId: string, companyId: string, userId: string, permissions: Set<string>): Promise<SearchResult[]>;
  searchByRelationship(queryText: string, companyId: string, userId: string, permissions: Set<string>): Promise<SearchResult[]>;

  // ── Recent & Saved ──────────────────────────────────────────
  getRecentSearches(userId: string, companyId: string, limit?: number): Promise<RecentSearchEntry[]>;
  clearRecentSearches(userId: string, companyId: string): void;
  saveSearch(userId: string, companyId: string, name: string, query: string, filters?: SearchFilter[]): SavedSearch;
  deleteSavedSearch(userId: string, companyId: string, searchId: string): boolean;
  getSavedSearches(userId: string, companyId: string): SavedSearch[];

  // ── Index Management ────────────────────────────────────────
  reindex(companyId: string): Promise<IndexResult>;
  reindexSource(companyId: string, source: SearchSourceType): Promise<IndexProgress>;
  getStats(): SearchIndexStats;
  getDocumentCount(): number;
  warmCache(companyId: string): Promise<void>;

  // ── Analytics & Audit ──────────────────────────────────────
  getAnalytics(): SearchAnalyticsStats;
  getAuditLog(companyId: string, limit?: number): SearchAuditEntry[];
}
```

### Key Types

```typescript
type SearchMode = "KEYWORD" | "NATURAL_LANGUAGE" | "ENTITY" | "RELATIONSHIP" | "GLOBAL" | "RECENT" | "SAVED" | "ADVANCED";

type SearchSourceType = "TREASURY" | "PAYMENT" | "INVOICE" | "VENDOR" | "CUSTOMER" | "WORKFLOW" | "WORKFLOW_INSTANCE" | "APPROVAL" | "POLICY" | "BUSINESS_RULE" | "RISK" | "COMPLIANCE" | "REPORT" | "DASHBOARD" | "AUDIT_LOG" | "NOTIFICATION" | "AUTOMATION_STUDIO" | "USER" | "ORGANIZATION" | "CUSTOMER_DISCOVERY" | "KNOWLEDGE_BASE" | "DOCUMENT";

interface SearchQuery {
  query: string;
  mode: SearchMode;
  filters?: SearchFilter[];
  companyId: string;
  userId: string;
  limit: number;
  offset: number;
  sortBy?: "relevance" | "date" | "title" | "source";
}

interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights: SearchHighlight[];
  explanation: string;
}

interface SearchDocument {
  id: string;
  sourceType: SearchSourceType;
  title: string;
  description: string;
  content: string;
  entityId: string;
  entityType: string;
  companyId: string;
  tags: string[];
  metadata: Record<string, unknown>;
  requiredPermissions: string[];
  pinned: boolean;
  businessImportance: number;
  createdAt: string;
  updatedAt: string;
  score: number;
}

interface SearchSuggestion {
  text: string;
  type: "query" | "entity" | "recent" | "saved";
  score: number;
  sourceType?: SearchSourceType;
}

interface SearchFilter {
  field: string;
  operator: "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "contains";
  value: unknown;
}
```

---

## Internal API

```typescript
interface SearchInternalApi {
  // Called by knowledge-indexer for document management
  addDocument(doc: SearchDocument): void;
  removeDocument(docId: string): void;
  getDocumentsBySource(source: SearchSourceType): SearchDocument[];
  searchInternal(query: string, filters?: SearchFilter[]): SearchDocument[];

  // Called by entity resolver
  resolveEntity(entityType: string, entityId: string, companyId: string): SearchDocument | null;

  // Called by modules for index updates
  indexDocument(companyId: string, source: SearchSourceType, entityId: string, data: Partial<SearchDocument>): void;
  removeByEntity(companyId: string, entityType: string, entityId: string): void;

  // Search permission bridge
  filterByPermissions(documents: SearchDocument[], userPermissions: Set<string>): SearchDocument[];
}
```

---

## Events

```typescript
interface SearchPlatformEvents {
  "search.executed": {
    query: string; mode: string; companyId: string; userId: string;
    resultCount: number; latencyMs: number;
  };
  "search.suggestion.generated": {
    prefix: string; companyId: string; suggestionCount: number;
    latencyMs: number;
  };
  "search.result.clicked": {
    companyId: string; userId: string; resultId: string;
    sourceType: string; rank: number;
  };
  "search.zero_results": {
    query: string; companyId: string; userId: string;
    mode: string;
  };
  "search.reindexed": {
    companyId: string; totalDocuments: number; durationMs: number;
    sourcesIndexed: number;
  };
  "search.saved": {
    companyId: string; userId: string; searchId: string;
    name: string; query: string;
  };
  "search.audit.recorded": {
    companyId: string; action: string; query: string;
    userId: string; resultCount: number; latencyMs: number;
  };
}
```

---

## Commands

| Command | Description | Auth | Audit |
|---|---|---|---|
| `ExecuteSearch` | Run a search query | `search.query` | Yes |
| `ReindexAll` | Full index rebuild | `search.admin` | Yes |
| `ReindexSource` | Reindex one source type | `search.admin` | Yes |
| `SaveSearch` | Save a search query | `search.save` | Yes |
| `DeleteSavedSearch` | Delete a saved search | `search.save` | Yes |
| `ClearRecentSearches` | Clear search history | `search.manage` | Yes |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `Search` | Full-text search | `search.query` |
| `Suggest` | Typeahead suggestions | `search.query` |
| `GetRecentSearches` | User's recent searches | `search.query` |
| `GetSavedSearches` | User's saved searches | `search.query` |
| `GetSearchStats` | Index statistics | `search.admin` |
| `GetSearchAnalytics` | Query analytics | `search.admin` |
| `GetSearchAuditLog` | Search audit trail | `search.admin` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `SEARCH_INDEX_EMPTY` | No documents indexed | 200 | No (empty results) |
| `SEARCH_QUERY_INVALID` | Malformed query | 400 | No |
| `SEARCH_INDEX_FULL` | Index capacity exceeded | 507 | No |
| `SEARCH_REINDEX_IN_PROGRESS` | Reindex already running | 409 | No |
| `SEARCH_SOURCE_NOT_FOUND` | Unknown source type | 404 | No |

---

## Security Model

- **Permission-Aware Results** (`SearchPermissionFilter`): Every search result is filtered against the user's permissions using IAM `can()`. Documents with `requiredPermissions` are only returned if the user holds at least one required permission.
- **Tenant Isolation**: All search queries are scoped to `companyId`. Index is partitioned by company.
- **Audit Trail**: Every search action is logged with query text, result count, latency, user, and company.
- **No Sensitive Data in Index**: Document content in the index does not contain raw credentials, API keys, or PII beyond what is necessary for search.
- **Query Sanitization**: Search queries are sanitized before indexing to prevent injection attacks.

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `search.query` | Company | Execute searches and view suggestions |
| `search.save` | Company | Save and delete saved searches |
| `search.manage` | Company | Clear search history |
| `search.admin` | Platform | Reindex, view analytics, audit log |

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `search.queries.total` | Counter | `mode`, `source` | Total search queries |
| `search.queries.latency_ms` | Histogram | `mode` | Search query latency |
| `search.queries.results` | Histogram | `mode` | Result count distribution |
| `search.queries.zero_results` | Counter | `mode` | Zero-result queries |
| `search.suggestions.total` | Counter | — | Suggestion requests |
| `search.suggestions.latency_ms` | Histogram | — | Suggestion latency |
| `search.index.documents` | Gauge | `source` | Document count by source |
| `search.index.total_tokens` | Gauge | — | Total tokens in index |
| `search.index.reindex_total` | Counter | — | Full reindex operations |
| `search.index.reindex_duration_ms` | Histogram | — | Reindex duration |
| `search.audits.total` | Counter | `action` | Audit trail entries |
| `search.saved.total` | Counter | — | Saved searches created |
| `search.clicks.total` | Counter | `source_type`, `rank` | Result clicks |

### Tracing

Search operations emit spans: `search.execute`, `search.suggest`, `search.reindex`, `search.index_document`. Span attributes: `search.query`, `search.mode`, `search.result_count`, `search.latency_ms`, `company_id`.

### Logging

Structured logs for: search execution (query, mode, result count, latency), reindex operations (duration, documents indexed, errors), zero-result queries (for UX improvement). All logs include correlation ID and tenant context.

---

## Rate Limiting

| Operation | Limit | Window | Scope |
|---|---|---|---|
| Search | 200/hr | Sliding | Per user |
| Suggest | 500/hr | Sliding | Per user |
| Reindex (full) | 1/hr | Fixed | Per company |
| Reindex (source) | 10/hr | Sliding | Per company |
| Save search | 50/hr | Sliding | Per user |

---

## Retry Policy

| Operation | Max Retries | Backoff | Retryable |
|---|---|---|---|
| Index document | 1 | Fixed 100ms | Concurrent write conflict |
| Full reindex | 1 | Fixed 5s | Partial failure |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Index operations | 10 failures / 60s | 60s | Read-only mode |

---

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Search suggestions | 30s | Per prefix+company | On reindex |
| Recent searches | 5min | Per user+company | On new search |
| Index stats | 60s | Global | On index change |
| Analytics stats | 60s | Global | On new event |

---

## Versioning

| Aspect | Strategy |
|---|---|
| API versioning | URL path prefix |
| Index schema | Additive changes only; full reindex on breaking change |
| Ranking algorithm | Versioned; A/B testing supported |
| Source types | Additive; deprecated types get 90-day grace |

---

## Lifecycle

```
Initialization → warmCache() → index all sources (if empty)
                    ↓
Search → parse semantic query → index search → permission filter → rank → paginate → record
                    ↓
Suggest → prefix match → entity match → recent match → saved match → rank → return
                    ↓
Reindex → clear index → index each source sequentially → record stats
                    ↓
Cleanup → archive old analytics → expire old recent searches
```

---

## Extension Model

- **New Source Types**: Add to `SearchSourceType` union and register indexer function in `KnowledgeIndexer.getIndexer()`.
- **Custom Ranking Rules**: Extend `SearchRankingEngine` with custom scoring factors.
- **Custom Suggesters**: Register new suggestion providers via `SearchSuggestionEngine.registerProvider()`.
- **Permission Filters**: Custom permission logic via `SearchPermissionFilter` extension.
- **Index Transformers**: Post-processing hooks for document transformation before indexing.

---

## Provider Model

The Search Platform uses an in-memory index. No external search service (Elasticsearch, Solr, Algolia) is currently used.

| Component | Implementation | Future |
|---|---|---|
| Index | In-memory Map + inverted index (`search-index-manager.ts`) | Elasticsearch |
| Ranking | Custom TF-IDF engine (`search-ranking-engine.ts`) | ML reranking |
| Semantic | Regex-based intent detection (`semantic-search-service.ts`) | NLP model |
| Entity Resolution | Direct Prisma lookup (`entity-resolver.ts`) | Graph-based |
| Knowledge Indexing | Per-source Prisma queries (`knowledge-indexer.ts`) | CDC streaming |

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | Ranking scoring, semantic parsing, permission filtering | 90% |
| Integration tests | Full search → result pipeline | 85% |
| Contract tests | `SearchContract` API compliance | 100% |
| Performance tests | Search latency <100ms, reindex <60s for 10K docs | Baseline |
| Accuracy tests | Ranking quality, suggestion relevance | Manual review |
| Security tests | Permission filter bypass, tenant isolation | 100% |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Index empty | No search results | `warmCache()` auto-reindexes |
| Index corruption | Incorrect results | Full reindex on integrity check failure |
| Concurrent write | Document lost | Optimistic write with retry |
| Reindex timeout | Stale index | Previous index retained; retry |
| Suggestion engine slow | UI lag | Timeout + fallback to recent searches |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Index data loss | Full reindex from Prisma (non-critical; index is derived data) |
| Ranking degradation | A/B test rollback; manual ranking override |
| Search audit gap | Reconstruct from Prisma audit logs |
| Permission filter bug | Hotfix + full reindex |
| Zero-result spike | Query analysis → index gap identification → targeted reindex |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/search/enterprise-search-engine.ts` | Facade — search, suggest, reindex |
| `src/server/search/types.ts` | 191 lines — all search types, source types, weights |
| `src/server/search/search-index-manager.ts` | In-memory index management |
| `src/server/search/search-ranking-engine.ts` | TF-IDF ranking with field weights |
| `src/server/search/search-permission-filter.ts` | IAM-based permission filtering |
| `src/server/search/search-suggestion-engine.ts` | Typeahead suggestions |
| `src/server/search/semantic-search-service.ts` | Intent detection and filter extraction |
| `src/server/search/entity-resolver.ts` | Entity-based search resolution |
| `src/server/search/knowledge-indexer.ts` | 550 lines — 20+ source indexers |
| `src/server/search/recent-search-service.ts` | Recent/saved search management |
| `src/server/search/search-analytics.ts` | Query analytics tracking |
| `src/server/search/search-audit-service.ts` | Search audit trail |
| `src/server/search/index.ts` | Barrel export |

---

*The Search Platform connects users to information across the entire Perionyx platform, ensuring every query is fast, relevant, and permission-aware.*
