# Repository Registry

## Overview

The Repository Registry provides a centralized service locator for all repositories in the application. Every repository registers itself with a unique name and can be resolved by any consumer without direct imports.

## Architecture

The registry is a singleton (`RepositoryRegistry.getInstance()`) that maintains an internal `Map<string, IRepository>`.

## API

### Registration

```typescript
import { registerRepository } from "@/server/persistence";

// Register a repository
registerRepository("users", userRepository);
registerRepository("accounts", accountRepository);
```

### Resolution

```typescript
import { resolveRepository } from "@/server/persistence";
import type { IRepository } from "@/server/persistence";
import type { User } from "@/types";

const userRepo = resolveRepository<User>("users");
const user = await userRepo.findById("123");
```

### Registry Methods

| Method | Description |
|---|---|
| `register(name, repo)` | Register a repository |
| `resolve(name)` | Get a repository by name |
| `has(name)` | Check if registered |
| `getAll()` | Get all repositories |
| `getNames()` | Get all registered names |
| `count()` | Get registration count |
| `unregister(name)` | Remove a repository |
| `clear()` | Remove all repositories |

## Rules

- No direct imports between repositories
- All repositories resolved through the registry
- Repository names are unique strings (convention: plural lowercase, e.g., "users", "accounts", "transactions")
- Throws `RepositoryNotFoundError` if resolving an unregistered name
