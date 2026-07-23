# Operations Guide

## Initialization

The EPIP must be initialized once at application startup:

```typescript
import { EnterpriseProductIntelligenceService } from "@/server/product-intelligence";
import { importInitialData } from "@/server/product-intelligence/initial-import";

const epip = new EnterpriseProductIntelligenceService();
importInitialData(epip);

// Export singleton for use across the application
export { epip };
```

## Storage Persistence

Currently, all data is stored in-memory. For production deployment:

1. Implement `ProductIntelligenceRepository` with Prisma backing
2. Create Prisma schema for all entity types
3. Swap the repository in the service constructor
4. No other code changes required

## Data Backup

In-memory data is lost on process restart. For persistence:
- Export to JSON: `JSON.stringify([...repo.getAllPersons()])`
- Or implement the Prisma-backed repository

## Monitoring

Key metrics to monitor:
- Total records per entity type
- Memory usage (8MB baseline for current data)
- Search latency
- Analytics computation time

## Scaling

At scale, consider:
1. Prisma/Postgres backend
2. Full-text search index (MeiliSearch, Typesense, or Postgres FTS)
3. Pre-computed analytics with cache invalidation
4. Pagination on all list endpoints

## Adding Import Scripts

For batch imports from external sources (CSV, CRM export, etc.):
1. Create a new file `import-{source}.ts` in `src/server/product-intelligence/`
2. Use the `EnterpriseProductIntelligenceService` API
3. Call the import function during initialization
