# Developer Guide

## Getting Started

```typescript
import { glService } from "@/server/gl";

// Get all accounts
const accounts = glService.chartOfAccounts.getAllAccounts();

// Create a journal
const journal = glService.journals.createJournal({...});

// Post a batch
const batch = glService.posting.postBatch("batch-id", "user-id");
```

## Architecture

The GL module follows the same patterns as Tax, O2C, and other enterprise modules:
- In-memory Map stores
- Facade over domain services
- Deterministic seed data
- Provider-agnostic

## Adding New Features

1. Add types to `types/index.ts`
2. Create/add domain service methods
3. Add facade method in `services/gl-service.ts`
4. Update seed data in `gl-seed.ts`
5. Create UI components
6. Add page routes
7. Register in navigation

## AI Extensions

The GL module is AI-ready with metadata for:
- Journal anomaly detection
- Posting recommendations
- Duplicate journal detection
- Auto account suggestion
- Close readiness prediction
- Financial statement explanation
- Expense anomaly detection
