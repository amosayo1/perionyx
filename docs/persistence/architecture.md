# Persistence Architecture

## Overview

The Persistence module provides a provider-agnostic data access layer for the Perionyx Enterprise platform. It is designed to support multiple database backends through a common interface while keeping all application code completely unaware of which implementation is in use.

## Principles

1. **Provider Agnosticism** — No application code imports database-specific types. All access is through `IRepository<T>`.
2. **No ORM Dependencies** — Zero database drivers, zero ORM libraries. Abstraction-only architecture.
3. **Separation of Concerns** — Repository, Unit of Work, Transaction, Migration, and Diagnostics are independent subsystems.
4. **Registry Pattern** — Repositories are resolved through a central registry, never imported directly.
5. **Factory Pattern** — The `RepositoryFactory` creates the correct adapter based on configuration alone.

## Module Structure

```
persistence/
├── domain/           # Pure interfaces and types
│   ├── persistence-types.ts
│   ├── persistence-errors.ts
│   ├── repository.ts
│   ├── transaction.ts
│   ├── pagination.ts
│   ├── filters.ts
│   └── sorting.ts
├── repositories/     # Base implementations
│   ├── base-repository.ts
│   └── generic-repository.ts
├── adapters/         # Provider-specific implementations
│   ├── memory/       # In-memory (development/testing)
│   ├── postgres/     # PostgreSQL (stub)
│   ├── mysql/        # MySQL (stub)
│   └── sqlite/       # SQLite (stub)
├── registry/         # Registry and factory
│   ├── repository-registry.ts
│   └── repository-factory.ts
├── unit-of-work/     # Transaction management
│   ├── unit-of-work.ts
│   └── transaction-manager.ts
├── migrations/       # Migration framework
│   ├── migration.ts
│   ├── migration-engine.ts
│   ├── migration-history.ts
│   └── migration-runner.ts
├── versioning/       # Schema version management
│   ├── schema-version.ts
│   └── compatibility.ts
├── health/           # Persistence health monitoring
│   └── persistence-health.ts
├── diagnostics/      # Diagnostics and reporting
│   └── persistence-diagnostics.ts
└── index.ts          # Barrel exports
```

## Layer Diagram

```
Application Code
       │
       ▼
  IRepository<T>         (domain/repository.ts)
       │
       ▼
  GenericRepository      (repositories/generic-repository.ts)
       │
       ▼
  RepositoryAdapter      (adapter interface)
       │
       ├── MemoryRepositoryAdapter     (in-memory)
       ├── PostgresRepositoryAdapter   (stub)
       ├── MySQLRepositoryAdapter      (stub)
       └── SQLiteRepositoryAdapter     (stub)
```

## Configuration

The persistence provider is configured at application startup through `RepositoryFactory.configure()`:

```typescript
RepositoryFactory.configure({ provider: "memory" });
```

No application code needs to change when switching providers — only this single configuration call.

## Current State

| Provider | Status | Use Case |
|---|---|---|
| memory | ✅ Complete | Development, testing, demos |
| postgres | 🔜 Stub | Production deployment pending |
| mysql | 🔜 Stub | Production deployment pending |
| sqlite | 🔜 Stub | Lightweight/embedded deployment |
