# Unit of Work

## Overview

The Unit of Work pattern maintains a list of operations affected by a business transaction and coordinates the writing out of changes. It ensures atomicity — either all changes in a transaction are applied, or none are.

## IUnitOfWork

| Method | Description |
|---|---|
| `begin()` | Start a new transaction |
| `commit()` | Commit the current transaction |
| `rollback()` | Rollback the current transaction |
| `transaction(fn)` | Execute work within a transaction (auto commit/rollback) |
| `createSavepoint(name)` | Create a named savepoint |
| `releaseSavepoint(name)` | Release a savepoint |
| `rollbackToSavepoint(name)` | Rollback to a savepoint |
| `isActive()` | Check if transaction is active |
| `getCurrentTransaction()` | Get the current transaction |

## Usage

### Manual Transaction

```typescript
const uow = new UnitOfWork(transactionManager);

await uow.begin();
try {
  await userRepo.create({ name: "John" });
  await accountRepo.create({ userId: "john", balance: 1000 });
  await uow.commit();
} catch (error) {
  await uow.rollback();
}
```

### Automatic Transaction

```typescript
const result = await uow.transaction(async (tx) => {
  const user = await userRepo.create({ name: "John" });
  const account = await accountRepo.create({ userId: user.id, balance: 1000 });
  return { user, account };
});
```

### Savepoints

```typescript
await uow.begin();
try {
  await userRepo.create({ name: "John" });
  await uow.createSavepoint("after_user");
  await accountRepo.create({ userId: "john", balance: 1000 });
  await uow.commit();
} catch {
  await uow.rollbackToSavepoint("after_user");
  await uow.commit();
}
```

## Design Notes

- Nested `transaction()` calls are supported — the outer call manages the transaction lifecycle
- Savepoints allow partial rollbacks within a transaction
- The `TransactionManager` handles the actual transaction lifecycle
