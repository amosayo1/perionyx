# Phase 8C.5 — Enterprise Semantic Search & Knowledge Engine

## Architecture

Enterprise Semantic Search is permission-aware, tenant-aware, context-aware, fast, auditable, and explainable. It uses an in-memory inverted index (no external dependencies) with a natural language query parser.

```
┌──────────────────────────────────────────────────────────────────┐
│                     EnterpriseSearchEngine                        │
│  (public facade — search, suggest, reindex, analytics, audit)    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │SearchIndexManager│  │SearchRanking    │  │SearchPermission│  │
│  │                 │  │Engine           │  │Filter          │  │
│  │inverted index  │  │TF-IDF scoring   │  │IAM can() check │  │
│  │Map<token,      │  │field weights    │  │on required     │  │
│  │ Set<docId>>    │  │source weights   │  │permissions     │  │
│  │field index     │  │recency boost    │  │                │  │
│  │source index    │  │importance boost │  │                │  │
│  └────────┬───────┘  └───────┬─────────┘  └───────┬────────┘  │
│           │                  │                     │            │
│  ┌────────┴──────────────────┴─────────────────────┴────────┐  │
│  │                    SemanticSearchService                   │  │
│  │  NL query parser: detect intent (LIST/FIND/COUNT/COMPARE) │  │
│  │  extract filters (status, type, amount), detect source    │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────────────┐  │
│  │                    KnowledgeIndexer                         │  │
│  │  20 search sources from Prisma:                            │  │
│  │  TreasuryAccount (50), Transaction (10K), Invoice (5K),   │  │
│  │  Vendor (500), Customer (500), WorkflowDef (500),         │  │
│  │  WorkflowInstance (10K), TransactionApproval (10K),       │  │
│  │  Policy (200), BusinessRuleDef (200), RiskAlert (5K),     │  │
│  │  PolicyViolation (5K), ReadinessReport (1K),              │  │
│  │  AuditLog (10K), Notification (5K), AutomationTemplate    │  │
│  │  (500), User (500), OrgUnit (100)                         │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────────────┐  │
│  │                    EntityResolver                          │  │
│  │  15 entity types → current Prisma state (label, status)   │  │
│  │  Batch resolution via findMany                             │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │                                        │
│  ┌────────────┐  ┌─────┴──────┐  ┌─────────────┐  ┌─────────┐ │
│  │SearchSug-  │  │RecentSearch│  │Search       │  │Search   │ │
│  │gestionEngine│  │Service    │  │Analytics    │  │Audit    │ │
│  │prefix auto-│  │recent (50) │  │popular qs   │  │Service  │ │
│  │complete    │  │saved CRUD  │  │latency, CTR │  │50K cap  │ │
│  └────────────┘  └────────────┘  └─────────────┘  └─────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Permission-aware** — every result filtered through IAM `can()` check
2. **Tenant-aware** — all data scoped to `companyId`
3. **Context-aware** — NL query parser detects intent, filters, source
4. **Fast** — in-memory inverted index (no network calls for search)
5. **Auditable** — every search, suggestion, view logged
6. **Explainable** — ranking engine returns explanation strings per result

## 22 Search Sources

| Source | Module | Default Count | Weights |
|---|---|---|---|
| treasury_accounts | Treasury | 50 | 1.0 |
| transactions | Treasury | 10,000 | 1.0 |
| accounting_invoices | Accounting | 5,000 | 0.9 |
| accounting_vendors | Accounting | 500 | 0.8 |
| accounting_customers | Accounting | 500 | 0.8 |
| workflow_definitions | Workflows | 500 | 1.0 |
| workflow_instances | Workflows | 10,000 | 0.9 |
| transaction_approvals | Approvals | 10,000 | 0.9 |
| policies | Governance | 200 | 0.9 |
| business_rule_definitions | Automation | 200 | 0.9 |
| risk_alerts | Risk | 5,000 | 1.0 |
| policy_violations | Compliance | 5,000 | 1.0 |
| readiness_reports | Intelligence | 1,000 | 0.8 |
| audit_logs | Audit | 10,000 | 0.8 |
| notifications | Notifications | 5,000 | 0.7 |
| automation_templates | Automation | 500 | 0.8 |
| company_memberships | Users | 500 | 0.7 |
| organization_units | Organization | 100 | 0.7 |
| dashboards | Intelligence | empty | 0.6 |
| knowledge_base | Intelligence | empty | 0.6 |
| documents | Documents | empty | 0.6 |
| user_recent_searches | Search | 50 | 0.4 |

## 8 Search Modes

| Mode | Behavior |
|---|---|
| default | Standard scored search |
| recent | Sort by recency (24h/7d/30d) |
| popular | Sort by view count |
| exact | Exact phrase match (quoted) |
| fuzzy | Broader matching |
| semantic | Intent-based (placeholder for embeddings) |
| aggregating | COUNT queries |
| command | (reserved) |

## Search Ranking Formula

```
score = tfidf * fieldWeight * sourceWeight * recencyBoost * importance * modeBoost
```

| Factor | Details |
|---|---|
| TF-IDF | Term frequency × inverse document frequency |
| Field weight | title: 3.0, tags: 2.5, description: 2.0, content: 1.0 |
| Source weight | 0.4–1.0 per source |
| Recency boost | 0.5–1.5 based on update timestamp |
| Importance | businessCriticality + regulatoryCriticality config |
| Mode boost | exact: 2.0, fuzzy: 0.8 |

## NL Query Examples

| Query | Intent | Filters |
|---|---|---|
| "Show me pending payments over $10k" | LIST | status=pending, amount>10000 |
| "Find invoices from Acme Corp" | FIND | vendor=Acme Corp |
| "How many high-risk alerts?" | COUNT | severity=high |
| "Compare this quarter vs last quarter" | COMPARE | date=quarter |
| "Recent approval activity" | LIST | source=approvals, sort=recent |

## Entity Resolution

15 entity types resolved to current Prisma state:

| Entity Type | Prisma Model | Batch Method |
|---|---|---|
| treasury_account | TreasuryAccount | findMany |
| transaction | Transaction | findMany |
| payment | Transaction (type=PAYMENT) | findMany |
| transfer | Transaction (type=TRANSFER) | findMany |
| invoice | AccountingInvoice | findMany |
| vendor | AccountingVendor | findMany |
| customer | AccountingCustomer | findMany |
| workflow | WorkflowDefinition | findMany |
| policy | Policy | findMany |
| risk_alert | RiskAlert | findMany |
| policy_violation | PolicyViolation | findMany |
| user | User | findMany |
| organization_unit | OrganizationUnit | findMany |
| approval | TransactionApproval | findMany |
| notification | Notification | findMany |

## Performance Characteristics

| Operation | Complexity | Target |
|---|---|---|
| Indexing (full) | O(N × tokens) | <5s for 50K docs |
| Search (single term) | O(log V + results) | <50ms |
| Search (multi-term) | O(k × log V + results) | <100ms |
| Suggestions (prefix) | O(log V + maxResults) | <20ms |
| Reindex (single doc) | O(tokens) | <5ms |

Current capacity: ~50,000 documents. At 100K+, swap to Redis-backed index or embed Meilisearch behind the same interface.

## Audit Trail

| Action | Description |
|---|---|
| SEARCH | Search query with filters |
| SUGGEST | Autocomplete suggestion |
| VIEW_RESULT | Clicked on a search result |
| SAVE_SEARCH | Saved a search query |
| DELETE_SEARCH | Deleted a saved search |
| REINDEX | Reindexed all data |

50,000-entry cap. Queries: per user, per company.

## Caching

| Cache | TTL | Scope |
|---|---|---|
| Index | ∞ (rebuild on reindex) | per instance |
| Suggestions | 60s | per query prefix |
| Recent searches | persisted in memory | per user |
| Saved searches | persisted in memory | per user |

## Scaling Plan

| Scale | Solution |
|---|---|
| 0–50K docs | In-memory inverted index (current) |
| 50K–500K docs | Redis-backed inverted index |
| 500K+ docs | Meilisearch or ElasticSearch behind same interface |

## File Reference

| File | Description |
|---|---|
| `src/server/search/types.ts` | 22 sources, 8 modes, 5 operators, weights |
| `src/server/search/enterprise-search-engine.ts` | Main facade |
| `src/server/search/search-index-manager.ts` | Inverted index CRUD |
| `src/server/search/search-ranking-engine.ts` | TF-IDF + multi-factor scoring |
| `src/server/search/semantic-search-service.ts` | NL query parser |
| `src/server/search/search-permission-filter.ts` | IAM permission filtering |
| `src/server/search/search-suggestion-engine.ts` | Prefix autocomplete |
| `src/server/search/recent-search-service.ts` | Recent + saved search CRUD |
| `src/server/search/search-analytics.ts` | Query analytics |
| `src/server/search/search-audit-service.ts` | 50K-cap audit trail |
| `src/server/search/entity-resolver.ts` | 15 entity type resolvers |
| `src/server/search/knowledge-indexer.ts` | 20-source Prisma indexer |
| `src/server/search/index.ts` | Barrel exports |
