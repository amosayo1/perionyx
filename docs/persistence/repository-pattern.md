# Repository Pattern

## Intent

Provide a collection-like interface for accessing domain objects while hiding storage details.

## Implementation

The Perionyx persistence layer implements the Repository pattern at three levels:

### 1. Interface Level (`IRepository<T, TId>`)

Pure TypeScript interface with no implementation details. Application code depends on this interface only.

### 2. Base Class Level (`BaseRepository<T, TId>`)

Abstract class providing shared error handling and validation utilities.

### 3. Generic Implementation (`GenericRepository<T, TId>`)

Concrete class that delegates to a pluggable `RepositoryAdapter`. This is the only production implementation and works with any backend.

## Usage

```typescript
// Application code only depends on IRepository
class UserService {
  constructor(private readonly userRepo: IRepository<User>) {}

  async getUser(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }
}
```

## Benefits

- **Testability** — Repositories can be mocked or swapped for in-memory during tests
- **Provider Independence** — Switch from memory to postgres without changing business logic
- **Consistent API** — Every entity type uses the same interface
- **Centralized Concerns** — Cross-cutting concerns (caching, logging, retry) can be applied at the repository level

## Provider Switching

```typescript
// Development
RepositoryFactory.configure({ provider: "memory" });

// Production (when implemented)
RepositoryFactory.configure({ provider: "postgres", connection: { ... } });

// Application code remains unchanged
const repo = RepositoryFactory.create<User>("users");
```
