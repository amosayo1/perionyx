# ADR-019: Performance Strategy

**Status**: Draft  
**Date**: January 2025  
**Author**: Architecture Team  

## Context

As the platform grows in features and users, performance must be maintained. Financial dashboards, large transaction histories, and real-time data require efficient data access and rendering.

## Decision

Adopt the following performance strategy:

### Database
- **Index all query patterns**: Every WHERE, ORDER BY, and JOIN field used in queries must be indexed
- **Cursor-based pagination**: For large datasets, cursor pagination is preferred over offset
- **Select only needed fields**: No `SELECT *` in production queries
- **Connection pooling**: Prisma client uses a connection pool configured for the deployment

### Rendering
- **Server Components**: Default for data-heavy pages (reduces client JS)
- **Skeleton loading**: Preferred over spinners for content areas
- **Independent widget loading**: Dashboard widgets load independently (no waterfall)
- **Virtual scrolling**: For large tables (10k+ rows)

### Background Processing
- **PgBoss**: Long-running operations use background jobs
- **Use cases**: Exports, reconciliations, connector runs, report generation

### Caching (Planned)
- Redis for frequent queries (dashboard stats, recent transactions)
- Response caching for idempotent GET endpoints

## Consequences

- **Positive**: Consistent performance as data grows
- **Positive**: Background jobs prevent request timeout for long operations
- **Positive**: Server Components minimize client-side JavaScript
- **Negative**: Index management requires ongoing attention
- **Negative**: Caching adds invalidation complexity
- **Negative**: Virtual scrolling adds implementation complexity

## Alternatives Considered

1. **No caching (always fresh)**: Rejected — unnecessary database load
2. **Full client-side rendering**: Rejected — poor initial load performance
3. **GraphQL for flexible queries**: Considered but deferred — overengineering for current requirements
