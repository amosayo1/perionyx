# Repository Layer

## Overview

The repository layer provides a clean separation between business logic and data access. Phase 7E.2 migrates the treasury domain from in-memory (Map-based) storage to PostgreSQL-backed Prisma models while preserving the exact repository interface contracts.

## Architecture

```
Business Logic (TreasuryService)
      │
      ▼
TreasuryRepository (interface — domain/repositories/treasury-repository.ts)
      │
      ├── InMemoryTreasuryRepository  (legacy, kept for testing)
      └── PrismaTreasuryRepository    (production — PostgreSQL via Prisma)
```

## Layer Separation

| Layer | Concern | Location |
|---|---|---|
| Domain Interface | Contract definition | `server/treasury/repositories/treasury-repository.ts` |
| Service Layer | Business logic, orchestration | `server/treasury/services/` |
| Repository (Memory) | Map-based storage | `server/treasury/repositories/treasury-repository.ts` |
| Repository (Prisma) | PostgreSQL persistence | `server/treasury/repositories/prisma-treasury-repository.ts` |
| Prisma Models | Database schema | `prisma/schema.prisma` |

## Repository Interface

Every repository operation goes through the `TreasuryRepository` interface:

```typescript
interface TreasuryRepository {
  saveCashPosition(position: CashPosition): Promise<void>;
  getCashPositions(companyId: string, legalEntityId?: string): Promise<CashPosition[]>;
  // ...16 entity types
}
```

## Provider Switching

The existing `treasuryService` imports `treasuryRepository` from the barrel:

```typescript
import { treasuryRepository } from "../repositories";
```

To switch from in-memory to Prisma, update the barrel export:

```typescript
// Current (in-memory)
export { InMemoryTreasuryRepository, treasuryRepository } from "./treasury-repository";

// Production (Prisma)
export { PrismaTreasuryRepository as treasuryRepository } from "./prisma-treasury-repository";
```

## Transactional Operations

Multi-step writes use `prisma.$transaction()` to ensure atomicity:

```typescript
const [movement, alert] = await prisma.$transaction([
  prisma.treasuryCashMovement.create({ data: movementData }),
  prisma.treasuryAlert.create({ data: alertData }),
]);
```

## Repository Registry

All repositories resolve through `RepositoryRegistry` from the persistence module, ensuring no direct imports between repository implementations.
