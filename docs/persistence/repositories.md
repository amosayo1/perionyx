# Repositories

## Overview

The Repository pattern provides a clean abstraction over data access. Every entity type has its own repository that exposes CRUD operations, query capabilities, and batch operations through a consistent interface.

## IRepository<T, TId>

The core interface defines 20 methods across several categories:

### CRUD Operations

| Method | Description |
|---|---|
| `create(data)` | Create a single entity |
| `createMany(data[])` | Bulk create |
| `update(id, data)` | Update by ID |
| `updateMany(filter, data)` | Bulk update |
| `delete(id)` | Delete by ID |
| `deleteMany(filter)` | Bulk delete |

### Soft Delete

| Method | Description |
|---|---|
| `softDelete(id)` | Mark as deleted without removing |
| `restore(id)` | Restore a soft-deleted entity |

### Query Operations

| Method | Description |
|---|---|
| `findById(id)` | Find by primary key |
| `findOne(filter)` | Find first match |
| `findMany(filter, sort, pagination, projection)` | Find multiple |
| `exists(filter)` | Check existence |
| `count(filter)` | Count matches |
| `paginate(pagination, filter, sort, projection)` | Paginated list |
| `query(filter, sort, pagination, projection)` | Query with pagination |
| `aggregate(query)` | Grouped aggregations |
| `search(query)` | Full-text search |

### Batch Operations

| Method | Description |
|---|---|
| `batchInsert(data[], batchSize)` | Batch insert with chunking |
| `batchUpdate(updates[], batchSize)` | Batch update with chunking |
| `batchDelete(ids[], batchSize)` | Batch delete with chunking |

## BaseRepository<T, TId>

Abstract base class implementing `IRepository` with:
- Type-safe helper methods (`throwIfNotFound`, `throwIfDuplicate`)
- Consistent error handling via `RepositoryError`

## GenericRepository<T, TId>

Concrete implementation that delegates all operations to a `RepositoryAdapter`. This is the primary way repositories are created.

```typescript
const repo = new GenericRepository<User>("users", adapter);
```

## RepositoryAdapter<T, TId>

The adapter interface that concrete implementations (memory, postgres, etc.) must satisfy. Each adapter implements the same 20 methods against its specific backend.
